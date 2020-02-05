const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const initDb = require('../../Queries/initDatabase');
const StockQueries = require('../../Queries/Stocks');
const helpers = require('../helpers');
chai.use(chaiAsPromised);
const { assert, expect } = chai;

describe('Stocks', function() {
  before(async function() {
    await initDb();
  });
  afterEach(async function() {
    await helpers.resetDb();
  });
  describe('Successfully Add Stock', function() {
    it('should return the stockId', function() {
      StockQueries.addStock({
        name: 'Tesla, Inc.',
        ticker: 'TSLA',
        exchange: 'NASDAQ',
      }).then(stockId => {
        assert.isNumber(stockId);
        expect(stockId).to.be.above(0);
      });
    });
  });
});
