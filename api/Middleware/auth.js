const secrets = require('../secrets.json');
const jwt = require('jsonwebtoken');

async function auth(req, res, next) {
  try {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error('No authorization header provided.');
  }
  const [type, token] = authHeader.split(' ');
  if (type.toLowerCase() !== 'bearer') {
    throw new Error(`Authenciation scheme ${type} is not supported.`);
  }
  const { scope } = jwt.verify(token, secrets.jwtSecret);
  res.locals.scope = scope;
  next();
  } catch (e) {
    return res.status(401).json({ message: 'Unable to fulfill request.', reason: e.message });
  }
}

module.exports = auth;