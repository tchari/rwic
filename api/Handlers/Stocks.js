const { find, orderBy } = require('lodash');
const moment = require('moment');
const Stock = require('../Models/Stock');
const StockValue = require('../Models/StockValue');
const StockQueries = require('../Queries/Stocks');
const StockValueQueries = require('../Queries/StockValues');

async function addStock(req, res) {
  try {
    const stock = new Stock(req.body);
    const newStock = await StockQueries.addStock(stock);
    res.json(newStock);
  } catch (e) {
    res.status(400).json({ message: 'Failed to add new stock.', reason: e.message });
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
