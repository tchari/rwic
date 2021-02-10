const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiHttp = require('chai-http');
const moment = require('moment');

const app = require('../../app');
const helpers = require('../helpers');
const deactivatePick = require('../../Queries/Picks').deactivatePick;

chai.use(chaiAsPromised);
chai.use(chaiHttp);
const { expect } = chai;
const token = helpers.token;

describe('Stock EndPoints', function() {
  before(async function() {
    await helpers.resetDb();
  });
  afterEach(async function() {
    await helpers.resetDb();
  });
  describe('Add Stock', function () {
    it('should return the stock id', async function () {
      const response = await chai.request(app)
        .post('/api/stocks')
        .set('Authorization', `bearer ${token}`)
        .send({
          name: 'Blarg, Inc.',
          ticker: 'BLRG',
          mic: 'XNAS',
        });
      expect(response.status).to.eql(200);
      expect(response.body.id).to.exist;
      expect(response.body.name).to.eql('Blarg, Inc.');
      expect(response.body.ticker).to.eql('BLRG');
      expect(response.body.mic).to.eql('XNAS');
    });
  });
  describe('Add Many Stocks', function () {
    it('should add two stocks', async function () {
      const response = await chai.request(app)
        .post('/api/stocks')
        .set('Authorization', `bearer ${token}`)
        .send([
          {
            name: 'Blarg, Inc.',
            ticker: 'BLRG',
            mic: 'XNAS',
          },
          {
            name: 'Nambla, Inc.',
            ticker: 'AAMB',
            mic: 'XNAS',
          }
        ]);
      expect(response.status).to.eql(200);
      expect(response.body.length).to.eql(2);
    });
  });
  describe('Get a stock', function () {
    let stock;
    before(async function () {
      stock = await helpers.addTestStock({
        name: 'Acme, Inc.',
        ticker: 'ACME',
        mic: 'XNAS'
      });
    });
    it('should return the stock id', async function () {
      const response = await chai.request(app).get(`/api/stocks/${stock.id}`).set('Authorization', `bearer ${token}`);
      expect(response.status).to.eql(200);
      expect(response.body.id).to.eql(stock.id);
      expect(response.body.created_at).to.exist;
      expect(response.body.updated_at).to.exist;
      expect(response.body.name).to.eql('Acme, Inc.');
      expect(response.body.ticker).to.eql('ACME');
      expect(response.body.mic).to.eql('XNAS');
    });
  });
  describe('Get active stocks', function () {
    let acme;
    let other;
    let unused;
    let member;
    before(async function () {
      member = await helpers.addTestMember();
      acme = await helpers.addTestStock({
        name: 'Acme, Inc.',
        ticker: 'ACME',
        mic: 'XNAS'
      });
      other = await helpers.addTestStock({
        name: 'Other, Inc.',
        ticker: 'OTHR',
        mic: 'XNAS'
      });
      unused = await helpers.addTestStock({
        name: 'Unused, Inc.',
        ticker: 'UUUD',
        mic: 'XNAS'
      });
      await helpers.addTestPick(acme.id, member.id, { ratio: 0.6 });
      await helpers.addTestPick(other.id, member.id, { ratio: 0.4 });
      const lastYear = moment().subtract(1, 'years').toDate();
      const pickToDeactivate = await helpers.addTestPick(unused.id, member.id, { ratio: 1, startDate: lastYear });
      await deactivatePick(pickToDeactivate.id);
    });
    it('should return a list of active stocks', async function () {
      const response = await chai.request(app).get('/api/stocks/active').set('Authorization', `bearer ${token}`);
      expect(response.status).to.eql(200);
      expect(response.body.length).to.eql(2);
      const ids = response.body.map(stock => stock.id);
      expect(ids).to.include(acme.id);
      expect(ids).to.include(other.id);
    });
  });
});