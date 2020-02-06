const moment = require('moment');
const groupBy = require('lodash/groupBy');
const forEach = require('lodash/forEach');
const find = require('lodash/find');
const findIndex = require('lodash/findIndex');

const config = require('../config.json');
const StockValue = require('../Models/StockValue');
const StockValueQueries = require('../Queries/StockValues');

async function getLeaderBoard(req, res) {
  try {
    const today = moment().startOf('day').toDate()
    const leaderboardResult = await StockValueQueries.getYearToDateLeaderboard(today);
    /**
     * Take the results corresponding to the start date; and calculate the normalized value as follows
     * nValue = ratio;
     * 
     * Take the results corresponding to the current/latest date; and calculate the normalized value as follows
     * nValue = ratio / value_at_startDate * value_now
     * 
     * For each pick calculate the increase as follows:
     * increase = nValue_now - nValue_start = ratio / value_at_startDate * value_now - ratio = ratio * (value_now / value_at_start - 1)
     * 
     * For each user, sum up their increases and sort by who has the biggest increase
     */
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
      const { ratio, value: startValue, memberId } = start;
      const latestValue = latest.value;
      const increase = ratio * (latestValue / startValue - 1);
      const leaderboardIndex = findIndex(leaderboard, { memberId });
      leaderboard[leaderboardIndex].increase += increase;
    });
    res.json({ leaderboard });
  } catch (e) {
    res.status(400).json({ message: `Failed to retrieve the leaderboard.`, reason: e.message });
  }
}

module.exports.getLeaderBoard = getLeaderBoard;
