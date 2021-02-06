const yup = require('yup');
const Entity = require('./Entity');

/**
 * Value of a stock over time
 */
class StockValue extends Entity {

  /**
   * Construct a stock value
   *
   * @param {object} stockValue 
   */
  constructor(stockValue) {
    super(stockValue);
    this.validate(stockValue);
    this.stockId = stockValue.stockId;
    this.value = stockValue.value;
    this.date = stockValue.date;
  }

  /**
   * Validate a stock value
   *
   * @param {object} stockValue 
   */
  validate(stockValue) {
    yup.object().shape({
      stockId: yup.number().integer().positive().required(),
      value: yup.number().positive().required(),
      date: yup.date().required(),
    }).validateSync(stockValue);
  }
}

module.exports = StockValue;
