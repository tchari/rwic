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

async function fetchStockValues() {
  const activeStocks = await StockQueries.getActiveStocks();
  const date = moment().subtract(1, 'days').format('YYYY-MM-DD');
  const queryParams = {
    date,
    api_token: apiKey,

  };
  const tickerPairs = activeStocks.reduce((result, val, index, array) => {
    if (index % 2 === 0) {
      result.push(array.slice(index, index + 2).map(val => val.ticker));
    }
    return result;
  }, []);
  const requests = tickerPairs.map(pairs => {
    const queryString = qs.stringify({ ...queryParams, symbol: pairs }, { arrayFormat: 'comma' });
    return axios.get(`${baseUrl}?${queryString}`);
  });
  axios.all(requests)
    .then(responses => {
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
