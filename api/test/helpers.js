const knex = require('../Queries/initConnection');
const MemberQueries = require('../Queries/Members');
const StockQueries = require('../Queries/Stocks');
const StockValueQueries = require('../Queries/StockValues');
const PickQueries = require('../Queries/Picks');
const tables = require('../Queries/tables');

function addTestMember(overrides = {}) {
  const defaults = {
    firstName: 'testFirstName',
    lastName: 'testLastName',
    email: 'some@email.com',
  };
  const params = {
    ...defaults,
    ...overrides,
  };
  return MemberQueries.addMember(params);
}

function addTestStock(overrides = {}) {
  const defaults = {
    name: 'Tesla, Inc.',
    ticker: 'TSLA',
    exchange: 'NASDAQ',
  };
  const params = {
    ...defaults,
    ...overrides,
  };
  return StockQueries.addStock(params);
}

function addTestStockValue(stockId, overrides = {}) {
  const defaults = {
    value: 123.32,
    date: new Date(),
  };
  const params = {
    ...defaults,
    ...overrides,
    stockId,
  };
  return StockValueQueries.addStockValue(params);
}

function addTestPick(stockId, memberId, overrides = {}) {
  const defaults = {
    startDate: new Date(),
    ratio: 1,
  };
  const params = {
    ...defaults,
    ...overrides,
    stockId,
    memberId,
  };
  return PickQueries.addPick(params);
}

async function resetDb() {
  await knex(tables.PICK).del();
  await knex(tables.STOCK_VALUE).del();
  await knex(tables.MEMBER).del();
  await knex(tables.STOCK).del();
}

async function initDb() {
  await knex.schema.dropTableIfExists(tables.PICK);
  await knex.schema.dropTableIfExists(tables.STOCK_VALUE);
  await knex.schema.dropTableIfExists(tables.MEMBER);
  await knex.schema.dropTableIfExists(tables.STOCK);
  await MemberQueries.init();
  await StockQueries.init();
  await PickQueries.init();
  await StockValueQueries.init();
}

module.exports.addTestMember = addTestMember;
module.exports.addTestStock = addTestStock;
module.exports.addTestStockValue = addTestStockValue;
module.exports.addTestPick = addTestPick;
module.exports.resetDb = resetDb;
module.exports.initDb = initDb;