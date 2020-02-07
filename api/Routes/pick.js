const express = require('express');
const Pick = require('../Handlers/Picks');

const router = express.Router();

/**
 * Pick end points
 */
router.post('/', Pick.addPick);
router.get('/:pickId', Pick.getPick);
router.patch('/:pickId/activate', Pick.activatePick);
router.patch('/:pickId/deactivate', Pick.deactivatePick);

module.exports = router;