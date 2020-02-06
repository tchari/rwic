const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiHttp = require('chai-http');
const moment = require('moment');

const app = require('../../app');
const helpers = require('../helpers');

chai.use(chaiAsPromised);
chai.use(chaiHttp);
const { expect } = chai;

describe('Pick EndPoints', function() {
  before(async function() {
    await helpers.initDb();
  });
  afterEach(async function() {
    await helpers.resetDb();
  });
  describe('Add Pick', function () {
    let memberId;
    let stockId;
    before(async function () {
      memberId = await helpers.addTestMember();
      stockId = await helpers.addTestStock();
    });
    it('should return a pick id', async function () {
      const response = await chai.request(app)
        .post('/picks')
        .send({
          memberId,
          stockId,
          startDate: moment().startOf('day').toDate(),
          ratio: 0.12,
        });
      expect(response.status).to.eql(200);
      expect(response.body.id).to.exist;
    });
  });
  describe('Get a Pick', function () {
    let pickId;
    let memberId;
    let stockId;
    const startDate = moment().startOf('day');
    before(async function () {
      memberId = await helpers.addTestMember();
      stockId = await helpers.addTestStock();
      pickId = await helpers.addTestPick(stockId, memberId, { ratio: 0.1, startDate: startDate.toDate() });
    });
    it('should return a pick', async function () {
      const response = await chai.request(app).get(`/picks/${pickId}`);
      expect(response.status).to.eql(200);
      expect(response.body.id).to.eql(pickId);
      expect(response.body.active).to.be.true;
      expect(response.body.memberId).to.eql(memberId);
      expect(response.body.stockId).to.eql(stockId);
      expect(response.body.ratio).to.eql(0.1);
      expect(response.body.startDate).to.exist;
      const actualTs = moment(response.body.startDate).valueOf();
      const expectedTs = startDate.valueOf();
      expect(actualTs).to.eql(expectedTs);
    });
  });
  describe('Deactivate a Pick', function () {
    let pickId;
    before(async function () {
      const memberId = await helpers.addTestMember();
      const stockId = await helpers.addTestStock();
      pickId = await helpers.addTestPick(stockId, memberId);
    });
    it('should return a pickId', async function () {
      const deactivateResponse = await chai.request(app).patch(`/picks/${pickId}/deactivate`);
      expect(deactivateResponse.status).to.eql(200);
      expect(deactivateResponse.body.id).to.eql(pickId);
      const pickResponse = await chai.request(app).get(`/picks/${pickId}`);
      expect(pickResponse.body.active).to.be.false;
    });
  });
  describe('Activate a Pick', function () {
    let pickId;
    before(async function () {
      const memberId = await helpers.addTestMember();
      const stockId = await helpers.addTestStock();
      pickId = await helpers.addTestPick(stockId, memberId);
      await chai.request(app).patch(`/picks/${pickId}/deactivate`);
    });
    it('should return a pickId', async function () {
      const deactivateResponse = await chai.request(app).patch(`/picks/${pickId}/activate`);
      expect(deactivateResponse.status).to.eql(200);
      expect(deactivateResponse.body.id).to.eql(pickId);
      const pickResponse = await chai.request(app).get(`/picks/${pickId}`);
      expect(pickResponse.body.active).to.be.true;
    });
  });
});
