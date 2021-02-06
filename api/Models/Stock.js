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
      exchange: yup.string().required(),
    }).validateSync(stock);
  }
}

module.exports = Stock;
