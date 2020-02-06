const axios = require('axios');
const qs = require('query-string');
const moment = require('moment');
const find = require('lodash/find');
const map = require('lodash/map');

const StockQueries = require('../Queries/Stocks');
const StockValueQueries = require('../Queries/StockValues');
const secrets = require('../secrets.json');
const config = require('../config.json');

const { apiKey } = secrets.stockApi;
const { scheme, domain, path } = config.stockApi;

const baseUrl = `${scheme}://${domain}${path}`;

/**
 * Fetch yesterday's stock values
 * The worldtradingdata API only allows for 2 stocks per history_multi_single_day query
 * 
 * The process goes as follows:
 * 1. Get a list of stocks we need to get values for (i.e. active stocks)
 * 2. Assemble the stock tickers into groups of 2 (due to the API limit)
 * 3. Make as many concurrent requests as required for each ticker pair
 * 4. Process the responses and add the new stock values to the DB
 */
async function fetchStockValues() {
  // Step 1
  const activeStocks = await StockQueries.getActiveStocks();
  const date = moment().subtract(1, 'days').format('YYYY-MM-DD');
  
  // Step 2
  const tickerPairs = activeStocks.reduce((result, val, index, array) => {
    if (index % 2 === 0) {
      result.push(array.slice(index, index + 2).map(val => val.ticker));
    }
    return result;
  }, []);
  
  // Step 3
  const requests = tickerPairs.map(pairs => {
    const queryString = qs.stringify({ date, api_token: apiKey, symbol: pairs }, { arrayFormat: 'comma' });
    return axios.get(`${baseUrl}?${queryString}`);
  });
  axios.all(requests)
    .then(responses => {
      // Step 4
      const stockValuesToAdd = responses.flatMap(({ data: { data, date } }) => {
        return map(data, ({ close }, ticker) => {
          const stock = find(activeStocks, { ticker });
          return { stockId: stock.id, value: close, date };
        });
      });
      StockValueQueries.addStockValues(stockValuesToAdd);
    })
    .catch(error => {
      console.log(error);
    });
}

module.exports = fetchStockValues;
