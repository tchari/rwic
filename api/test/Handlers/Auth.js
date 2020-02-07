const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiHttp = require('chai-http');

const app = require('../../app');
const helpers = require('../helpers');

chai.use(chaiAsPromised);
chai.use(chaiHttp);
const { expect } = chai;

describe('Auth EndPoints', function() {
  before(async function() {
    await helpers.resetDb();
  });
  afterEach(async function() {
    await helpers.resetDb();
  });
  describe('Authenticate With Bad Email', function() {
    it('should return 401', async function() {
      const response = await chai.request(app).post('/auth').send({ email: 'blah@blah.blah' });
      expect(response.status).to.eql(401);
    });
  });
  describe('Authenticate Successfully', function() {
    before(async function() {
      await helpers.addTestMember({ email: 'this@one.exists' });
    });
    it('should return 200 with a token', async function() {
      const response = await chai.request(app).post('/auth').send({ email: 'this@one.exists' });
      expect(response.status).to.eql(200);
      expect(response.body.token).to.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
    });
  });
  describe('Try EndPoint without Auth Header', function() {
    it('should return 401', async function() {
      const response = await chai
        .request(app)
        .get('/api/leaderboard');
      expect(response.status).to.eql(401);
    });
  });
  describe('Try EndPoint with invalid auth type', function() {
    it('should return 401', async function() {
      const response = await chai
        .request(app)
        .get('/api/leaderboard')
        .set('Authoriation', 'basic 1234');
      expect(response.status).to.eql(401);
    });
  });
  describe('Try EndPoint with invalid bearer token', function() {
    it('should return 401', async function() {
      const response = await chai
        .request(app)
        .get('/api/leaderboard')
        .set('Authoriation', 'bearer 123.123.123');
      expect(response.status).to.eql(401);
    });
  });
});