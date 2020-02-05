const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const moment = require('moment');

const config = require('../../config.json');
const initDb = require('../../Queries/initDatabase');
const StockValueQueries = require('../../Queries/StockValues');
const helpers = require('../helpers');
chai.use(chaiAsPromised);
const { assert, expect } = chai;

describe('StockValues', function() {
  before(async function() {
    await initDb();
  });
  afterEach(async function() {
    await helpers.resetDb();
  });
  describe('Successfully Add Stock Value', function() {
    let stockId;
    before(async function () {
      stockId = await helpers.addTestStock();
    });
    it('should return the stockValueId', function() {
      StockValueQueries.addStockValue({
        stockId,
        value: 123.32,
        date: new Date(),
      }).then(stockValueId => {
        assert.isNumber(stockValueId);
        expect(stockValueId).to.be.above(0);
      });
    });
  });
  describe('Get Year-to-Date Leaderboard data', function() {
    let teslaId;
    let appleId;
    let microsoftId;
    let bobId;
    let joeyId;
    before(async function () {
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
    it('should return the 8 results of leader board info', async function() {
      const results = await StockValueQueries.getYearToDateLeaderboard();
      expect(results.length).eql(8);
      results.forEach(result => {
        expect(result).to.have.property('value');
        expect(result).to.have.property('stockId');
        expect(result).to.have.property('date');
        expect(result).to.have.property('memberId');
        expect(result).to.have.property('firstName');
        expect(result).to.have.property('lastName');
        expect(result).to.have.property('ratio');
      });
    });
  });
});
