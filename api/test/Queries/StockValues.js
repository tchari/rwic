const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const find = require('lodash/find');

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
  describe('Successfully Add Many Stock Values', function() {
    let stockA;
    let stockB;
    let stockC;
    before(async function () {
      stockA = await helpers.addTestStock({ name: 'StockA', ticker: 'SA' });
      stockB = await helpers.addTestStock({ name: 'StockB', ticker: 'SB' });
      stockC = await helpers.addTestStock({ name: 'StockC', ticker: 'SC' });
    });
    it('should return the stockValueId', function(done) {
      StockValueQueries.addStockValues([
        { stockId: stockB.id, value: 111.11, date: new Date() },
        { stockId: stockA.id, value: 2222.22, date: new Date() },
        { stockId: stockC.id, value: 33333.33, date: new Date() },
      ]).then(stockValues => {
        expect(stockValues.length).to.eql(3);
        const foundStockAValue = find(stockValues, { stockId: stockA.id });
        expect(foundStockAValue).to.exist;
        expect(foundStockAValue.value).to.eql(2222.22);
        const foundStockBValue = find(stockValues, { stockId: stockB.id });
        expect(foundStockBValue).to.exist;
        expect(foundStockBValue.value).to.eql(111.11);
        const foundStockCValue = find(stockValues, { stockId: stockC.id });
        expect(foundStockCValue).to.exist;
        expect(foundStockCValue.value).to.eql(33333.33);
        done();
      }).catch(e => {
        done(e);
      });
    });
  });
});
