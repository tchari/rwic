const { find, orderBy, isEmpty } = require('lodash');
const moment = require('moment');
const Stock = require('../Models/Stock');
const StockValue = require('../Models/StockValue');
const StockQueries = require('../Queries/Stocks');
const StockValueQueries = require('../Queries/StockValues');

async function addStock(req, res) {
  if (Array.isArray(req.body)) {
    await addStocks(req, res);
  } else {
    await addOneStock(req, res);
  }
}

/**
 * Attempts to add a new stock to the DB. If the stock already exists, then just
 * return the existing stock
 *
 * @param {object} req 
 * @param {object} res 
 */
async function addOneStock(req, res) {
  try {
    const stock = new Stock(req.body);
    const existingStocks = await StockQueries.getStocks({ ticker: stock.ticker });
    if (isEmpty(existingStocks)) {
      const newStock = await StockQueries.addStock(stock);
      res.json(newStock);
    } else {
      res.json(existingStocks[0]);
    }
  } catch (e) {
    res.status(400).json({ message: 'Failed to add new stock.', reason: e.message });
  }
}

async function addStocks(req, res) {
  try {
    const stocks = req.body.map(s => new Stock(s));
    const stocksToAdd = [];
    const resStocks = [];
    for (const stock of stocks) {
      const existingStocks = await StockQueries.getStocks({ ticker: stock.ticker });
      if (isEmpty(existingStocks)) {
        stocksToAdd.push(stock);
      } else {
        resStocks.push(existingStocks[0]);
      }
    }
    const newStocks = await StockQueries.addStocks(stocksToAdd);
    res.json([...resStocks, ...newStocks].map(s => new Stock(s)));
  } catch (e) {
    res.status(400).json({ message: 'Failed to add new stocks.', reason: e.message });
  }
}

async function getStock(req, res) {
  const { stockId } = req.params
  try {
    const stockResult = await StockQueries.getStock(stockId);
    const stock = new Stock(stockResult);
    res.json({ ...stock });
  } catch (e) {
    res.status(400).json({ message: `Failed to retrieve the stock with id ${stockId}.`, reason: e.message });
  }
}

async function getStocks(req, res) {
  try {
    const stockResults = await StockQueries.getStocks(req.query);
    const stocks = stockResults.map(stockResult => new Stock(stockResult));
    res.json({ stocks });
  } catch (e) {
    res.status(400).json({ message: `Failed to retrieve stocks`, reason: e.message });
  }
}

async function getActiveStocks(req, res) {
  try {
    const stockResults = await StockQueries.getActiveStocks();
    const stocks = stockResults.map(stockResult => new Stock(stockResult));
    const initialStockValues = await StockValueQueries.getInitialStockValues(stocks);
    const initValues = initialStockValues.map(val => new StockValue(val));
    const todayStockValues = await StockValueQueries.getStockValuesOnDay(stocks, moment().startOf('day'));
    const todayValues = todayStockValues.map(val => new StockValue(val));
    for (const stock of stocks) {
      const initialValue = find(initValues, { stockId: stock.id });
      const todayValue = find(todayValues, { stockId: stock.id });
      stock.initialValue = initialValue ? initialValue.value : null;
      stock.todayValue = todayValue ? todayValue.value : null;
      stock.gain = stock.todayValue && stock.initialValue
        ? Math.round(10000 * (stock.todayValue - stock.initialValue) / stock.initialValue) / 100
        : null;
    }
    const ordered = orderBy(stocks, ['gain'], ['desc']);
    res.json(ordered);
  } catch (e) {
    res.status(400).json({ message: `Failed to retrieve all active stocks.`, reason: e.message });
  }
}

module.exports.addStock = addStock;
module.exports.getStock = getStock;
module.exports.getStocks = getStocks;
module.exports.getActiveStocks = getActiveStocks;
