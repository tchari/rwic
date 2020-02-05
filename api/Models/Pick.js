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
  }

  validate(pick) {
    yup.object().shape({
      memberId: yup.number().integer().postive().required(),
      stockId: yup.number().integer().postive().required(),
      startDate: yup.date().required(),
      active: yup.bool(),
    }).isValid(pick);
  }
}

module.exports = Pick;
