const express = require('express');
const Stock = require('../Handlers/Stocks');

const router = express.Router();

/**
 * Stock end points
 */
router.post('/', Stock.addStock);
router.get('/', Stock.getActiveStocks);
router.get('/:stockId', Stock.getStock);

module.exports = router;