const knex = require('./initConnection');
const { init: initMembers } = require('./Members');
const { init: initPicks } = require('./Picks');
const { init: initStocks } = require('./Stocks');
const { init: initStockValues } = require('./StockValues');
const tables = require('./tables');

async function initDb() {
  // drop order matters as PICKS and STOCK_VALUE have foreign key constraints
  await knex.schema.dropTableIfExists(tables.PICK);
  await knex.schema.dropTableIfExists(tables.STOCK_VALUE);
  await knex.schema.dropTableIfExists(tables.MEMBER);
  await knex.schema.dropTableIfExists(tables.STOCK);
  await initMembers();
  await initStocks();
  await initPicks();
  await initStockValues();
  return 'ok';
}

module.exports = initDb;
