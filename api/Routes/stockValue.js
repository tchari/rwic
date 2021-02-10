const express = require('express');
const StockValue = require('../Handlers/StockValues');

const router = express.Router();

/**
 * Pick end points
 */
router.post('/', StockValue.addStockValue);

module.exports = router;