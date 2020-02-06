const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiHttp = require('chai-http');
const moment = require('moment');
const find = require('lodash/find');

const config = require('../../config.json');
const app = require('../../app');
const helpers = require('../helpers');

chai.use(chaiAsPromised);
chai.use(chaiHttp);
const { expect } = chai;

describe('StockValue EndPoints', function() {
  before(async function() {
    await helpers.initDb();
  });
  afterEach(async function() {
    await helpers.resetDb();
  });
  describe('Get leaderboard', function () {
    let teslaId;
    let appleId;
    let microsoftId;
    let bobId;
    let joeyId;
    before(async function() {
      const startDate = moment(config.thisYearStartDate).toDate();
      const yesterday = moment().subtract(1, 'day').startOf('day').toDate();
      const now = moment().startOf('day').toDate();
      teslaId = await helpers.addTestStock({
        name: 'Tesla, Inc.',
        ticker: 'TSLA',
        exchange: 'NASDAQ',
      });
      await helpers.addTestStockValue(teslaId, {
        value: 1,
        date: startDate,
      });
      await helpers.addTestStockValue(teslaId, {
        value: 1.5,
        date: yesterday,
      });
      await helpers.addTestStockValue(teslaId, {
        value: 2,
        date: now,
      });
      appleId = await helpers.addTestStock({
        name: 'Apple, Inc.',
        ticker: 'AAPL',
        exchange: 'NASDAQ',
      });
      await helpers.addTestStockValue(appleId, {
        value: 10,
        date: startDate,
      });
      await helpers.addTestStockValue(appleId, {
        value: 15,
        date: yesterday,
      });
      await helpers.addTestStockValue(appleId, {
        value: 20,
        date: now,
      });
      microsoftId = await helpers.addTestStock({
        name: 'Microsoft Corporation',
        ticker: 'MFST',
        exchange: 'NASDAQ',
      });
      await helpers.addTestStockValue(microsoftId, {
        value: 200,
        date: startDate,
      });
      await helpers.addTestStockValue(microsoftId, {
        value: 150,
        date: yesterday,
      });
      await helpers.addTestStockValue(microsoftId, {
        value: 100,
        date: now,
      });
      bobId = await helpers.addTestMember({
        firstName: 'Bob',
        lastName: 'Loblaw',
        email: 'blah@blah.blah',
      });
      joeyId = await helpers.addTestMember({
        firstName: 'Joey',
        lastName: 'Shabidoo',
        email: 'joey@joejoe.shabidoo',
      });
      await helpers.addTestPick(teslaId, bobId, { startDate, ratio: 0.25 });
      await helpers.addTestPick(appleId, bobId, { startDate, ratio: 0.75 });
      await helpers.addTestPick(appleId, joeyId, { startDate, ratio: 0.5 });
      await helpers.addTestPick(microsoftId, joeyId, { startDate, ratio: 0.5 });
    });
    it('should return the leaderboard', async function() {
      const response = await chai.request(app).get('/leaderboard');
      expect(response.status).to.eql(200);
      expect(response.body.leaderboard).to.exist;
      expect(response.body.leaderboard.length).to.eql(2);
      const { leaderboard } = response.body;
      const bob = find(leaderboard, { memberId: bobId });
      expect(bob.firstName).to.eql('Bob');
      expect(bob.lastName).to.eql('Loblaw');
      expect(bob.increase).to.eql(1);
      const joey = find(leaderboard, { memberId: joeyId });
      expect(joey.firstName).to.eql('Joey');
      expect(joey.lastName).to.eql('Shabidoo');
      expect(joey.increase).to.eql(0.25);
    });
  });
});