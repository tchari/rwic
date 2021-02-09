const yup = require('yup');
const Entity = require('./Entity');
const config = require('../config.json');

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
      mic: yup.mixed().oneOf(config.stockApi.allowedMICs)
    }).validateSync(stock);
  }
}

module.exports = Stock;
