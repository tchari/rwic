const yup = require('yup');
const Entity = require('./Entity');

class Member extends Entity {
  constructor(member) {
    super(member);
    this.validate(member);
    this.firstName = member.firstName;
    this.lastName = member.lastName;
    this.email = member.email;
  }

  validate(member) {
    yup.object().shape({
      firstName: yup.string().required(),
      lastName: yup.string().required(),
      email: yup.email().required(),
    }).isValid(member);
  }
}

module.exports = Member;