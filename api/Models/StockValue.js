const yup = require('yup');
const Entity = require('./Entity');

class StockValue extends Entity {
  constructor(stockValue) {
    super(stockValue);
    this.validate(stockValue);
    this.stockId = stockValue.stockId;
    this.value = stockValue.value;
    this.date = stockValue.date;
  }

  validate(stockValue) {
    yup.object().shape({
      stockId: yup.number().integer().postive().required(),
      value: yup.number().postive().required(),
      date: yup.date().required(),
    }).isValid(stockValue);
  }
}

module.exports = StockValue;
