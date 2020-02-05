const yup = require('yup');

class Entity {
  constructor(entity) {
    this.validate(entity);
    // id, created_at, and updated_at may not be defined in the case where we're adding the a member to the db
    if (entity.id) {
      this.id = entity.id;
    }
    if (entity.created_at) {
      this.created_at = entity.created_at;
    }
    if (entity.updated_at) {
      this.updated_at = entity.updated_at;
    }
  }

  validate(entity) {
    yup.object().shape({
      created_at: yup.number().integer().positive(),
      updated_at: yup.number().integer().positive(),
      id: yup.number().integer().positive(),
    }).validateSync(entity);
  }
}

module.exports = Entity;
