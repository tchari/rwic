const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const StockValueQueries = require('../../Queries/StockValues');
const helpers = require('../helpers');
chai.use(chaiAsPromised);
const { expect } = chai;

describe('StockValue Queries', function() {
  before(async function() {
    await helpers.resetDb();
  });
  afterEach(async function() {
    await helpers.resetDb();
  });
  describe('Successfully Add Stock Value', function() {
    let stock;
    before(async function () {
      stock = await helpers.addTestStock();
    });
    it('should return the stockValueId', function(done) {
      StockValueQueries.addStockValue({
        stockId: stock.id,
        value: 123.32,
        date: new Date(),
      }).then(stockValue => {
        expect(stockValue.id).to.be.above(0);
        expect(stockValue.value).to.eql(123.32);
        expect(stockValue.date).to.exist;
        expect(stockValue.stockId).to.eql(stock.id);
        done();
      }).catch(e => {
        done(e);
      });
    });
  });
});
