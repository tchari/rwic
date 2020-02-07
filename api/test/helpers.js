const jwt = require('jsonwebtoken');
const knex = require('../Queries/initConnection');
const MemberQueries = require('../Queries/Members');
const StockQueries = require('../Queries/Stocks');
const StockValueQueries = require('../Queries/StockValues');
const PickQueries = require('../Queries/Picks');
const tables = require('../Queries/tables');
const secrets = require('../secrets.json');
const { defaultPayload } = require('../Handlers/Auth');
const Position = require('../Models/Position');

/**
 * Add a member
 *
 * @param {Object} overrides overrides object
 * @param {string} overrides.firstName member's first name
 * @param {string} overrides.lastName member's last name
 * @param {string} overrides.email member's email address
 * 
 * @return {Promise} promise that should resolve with the added member
 */
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

/**
 * Add a stock
 *
 * @param {Object} overrides overrides object
 * @param {string} overrides.name stock name
 * @param {string} overrides.ticker stock ticker symbol
 * @param {string} overrides.exchange stock's exchange
 * 
 * @return {Promise} promise that should resolve with the added stock
 */
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

/**
 * Add a value for a stock
 *
 * @param {number} stockId the id of the stock this stock value belongs to
 * @param {Object} overrides overrides object
 * @param {string} overrides.value close price (value) of the stock
 * @param {string} overrides.date date of this stock value
 * 
 * @return {Promise} promise that should resolve with the added stock value
 */
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

/**
 * Add a pick for a stock and a member
 *
 * @param {number} stockId the id of the stock that is picked
 * @param {number} memberId the id of the member that picked
 * @param {Object} overrides overrides object
 * @param {Date} overrides.startDate the date this stock was picked (n.b. NOT created!)
 * @param {string} overrides.ratio the selection ratio of this pick to the rest of the member's active picks for the year
 * 
 * @return {Promise} promise that should resolve with the added pick
 */
function addTestPick(stockId, memberId, overrides = {}) {
  const defaults = {
    startDate: new Date(),
    ratio: 1,
    position: Position.LONG,
  };
  const params = {
    ...defaults,
    ...overrides,
    stockId,
    memberId,
  };
  return PickQueries.addPick(params);
}

/**
 * Delete all the data from all the tables
 */
async function resetDb() {
  await knex(tables.PICK).del();
  await knex(tables.STOCK_VALUE).del();
  await knex(tables.MEMBER).del();
  await knex(tables.STOCK).del();
}

/**
 * Drop all tables and re-initialize (used when the schema changes)
 */
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

const token = jwt.sign({ ...defaultPayload, sub: 1234, scope: 'leaderboard' }, secrets.jwtSecret);

module.exports.addTestMember = addTestMember;
module.exports.addTestStock = addTestStock;
module.exports.addTestStockValue = addTestStockValue;
module.exports.addTestPick = addTestPick;
module.exports.resetDb = resetDb;
module.exports.initDb = initDb;
module.exports.token = token;