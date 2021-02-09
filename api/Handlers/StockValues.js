const moment = require('moment');
const groupBy = require('lodash/groupBy');
const forEach = require('lodash/forEach');
const find = require('lodash/find');
const findIndex = require('lodash/findIndex');
const orderBy = require('lodash/orderBy');

const config = require('../config.json');
const StockValueQueries = require('../Queries/StockValues');
const Position = require('../Models/Position');

async function getLeaderBoard(req, res) {
  try {
    const today = moment().startOf('day').toDate()
    const leaderboardResult = await StockValueQueries.getYearToDateLeaderboard(today);
    const leaderboard = [];
    leaderboardResult.forEach(({ memberId, firstName, lastName }) => {
      const member = find(leaderboard, { memberId });
      if (!member) {
        leaderboard.push({ memberId, firstName, lastName, closingValue: 0 });
      }
    });

    const pickGroups = groupBy(leaderboardResult, 'pickId');
    forEach(pickGroups, group => {
      const startDate = moment(config.thisYearStartDate).toDate();
      const start = find(group, { date: startDate });
      const latest = find(group, { date: today });
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
