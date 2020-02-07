const morgan = require('morgan');
const fs = require('fs');

const stream = fs.createWriteStream('./app.log', { flags: 'a' });

const logger = morgan('common', { stream });

module.exports = logger;
