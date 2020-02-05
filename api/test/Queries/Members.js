const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const initDb = require('../../Queries/initDatabase');
const MemberQueries = require('../../Queries/Members');
const helpers = require('../helpers');
chai.use(chaiAsPromised);
const { assert, expect } = chai;

describe('Members', function() {
  before(async function() {
    await initDb();
  });
  afterEach(async function() {
    await helpers.resetDb();
  });
  describe('Successfully Add Member', function() {
    it('should return the memberId', function() {
      MemberQueries.addMember({
        firstName: 'testFirstName',
        lastName: 'testLastName',
        email: 'some@email.com',
      }).then(memberId => {
        assert.isNumber(memberId);
        expect(memberId).to.be.above(0);
      });
    });
  });
  describe('Fail To Add Member', function() {
    it('should fail due to missing firstName', function() {
      expect(MemberQueries.addMember({
        lastName: 'testLastName',
        email: 'some@email.com',
      })).to.be.rejected;
    });
  });
});
