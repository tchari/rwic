const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const moment = require('moment');

const config = require('../../config.json');
const StockValueQueries = require('../../Queries/StockValues');
const helpers = require('../helpers');
chai.use(chaiAsPromised);
const { assert, expect } = chai;

describe('StockValues', function() {
  before(async function() {
    await helpers.initDb();
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
});
