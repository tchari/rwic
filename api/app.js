const express = require('express');
const logger = require('./Middleware/logger');
const auth = require('./Middleware/auth');
const memberRoutes = require('./Routes/member');
const stockRoutes = require('./Routes/stock');
const pickRoutes = require('./Routes/pick');
const StockValue = require('./Handlers/StockValues');
const Auth = require('./Handlers/Auth');

const app = express();
const port = 3000;

app.use(express.json());

/**
 * Member end points
 */
app.use(logger);
app.post('/auth', Auth.doAuth);
app.use('/api', auth);
app.use('/api/members', memberRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/picks', pickRoutes);

/**
 * Stock Value end points
 */
app.get('/api/leaderboard', StockValue.getLeaderBoard);

app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;

