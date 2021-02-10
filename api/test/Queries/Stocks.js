const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const StockQueries = require('../../Queries/Stocks');
const helpers = require('../helpers');
chai.use(chaiAsPromised);
const { expect } = chai;

describe('Stock Queries', function() {
  before(async function() {
    await helpers.resetDb();
  });
  afterEach(async function() {
    await helpers.resetDb();
  });
  describe('Successfully Add Stock', function() {
    it('should return the stockId', function(done) {
      StockQueries.addStock({
        name: 'Tesla, Inc.',
        ticker: 'TSLA',
        mic: 'XNAS',
        exchange: 'NASDAQ'
      }).then(stock => {
        expect(stock.id).to.be.above(0);
        expect(stock.created_at).to.exist;
        expect(stock.updated_at).to.exist;
        expect(stock.name).to.eql('Tesla, Inc.');
        expect(stock.ticker).to.eql('TSLA');
        expect(stock.mic).to.eql('XNAS');
        done();
      }).catch(e => {
        done(e);
      });
    });
  });
});
