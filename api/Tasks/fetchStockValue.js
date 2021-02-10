const axios = require('axios');
const qs = require('query-string');
const find = require('lodash/find');

const StockQueries = require('../Queries/Stocks');
const StockValueQueries = require('../Queries/StockValues');
const secrets = require('../secrets.json');
const config = require('../config.json');
const StockValue = require('../Models/StockValue');

const { apiKey } = secrets.stockApi;
const { scheme, domain, basePath, allowedMICs } = config.stockApi;

const baseUrl = `${scheme}://${domain}/${basePath}`; // e.g. https://api.marketstack.com/v1

/**
 * Fetches the most recent closing stock value from marketstack
 * The marketstack has an end-of-day point point that allows up to 100 tickers
 * 
 * The process goes as follows:
 * 1. Get the list of active stocks
 * 2. Get assemble the tickers
 * 3. Hit the end point
 * 4. Extract the closing values
 * 5. Assemble the stock value to save to the db
 */
async function fetchStockValues() {
  const rawActiveStocks = await StockQueries.getActiveStocks();
  const tickers = rawActiveStocks.filter(stock => allowedMICs.includes(stock.mic)).map(stock => stock.ticker);
  const queryString = qs.stringify({ symbols: tickers, access_key: apiKey }, { arrayFormat: 'comma' });
  const response = await axios.get(`${baseUrl}/eod/latest?${queryString}`);
  const stockValues = response.data.data.map(datum => {
    const { date, close: value } = datum;
    const stock = find(rawActiveStocks, { ticker: datum.symbol });
    return new StockValue({ date, value, stockId: stock.id });
  });
  await StockValueQueries.addStockValues(stockValues);
}

module.exports = fetchStockValues;
