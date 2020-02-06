const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiHttp = require('chai-http');
const moment = require('moment');

const app = require('../../app');
const helpers = require('../helpers');
const deactivatePick = require('../../Queries/Picks').deactivatePick;

chai.use(chaiAsPromised);
chai.use(chaiHttp);
const { expect } = chai;

describe('Stock EndPoints', function() {
  before(async function() {
    await helpers.initDb();
  });
  afterEach(async function() {
    await helpers.resetDb();
  });
  describe('Add Stock', function () {
    it('should return the stock id', async function () {
      const response = await chai.request(app)
        .post('/stocks')
        .send({
          name: 'Blarg, Inc.',
          ticker: 'BLRG',
          exchange: 'BLARGITYBLARG',
        });
      expect(response.status).to.eql(200);
      expect(response.body.id).to.exist;
    });
  });
  describe('Get a stock', function () {
    let stockId;
    before(async function () {
      stockId = await helpers.addTestStock({
        name: 'Acme, Inc.',
        ticker: 'ACME',
        exchange: 'XCNGE'
      });
    });
    it('should return the stock id', async function () {
      const response = await chai.request(app).get(`/stocks/${stockId}`);
      expect(response.status).to.eql(200);
      expect(response.body.id).to.eql(stockId);
      expect(response.body.created_at).to.exist;
      expect(response.body.updated_at).to.exist;
      expect(response.body.name).to.eql('Acme, Inc.');
      expect(response.body.ticker).to.eql('ACME');
      expect(response.body.exchange).to.eql('XCNGE');
    });
  });
  describe('Get active stocks', function () {
    let acmeId;
    let otherId;
    let unusedId;
    let memberId;
    before(async function () {
      memberId = await helpers.addTestMember();
      acmeId = await helpers.addTestStock({
        name: 'Acme, Inc.',
        ticker: 'ACME',
        exchange: 'XCNGE'
      });
      otherId = await helpers.addTestStock({
        name: 'Other, Inc.',
        ticker: 'OTHR',
        exchange: 'XCNGE'
      });
      unusedId = await helpers.addTestStock({
        name: 'Unused, Inc.',
        ticker: 'UUUD',
        exchange: 'XCNGE'
      });
      await helpers.addTestPick(acmeId, memberId, { ratio: 0.6 });
      await helpers.addTestPick(otherId, memberId, { ratio: 0.4 });
      const lastYear = moment().subtract(1, 'years').toDate();
      const pickIdToDeactivate = await helpers.addTestPick(unusedId, memberId, { ratio: 1, startDate: lastYear });
      await deactivatePick(pickIdToDeactivate);
    });
    it('should return a list of active stocks', async function () {
      const response = await chai.request(app).get('/stocks');
      expect(response.status).to.eql(200);
      expect(response.body.stocks.length).to.eql(2);
      const ids = response.body.stocks.map(stock => stock.id);
      expect(ids).to.include(acmeId);
      expect(ids).to.include(otherId);
    });
  });
});