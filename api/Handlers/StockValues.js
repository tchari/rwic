const moment = require('moment');
const groupBy = require('lodash/groupBy');
const forEach = require('lodash/forEach');
const find = require('lodash/find');
const findIndex = require('lodash/findIndex');

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
        leaderboard.push({ memberId, firstName, lastName, increase: 0 });
      }
    });

    const pickGroups = groupBy(leaderboardResult, 'pickId');
    forEach(pickGroups, group => {
      const startDate = moment(config.thisYearStartDate).toDate();
      const start = find(group, { date: startDate });
      const latest = find(group, { date: today });
      const { ratio, value: startValue, memberId, position } = start;
      const latestValue = latest.value;
      const positionFactor = position === Position.SHORT ? -1 : 1;
      const increase = positionFactor * ratio * (latestValue / startValue - 1);
      const leaderboardIndex = findIndex(leaderboard, { memberId });
      leaderboard[leaderboardIndex].increase += increase;
    });
    res.json({ leaderboard });
  } catch (e) {
    res.status(400).json({ message: `Failed to retrieve the leaderboard.`, reason: e.message });
  }
}

module.exports.getLeaderBoard = getLeaderBoard;
