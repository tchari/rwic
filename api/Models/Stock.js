const yup = require('yup');
const Entity = require('./Entity');

class Stock extends Entity {
  /**
   * Construct a stock
   *
   * @param {object} stock 
   */
  constructor(stock) {
    super(stock);
    this.validate(stock);
    this.name = stock.name;
    this.ticker = stock.ticker;
    this.mic = stock.mic;
    this.exchange = stock.exchange;
  }

  /**
   * Validate a stock
   *
   * @param {object} stock
   */
  validate(stock) {
    yup.object().shape({
      name: yup.string().required(),
      ticker: yup.string().required(),
      mic: yup.string().required(), // can be any mic, not just ones supported by marketstack
      exchange: yup.string().required(), // @todo link to the iso10383 names
    }).validateSync(stock);
  }
}

module.exports = Stock;
