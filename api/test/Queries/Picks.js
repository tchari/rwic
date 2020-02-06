const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const PickQueries = require('../../Queries/Picks');
const helpers = require('../helpers');
chai.use(chaiAsPromised);
const { assert, expect } = chai;

describe('Picks', function() {
  before(async function() {
    await helpers.initDb();
  });
  afterEach(async function() {
    await helpers.resetDb();
  });
  describe('Successfully Add Pick', function() {
    let stockId;
    let memberId;
    before(async function () {
      stockId = await helpers.addTestStock();
      memberId = await helpers.addTestMember();
    });
    it('should return the PickId', function() {
      PickQueries.addPick({
        stockId,
        memberId,
        ratio: 1,
        startDate: new Date(),
      }).then(pickId => {
        assert.isNumber(pickId);
        expect(pickId).to.be.above(0);
      });
    });
  });
});
