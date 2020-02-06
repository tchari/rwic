const Stock = require('../Models/Stock');
const StockQueries = require('../Queries/Stocks');

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

async function getActiveStocks(req, res) {
  try {
    const stockResults = await StockQueries.getActiveStocks();
    const stocks = stockResults.map(stockResult => new Stock(stockResult));
    res.json({ stocks });
  } catch (e) {
    res.status(400).json({ message: `Failed to retrieve all active stocks.`, reason: e.message });
  }
}

module.exports.addStock = addStock;
module.exports.getStock = getStock;
module.exports.getActiveStocks = getActiveStocks;
