const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiHttp = require('chai-http');
const moment = require('moment');
const find = require('lodash/find');

const config = require('../../config.json');
const app = require('../../app');
const helpers = require('../helpers');
const Position = require('../../Models/Position');

chai.use(chaiAsPromised);
chai.use(chaiHttp);
const { expect } = chai;
const token = helpers.token;

describe('StockValue EndPoints', function() {
  before(async function() {
    await helpers.resetDb();
  });
  afterEach(async function() {
    await helpers.resetDb();
  });
  describe('Get leaderboard', function () {
    let tesla;
    let apple;
    let microsoft;
    let bob;
    let joey;
    before(async function() {
      const startDate = moment(config.thisYearStartDate).toDate();
      const yesterday = moment().subtract(1, 'day').startOf('day').toDate();
      const now = moment().startOf('day').toDate();
      tesla = await helpers.addTestStock({
        name: 'Tesla, Inc.',
        ticker: 'TSLA',
        mic: 'XNAS',
      });
      await helpers.addTestStockValue(tesla.id, {
        value: 1,
        date: startDate,
      });
      await helpers.addTestStockValue(tesla.id, {
        value: 1.5,
        date: yesterday,
      });
      await helpers.addTestStockValue(tesla.id, {
        value: 2,
        date: now,
      });
      apple = await helpers.addTestStock({
        name: 'Apple, Inc.',
        ticker: 'AAPL',
        mic: 'XNAS',
      });
      await helpers.addTestStockValue(apple.id, {
        value: 10,
        date: startDate,
      });
      await helpers.addTestStockValue(apple.id, {
        value: 15,
        date: yesterday,
      });
      await helpers.addTestStockValue(apple.id, {
        value: 20,
        date: now,
      });
      microsoft = await helpers.addTestStock({
        name: 'Microsoft Corporation',
        ticker: 'MFST',
        mic: 'XNAS',
      });
      await helpers.addTestStockValue(microsoft.id, {
        value: 200,
        date: startDate,
      });
      await helpers.addTestStockValue(microsoft.id, {
        value: 150,
        date: yesterday,
      });
      await helpers.addTestStockValue(microsoft.id, {
        value: 100,
        date: now,
      });
      bob = await helpers.addTestMember({
        firstName: 'Bob',
        lastName: 'Loblaw',
        email: 'blah@blah.blah',
      });
      joey = await helpers.addTestMember({
        firstName: 'Joey',
        lastName: 'Shabidoo',
        email: 'joey@joejoe.shabidoo',
      });
      await helpers.addTestPick(tesla.id, bob.id, { startDate, ratio: 0.2, position: Position.LONG });
      await helpers.addTestPick(apple.id, bob.id, { startDate, ratio: 0.7, position: Position.LONG });
      await helpers.addTestPick(microsoft.id, bob.id, { startDate, ratio: 0.1, position: Position.SHORT });
      
      await helpers.addTestPick(tesla.id, joey.id, { startDate, ratio: 0.2, position: Position.SHORT });
      await helpers.addTestPick(apple.id, joey.id, { startDate, ratio: 0.4, position: Position.LONG });
      await helpers.addTestPick(microsoft.id, joey.id, { startDate, ratio: 0.4, position: Position.LONG });
    });
    it('should return the leaderboard', async function() {
      const response = await chai.request(app).get('/api/leaderboard').set('Authorization', `bearer ${token}`);
      expect(response.status).to.eql(200);
      expect(response.body.leaderboard).to.exist;
      expect(response.body.leaderboard.length).to.eql(2);
      const { leaderboard } = response.body;
      const foundBob = find(leaderboard, { memberId: bob.id });
      expect(foundBob.firstName).to.eql('Bob');
      expect(foundBob.lastName).to.eql('Loblaw');
      expect(foundBob.closingValue).to.eql(1950);
      const foundJoey = find(leaderboard, { memberId: joey.id });
      expect(foundJoey.firstName).to.eql('Joey');
      expect(foundJoey.lastName).to.eql('Shabidoo');
      expect(foundJoey.closingValue).to.eql(1000);
    });
  });
});