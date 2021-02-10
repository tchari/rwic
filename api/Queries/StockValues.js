const moment = require('moment');
const knex = require('./initConnection');
const tables = require('./tables');
const config = require('../config.json');
const StockValue = require('../Models/StockValue');
const Stock = require('../Models/Stock');
const { isEmpty } = require('lodash');

const { STOCK_VALUE, STOCK, PICK, MEMBER } = tables;

/**
 * Some todos
 * 1. StockId-date combination should be unique
 */
function init() {
  return knex.schema.createTable(STOCK_VALUE, function (table) {
    table.increments();
    table.integer('stockId').unsigned().notNullable();
    table.foreign('stockId').references(`${STOCK}.id`); // foreign key to stock.id
    table.decimal('value', 8, 2).notNullable(); // supports up to 999,999.99
    table.date('date').notNullable();
    table.string('stockValueCode').unique().notNullable(); // unique identifier for a stock value - prevents duplicate values
  });
}

async function addStockValue(stockValue) {
  const insertableSV = await makeInsertableStockValue(stockValue);
  const stockValueCode = makeStockValueCode(insertableSV);
  await knex(STOCK_VALUE).insert({ ...insertableSV, stockValueCode });
  const added = await knex(STOCK_VALUE).select().whereRaw('id = last_insert_id()');
  return new StockValue(added[0]);
}

async function addStockValues(stockValues) {
  const insertableSVs = []
  for (const stockValue of stockValues) {
    const insertable = await makeInsertableStockValue(stockValue);
    insertableSVs.push(insertable);
  }
  const valuesToAdd = insertableSVs.map(v => ({ ...v, stockValueCode: makeStockValueCode(v) }));
  const result = await knex(STOCK_VALUE).insert(valuesToAdd);
  const firstId = result[0];
  const added = await knex(STOCK_VALUE).select().whereRaw('id >= ? and id < ?', [firstId, firstId + stockValues.length]);
  return added.map(sv => new StockValue(sv));
}

/**
 * I want to show a year-to-date leader board
 * To calculate it, I'll need to get the stock value difference between thisYearStartDate and today for the stocks everyone picked this year
 * So, we'll:
 * select STOCK_VALUE.* sv, MEMBER.* m,
 * join STOCK s on s.id = sv.stockId
 * join PICK p on p.stockId = s.id
 * join MEMBER m on m.id = p.memberId
 * where date = today and date = thisYearStartDate and pick.active = true
 */
async function getYearToDateLeaderboard(today) {
  const startDate = moment(config.thisYearStartDate).toDate();
  const results = await knex(STOCK_VALUE)
    .join(STOCK, `${STOCK_VALUE}.stockId`, '=', `${STOCK}.id`)
    .join(PICK, `${STOCK}.id`, '=', `${PICK}.stockId`)
    .join(MEMBER, `${PICK}.memberId`, '=', `${MEMBER}.id`)
    .where({ [`${PICK}.active`]: 1 })
    .andWhere(function() {
      this.where({ [`${STOCK_VALUE}.date`]: today }).orWhere({ [`${STOCK_VALUE}.date`]: startDate })
    })
    .select(
      'value',
      `${STOCK_VALUE}.stockId`,
      'date',
      `${PICK}.id as pickId`,
      `${PICK}.memberId`,
      `${PICK}.position`,
      `${MEMBER}.firstName`,
      `${MEMBER}.lastName`,
      `${PICK}.ratio`,
    );
  return results;
}

/**
 * Get the values for all the stocks on a specified day
 *
 * @param {array} stocks 
 * @param {Date} date 
 */
async function getStockValuesOnDay(stocks, date) {
  const stockIds = stocks.map(s => s.id);
  return await knex(STOCK_VALUE)
    .where({ [`${STOCK_VALUE}.date`]: date.toDate() })
    .whereIn('stockId', stockIds)
}

/**
 * Get the values for stocks on the start date of the annual meeting
 *
 * @param {array} stocks 
 */
async function getInitialStockValues(stocks) {
  const startDate = moment(config.thisYearStartDate);
  return getStockValuesOnDay(stocks, startDate);
}

function makeStockValueCode(stockValue) {
  return `${stockValue.stockId}-${stockValue.date}`
}

/**
 * Allows us to add a stockvalue by ticker instead of stockId
 * 
 * @param {object} stockvalue
 */
async function makeInsertableStockValue(stockvalue) {
  const newSV = { ...stockvalue };
  if (stockvalue.ticker) {
    const result = await knex(STOCK).select().where('ticker', '=', stockvalue.ticker);
    if (isEmpty(result)) {
      throw new Error(`No stock with ticker ${stockvalue.ticker} was found`);
    }
    const stock = new Stock(result[0]);
    newSV.stockId = stock.id;
    delete newSV.ticker;
  }
  return newSV;
}

module.exports.init = init;
module.exports.addStockValue = addStockValue;
module.exports.addStockValues = addStockValues;
module.exports.getYearToDateLeaderboard = getYearToDateLeaderboard;
module.exports.getStockValuesOnDay = getStockValuesOnDay;
module.exports.getInitialStockValues = getInitialStockValues;
