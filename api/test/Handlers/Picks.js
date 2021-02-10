const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiHttp = require('chai-http');
const moment = require('moment');

const app = require('../../app');
const helpers = require('../helpers');

chai.use(chaiAsPromised);
chai.use(chaiHttp);
const { expect } = chai;
const token = helpers.token;

describe('Pick EndPoints', function() {
  before(async function() {
    await helpers.resetDb();
  });
  afterEach(async function() {
    await helpers.resetDb();
  });
  describe('Add Pick', function () {
    let member;
    let stock;
    before(async function () {
      member = await helpers.addTestMember();
      stock = await helpers.addTestStock();
    });
    it('should return a pick id', async function () {
      const response = await chai.request(app)
        .post('/api/picks')
        .set('Authorization', `bearer ${token}`)
        .send({
          email: member.email,
          ticker: stock.ticker,
          startDate: moment().startOf('day').toDate(),
          position: 'long',
          ratio: 0.12,
        });
      expect(response.status).to.eql(200);
      expect(response.body.id).to.exist;
    });
  });
  describe('Get a Pick', function () {
    let pick;
    let member;
    let stock;
    const startDate = moment().startOf('day');
    before(async function () {
      member = await helpers.addTestMember();
      stock = await helpers.addTestStock();
      pick = await helpers.addTestPick(stock.id, member.id, { ratio: 0.1, startDate: startDate.toDate() });
    });
    it('should return a pick', async function () {
      const response = await chai.request(app).get(`/api/picks/${pick.id}`).set('Authorization', `bearer ${token}`);
      expect(response.status).to.eql(200);
      expect(response.body.id).to.eql(pick.id);
      expect(response.body.active).to.be.true;
      expect(response.body.memberId).to.eql(member.id);
      expect(response.body.stockId).to.eql(stock.id);
      expect(response.body.ratio).to.eql(0.1);
      expect(response.body.startDate).to.exist;
      const actualTs = moment(response.body.startDate).valueOf();
      const expectedTs = startDate.valueOf();
      expect(actualTs).to.eql(expectedTs);
    });
  });
  describe('Deactivate a Pick', function () {
    let pick;
    before(async function () {
      const member = await helpers.addTestMember();
      const stock = await helpers.addTestStock();
      pick = await helpers.addTestPick(stock.id, member.id);
    });
    it('should return a pickId', async function () {
      const deactivateResponse = await chai.request(app).patch(`/api/picks/${pick.id}/deactivate`).set('Authorization', `bearer ${token}`);
      expect(deactivateResponse.status).to.eql(200);
      expect(deactivateResponse.body.id).to.eql(pick.id);
      const pickResponse = await chai.request(app).get(`/api/picks/${pick.id}`).set('Authorization', `bearer ${token}`);
      expect(pickResponse.body.active).to.be.false;
    });
  });
  describe('Activate a Pick', function () {
    let pick;
    before(async function () {
      const member = await helpers.addTestMember();
      const stock = await helpers.addTestStock();
      pick = await helpers.addTestPick(stock.id, member.id);
      await chai.request(app).patch(`/api/picks/${pick.id}/deactivate`);
    });
    it('should return a pickId', async function () {
      const deactivateResponse = await chai.request(app).patch(`/api/picks/${pick.id}/activate`).set('Authorization', `bearer ${token}`);
      expect(deactivateResponse.status).to.eql(200);
      expect(deactivateResponse.body.id).to.eql(pick.id);
      const pickResponse = await chai.request(app).get(`/api/picks/${pick.id}`).set('Authorization', `bearer ${token}`);
      expect(pickResponse.body.active).to.be.true;
    });
  });
  describe('Add picks', function () {
    let member;
    let abcdStock;
    let xkcdStock;
    before(async function () {
      member = await helpers.addTestMember();
      abcdStock = await helpers.addTestStock({ ticker: 'ABCD', name: 'ABCD Corp' });
      xkcdStock = await helpers.addTestStock({ ticker: 'XKCD', name: 'XKCD Corp' });
      await chai.request(app).patch(`/api/`);
    });
    it('should add two picks', async function () {
      const addPicksRes = await chai.request(app).post('/api/picks')
        .set('Authorization', `bearer ${token}`)
        .send([
          {
            email: member.email,
            ticker: abcdStock.ticker,
            startDate: moment().startOf('day').toDate(),
            position: 'long',
            ratio: 0.25,
          },
          {
            email: member.email,
            ticker: xkcdStock.ticker,
            startDate: moment().startOf('day').toDate(),
            position: 'long',
            ratio: 0.75,
          }
        ]);
      expect(addPicksRes.status).to.eql(200);
      expect(addPicksRes.body.length).to.eql(2);
    });
  });
});
