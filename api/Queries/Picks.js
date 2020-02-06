const knex = require('./initConnection');
const tables = require('./tables');
const Pick = require('../Models/Pick');

const { PICK, MEMBER, STOCK } = tables;

function init() {
  return knex.schema.createTable(PICK, function (table) {
    table.increments();
    table.integer('memberId').unsigned().notNullable();
    table.foreign('memberId').references(`${MEMBER}.id`); // foreign key to member.id
    table.integer('stockId').unsigned().notNullable();
    table.foreign('stockId').references(`${STOCK}.id`); // foreign key to stock.id
    table.decimal('ratio', 4, 3).notNullable(); // up to 1.000
    table.date('startDate').notNullable();
    table.boolean('active').notNullable();
    table.timestamps(false, true);
  });
}

/**
 * Add a new, active pick
 *
 * @param {object} pick 
 */
async function addPick(pick) {
  await knex(PICK).insert({ ...pick, active: true });
  const result = await knex(PICK).select().whereRaw('id = last_insert_id()');
  const newPick = result[0];
  return new Pick({ ...newPick, active: newPick.active ? true : false});
}

/**
 * Get a pick
 *
 * @param {object} pick 
 */
async function getPick(pickId) {
  const result = await knex(PICK).select().where({ id: pickId });
  return result[0];
}

async function deactivatePick(pickId) {
  await knex(PICK).update({ active: false }).where({ id: pickId });
}

async function activatePick(pickId) {
  await knex(PICK).update({ active: true }).where({ id: pickId });
}

module.exports.init = init;
module.exports.addPick = addPick;
module.exports.getPick = getPick;
module.exports.deactivatePick = deactivatePick;
module.exports.activatePick = activatePick;