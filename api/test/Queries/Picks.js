const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const PickQueries = require('../../Queries/Picks');
const helpers = require('../helpers');
chai.use(chaiAsPromised);
const { expect } = chai;

describe('Pick Queries', function() {
  before(async function() {
    await helpers.resetDb();
  });
  afterEach(async function() {
    await helpers.resetDb();
  });
  describe('Successfully Add Pick', function() {
    let stock;
    let member;
    before(async function () {
      stock = await helpers.addTestStock();
      member = await helpers.addTestMember();
    });
    it('should return the PickId', function(done) {
      PickQueries.addPick({
        stockId: stock.id,
        memberId: member.id,
        ratio: 1,
        startDate: new Date(),
      }).then(pick => {
        expect(pick.id).to.be.above(0);
        expect(pick.created_at).to.exist;
        expect(pick.updated_at).to.exist;
        expect(pick.ratio).to.eql(1);
        expect(pick.startDate).to.exist;
        done();
      }).catch(e => {
        done(e);
      });
    });
  });
});
