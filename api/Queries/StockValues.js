const moment = require('moment');
const knex = require('./initConnection');
const tables = require('./tables');
const config = require('../config.json');
const StockValue = require('../Models/StockValue');

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
  });
}

async function addStockValue(stockValue) {
  await knex(STOCK_VALUE).insert(stockValue);
  const added = await knex(STOCK_VALUE).select().whereRaw('id = last_insert_id()');
  return new StockValue(added[0]);
}

async function addStockValues(stockValues) {
  const result = await knex(STOCK_VALUE).insert(stockValues);
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
    .where({ [`${STOCK_VALUE}.date`]: today })
    .orWhere({ [`${STOCK_VALUE}.date`]: startDate })
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

module.exports.init = init;
module.exports.addStockValue = addStockValue;
module.exports.addStockValues = addStockValues;
module.exports.getYearToDateLeaderboard = getYearToDateLeaderboard;
