const knex = require('knex');
const merge = require('lodash/merge');
const secrets = require('../secrets.json');
const dbParams = require('./dbParams');

const params = merge(secrets.dbParams, dbParams);

const instance = knex({
  ...params,
});

module.exports = instance;
