const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const MemberQueries = require('../../Queries/Members');
const helpers = require('../helpers');
chai.use(chaiAsPromised);
const { expect } = chai;

describe('Member Queries', function() {
  before(async function() {
    await helpers.resetDb();
  });
  afterEach(async function() {
    await helpers.resetDb();
  });
  describe('Successfully Add Member', function() {
    it('should return the memberId', function(done) {
      MemberQueries.addMember({
        firstName: 'testFirstName',
        lastName: 'testLastName',
        email: 'some@email.com',
      }).then(member => {
        expect(member.id).to.be.above(0);
        expect(member.created_at).to.exist;
        expect(member.updated_at).to.exist;
        expect(member.firstName).to.eql('testFirstName');
        expect(member.lastName).to.eql('testLastName');
        expect(member.email).to.eql('some@email.com');
        done();
      }).catch(e => {
        done(e);
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
