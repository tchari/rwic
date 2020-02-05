const knex = require('./initConnection');
const tables = require('./tables');

const { STOCK, PICKS } = tables;

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

async function getActiveStocks() {
  const activeStocks = await knex.select()
    .from(STOCK)
    .innerJoin(PICKS, `${STOCK}.id`, `${PICKS}.stock_id`)
    .where(`${PICKS}.active`, true);
  return activeStocks;
}

module.exports.init = init;
module.exports.addStock = addStock;
module.exports.getActiveStocks = getActiveStocks;
