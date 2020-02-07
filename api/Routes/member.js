const express = require('express');
const Member = require('../Handlers/Members');

const router = express.Router();

/**
 * Member end points
 */
router.post('/', Member.addMember);
router.get('/:memberId', Member.getMember);
router.get('/', Member.getAllMembers);

module.exports = router;