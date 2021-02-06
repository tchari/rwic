const jwt = require('jsonwebtoken');
const moment = require('moment');
const MemberQueries = require('../Queries/Members');
const secrets = require('../secrets.json');

// 1 hour expiry
const getDefaultExpiry = () => moment().unix() + 60 * 60 * 1;
const defaultPayload = { exp: getDefaultExpiry(), iss: 'rwic', aud: 'rwic' };

async function doAuth(req, res) {
  const { email } = req.body;
  const member = await MemberQueries.getMemberByEmail(email);
  if (!member) {
    return res.status(401).json({ message: 'Authentication failed', reason: 'Inavlid email provied.' });
  }
  const payload = {
    ...defaultPayload,
    sub: member.id,
    scope: member.scopes || 'leaderboard'
  };
  const token = jwt.sign(payload, secrets.jwtSecret);
  return res.json({ token });
}

module.exports.doAuth = doAuth;
module.exports.defaultPayload = defaultPayload;