const knex = require('./initConnection');
const tables = require('./tables');

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
  const values = await knex(STOCK).insert(stock);
  const stockId = values[0];
  return stockId;
}

async function getStock(stockId) {
  const result = await knex(STOCK).select().where({ id: stockId });
  return result[0]; // should only have 1 result
}

async function getActiveStocks() {
  const activeStocks = await knex(STOCK)
    .join(PICK, `${STOCK}.id`, '=', `${PICK}.stockId`)
    .where(`${PICK}.active`, true);
  return activeStocks;
}

module.exports.init = init;
module.exports.addStock = addStock;
module.exports.getStock = getStock;
module.exports.getActiveStocks = getActiveStocks;
