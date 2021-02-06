const yup = require('yup');
const Entity = require('./Entity');

/**
 * A member entity
 */
class Member extends Entity {
  /**
   * Construct a member
   *
   * @param {object} member 
   */
  constructor(member) {
    super(member);
    this.validate(member);
    this.firstName = member.firstName;
    this.lastName = member.lastName;
    this.email = member.email;
  }

  /**
   * Validate member entity
   *
   * @param {object} member 
   */
  validate(member) {
    yup.object().shape({
      firstName: yup.string().strict().required(),
      lastName: yup.string().strict().required(),
      email: yup.string().email().required(),
    }).validateSync(member);
  }
}

module.exports = Member;