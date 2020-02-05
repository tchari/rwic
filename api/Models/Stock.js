const yup = require('yup');
const Entity = require('./Entity');

class Stock extends Entity {
  constructor(stock) {
    super(stock);
    this.validate(stock);
    this.name = stock.name;
    this.ticker = stock.ticker;
    this.exchange = stock.exchange;
  }

  validate(stock) {
    yup.object().shape({
      name: yup.string().required(),
      ticker: yup.string().required(),
      exchange: yup.string().required(),
    }).isValid(stock);
  }
}

module.exports = Stock;
