const yup = require('yup');
const Entity = require('./Entity');

class Pick extends Entity {
  constructor(pick) {
    super(pick);
    this.validate(pick);
    this.memberId = pick.memberId;
    this.stockId = pick.stockId;
    this.startDate = pick.startDate;
    this.active = pick.active;
    this.ratio = pick.ratio;
  }

  validate(pick) {
    yup.object().shape({
      memberId: yup.number().integer().positive().required(),
      stockId: yup.number().integer().positive().required(),
      ratio: yup.number().positive().max(1).required(),
      startDate: yup.date().required(),
      active: yup.bool().strict(),
    }).validateSync(pick);
  }
}

module.exports = Pick;
