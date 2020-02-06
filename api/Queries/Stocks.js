const knex = require('./initConnection');
const tables = require('./tables');
const Stock = require('../Models/Stock');

const { STOCK, PICK } = tables;

function init() {
  return knex.schema.createTable(STOCK, function (table) {
    table.increments();
    table.string('name').notNullable();
    table.string('ticker').notNullable();
    table.string('exchange').notNullable();
    table.timestamps(false, true);
  });
}

async function addStock(stock) {
  await knex(STOCK).insert(stock);
  const added = await knex(STOCK).select().whereRaw('id = last_insert_id()');
  return new Stock(added[0]);
}

async function getStock(stockId) {
  const result = await knex(STOCK).select().where({ id: stockId });
  return result[0]; // should only have 1 result
}

async function getActiveStocks() {
  return await knex(STOCK)
    .select(`${STOCK}.*`)
    .join(PICK, `${STOCK}.id`, '=', `${PICK}.stockId`)
    .where(`${PICK}.active`, true)
    .groupBy(`${STOCK}.id`);
}

module.exports.init = init;
module.exports.addStock = addStock;
module.exports.getStock = getStock;
module.exports.getActiveStocks = getActiveStocks;
