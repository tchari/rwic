const express = require('express');
const Member = require('./Handlers/Member');
const Stock = require('./Handlers/Stocks');
const Pick = require('./Handlers/Picks');
const StockValue = require('./Handlers/StockValues');

const app = express();
const port = 3000;

app.use(express.json())

/**
 * Member end points
 */
app.post('/members', Member.addMember);
app.get('/members/:memberId', Member.getMember);
app.get('/members', Member.getAllMembers);

/**
 * Stock end points
 */
app.post('/stocks', Stock.addStock);
app.get('/stocks', Stock.getActiveStocks);
app.get('/stocks/:stockId', Stock.getStock);

/**
 * Pick end points
 */
app.post('/picks', Pick.addPick);
app.get('/picks/:pickId', Pick.getPick);
app.patch('/picks/:pickId/activate', Pick.activatePick);
app.patch('/picks/:pickId/deactivate', Pick.deactivatePick);

/**
 * Stock Value end points
 */
app.get('/leaderboard', StockValue.getLeaderBoard);

app.listen(port, () => console.log(`Listening on port ${port}!`));

module.exports = app;
