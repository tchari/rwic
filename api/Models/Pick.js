const yup = require('yup');
const Entity = require('./Entity');
const Position = require('./Position');

class Pick extends Entity {
  /**
   * Construct a pick
   *
   * @param {object} pick 
   */
  constructor(pick) {
    super(pick);
    this.validate(pick);
    this.memberId = pick.memberId;
    this.stockId = pick.stockId;
    this.startDate = pick.startDate;
    this.active = pick.active;
    this.ratio = pick.ratio; // ratio of the entire portfolio
    this.position = pick.position;
  }

  /**
   * Validate a pick
   *
   * @param {object} pick 
   */
  validate(pick) {
    yup.object().shape({
      memberId: yup.number().integer().positive().required(),
      stockId: yup.number().integer().positive().required(),
      ratio: yup.number().positive().max(1).required(),
      startDate: yup.date().required(),
      active: yup.bool().strict(),
      position: yup.mixed().oneOf(Object.values(Position)).required(),
    }).validateSync(pick);
  }
}

module.exports = Pick;
