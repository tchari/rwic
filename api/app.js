const express = require('express');
const logger = require('./Middleware/logger');
const memberRoutes = require('./Routes/member');
const stockRoutes = require('./Routes/stock');
const pickRoutes = require('./Routes/pick');
const StockValue = require('./Handlers/StockValues');

const app = express();
const port = 3000;

app.use(express.json());

/**
 * Member end points
 */
app.use(logger);
app.use('/members', memberRoutes);
app.use('/stocks', stockRoutes);
app.use('/picks', pickRoutes);

/**
 * Stock Value end points
 */
app.get('/leaderboard', StockValue.getLeaderBoard);

app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;

