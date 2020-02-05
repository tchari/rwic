const yup = require('yup');

class Entity {
  constructor(entity) {
    this.validate(entity);
    // id, created, and modified may not be defined in the case where we're adding the a member to the db
    if (entity.id) {
      this.id = entity.id;
    }
    if (entity.created) {
      this.created = entity.created;
    }
    if (entity.modified) {
      this.modified = entity.modified;
    }
  }

  validate(entity) {
    yup.object().shape({
      created_at: yup.number().integer().positive(),
      modified_at: yup.number().integer().positive(),
      id: yup.number().integer().positive(),
    }).isValid(entity);
  }
}

module.exports = Entity;
