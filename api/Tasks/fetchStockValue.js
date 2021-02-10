const axios = require('axios');
const qs = require('query-string');
const find = require('lodash/find');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

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
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  const url = `${baseUrl}/eod/${yesterday}?${queryString}`;
  const response = await axios.get(url);
  const stockValues = response.data.data.map(({ date, close: value, symbol: ticker }) => {
    const stock = find(rawActiveStocks, { ticker });
    return new StockValue({ date: dayjs(date).utc().format('YYYY-MM-DD'), value, stockId: stock.id });
  });
  await StockValueQueries.addStockValues(stockValues);
}

module.exports = fetchStockValues;
