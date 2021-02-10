const knex = require('./initConnection');
const tables = require('./tables');
const Pick = require('../Models/Pick');
const Stock = require('../Models/Stock');
const Member = require('../Models/Member');

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
    table.boolean('active').notNullable().defaultTo(true);
    table.string('position').notNullable();
    table.string('pickCode').unique().notNullable(); // unique identifier for picks
    table.timestamps(false, true);
  });
}

/**
 * Add a new, active pick
 *
 * @param {object} pick 
 */
async function addPick(pick) {
  const insertablePick = await makeInsertablePick(pick);
  await knex(PICK).insert({ ...insertablePick, pickCode: makePickCode(insertablePick) });
  const result = await knex(PICK).select().whereRaw('id = last_insert_id()');
  const newPick = result[0];
  return new Pick({ ...newPick, active: newPick.active ? true : false});
}

async function addPicks(picks) {
  const insertablePicks = [];
  for (const pick of picks) {
    const iPick = await makeInsertablePick(pick);
    insertablePicks.push({ ...iPick, pickCode: makePickCode(iPick) });
  }
  const result = await knex(PICK).insert(insertablePicks);
  const firstId = result[0];
  const added = await knex(PICK).select().whereRaw('id >= ? and id < ?', [firstId, firstId + picks.length]);
  return added.map(p => new Pick({ ...p, active: !!p.active }));
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

function makePickCode(pick) {
  return `${pick.memberId}-${pick.stockId}-${pick.active}`;
}

/**
 * Allows us to add a pick by ticker and/or by email instead of tickerId or memberId
 * 
 * @param {object} pick
 */
async function makeInsertablePick(pick) {
  const newPick = { ...pick };
  if (pick.ticker) {
    const result = await knex(STOCK).select().where('ticker', '=', pick.ticker);
    const stock = new Stock(result[0]);
    newPick.stockId = stock.id;
    delete newPick.ticker;
  }
  if (pick.email) {
    const result = await knex(MEMBER).select().where('email', '=', pick.email);
    const member = new Member(result[0]);
    newPick.memberId = member.id;
    delete newPick.email;
  }
  if (!('active' in pick)) {
    newPick.active = true;
  }
  return newPick;
}

module.exports.init = init;
module.exports.addPick = addPick;
module.exports.addPicks = addPicks;
module.exports.getPick = getPick;
module.exports.deactivatePick = deactivatePick;
module.exports.activatePick = activatePick;