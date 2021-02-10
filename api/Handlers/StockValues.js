const moment = require('moment');
const groupBy = require('lodash/groupBy');
const forEach = require('lodash/forEach');
const find = require('lodash/find');
const findIndex = require('lodash/findIndex');
const orderBy = require('lodash/orderBy');
const yup = require('yup');

const config = require('../config.json');
const StockValueQueries = require('../Queries/StockValues');
const Position = require('../Models/Position');

async function addStockValue(req, res) {
  if (Array.isArray(req.body)) {
    await addStockValues(req, res);
  } else {
    await addOneStockValue(req, res);
  }
}

async function addOneStockValue(req, res) {
  try {
    const stockValue = req.body();
    yup.object().shape({
      ticker: yup.string().required(),
      value: yup.number().positive().required(),
      date: yup.date().required(),
    }).validateSync(stockValue);
    const newStockValue = await StockValueQueries.addStockValue(stockValue);
    res.json(newStockValue);
  } catch (e) {
    res.status(400).json({ message: `Failed to add stock value.`, reason: e.message });
  }
}

async function addStockValues(req, res) {
  try {
    const stockValues = req.body;
    yup.array().of(
      yup.object().shape({
        ticker: yup.string().required(),
        value: yup.number().positive().required(),
        date: yup.date().required(),
      })
    ).validateSync(stockValues);
    const newStockValues = await StockValueQueries.addStockValues(stockValues);
    res.json(newStockValues);
  } catch (e) {
    res.status(400).json({ message: `Failed to add stock values.`, reason: e.message });
  }
}

async function getLeaderBoard(req, res) {
  try {
    const qm = req.query.date ? moment(req.query.date) : moment();
    const queryDate = qm.startOf('day').toDate()
    const leaderboardResult = await StockValueQueries.getYearToDateLeaderboard(queryDate);
    const leaderboard = [];
    leaderboardResult.forEach(({ memberId, firstName, lastName }) => {
      const member = find(leaderboard, { memberId });
      if (!member) {
        leaderboard.push({ memberId, firstName, lastName, closingValue: 0 });
      }
    });
    console.log(JSON.stringify(leaderboardResult));

    const pickGroups = groupBy(leaderboardResult, 'pickId');
    forEach(pickGroups, group => {
      const startDate = moment(config.thisYearStartDate).toDate();
      const start = find(group, { date: startDate });
      const latest = find(group, { date: queryDate });
      const { ratio, value: startValue, memberId, position } = start;
      const latestValue = latest.value;
      const initialInvestment = 1000 * ratio;
      const boughtShares = initialInvestment / startValue;
      const currentInvestmentValue = boughtShares * latestValue;
      const leaderboardIndex = findIndex(leaderboard, { memberId });
      const additionalClosingValue = position === Position.LONG ? currentInvestmentValue : (2 * initialInvestment - currentInvestmentValue);
      leaderboard[leaderboardIndex].closingValue += additionalClosingValue;
    });
    const ordered = orderBy(leaderboard, ['closingValue'], ['desc']);
    res.json({ leaderboard: ordered });
  } catch (e) {
    res.status(400).json({ message: `Failed to retrieve the leaderboard.`, reason: e.message });
  }
}

module.exports.getLeaderBoard = getLeaderBoard;
module.exports.addStockValue = addStockValue;
