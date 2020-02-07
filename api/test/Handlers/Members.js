const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiHttp = require('chai-http');

const app = require('../../app');
const helpers = require('../helpers');

chai.use(chaiAsPromised);
chai.use(chaiHttp);
const { expect } = chai;
const token = helpers.token;

describe('Member EndPoints', function() {
  before(async function() {
    await helpers.resetDb();
  });
  afterEach(async function() {
    await helpers.resetDb();
  });
  describe('Add Member', function () {
    it('should return the member', async function () {
      const response = await chai
        .request(app)
        .post('/api/members')
        .set('Authorization', `bearer ${token}`)
        .send({
          email: 'blah@blah.blah',
          lastName: 'Loblaw',
          firstName: 'Bob',
        });
      expect(response.status).to.eql(200);
      expect(response.body.id).to.exist;
      expect(response.body.created_at).to.exist;
      expect(response.body.updated_at).to.exist;
      expect(response.body.email).to.eql('blah@blah.blah');
      expect(response.body.lastName).to.eql('Loblaw');
      expect(response.body.firstName).to.eql('Bob');
    });
  });
  describe('Get a member', function () {
    let member;
    before(async function() {
      member = await helpers.addTestMember({
        email: 'some.test@user.com',
        lastName: 'Test',
        firstName: 'Some',
      });
    });
    it('should return the member entity', async function () {
      const response = await chai
        .request(app)
        .get(`/api/members/${member.id}`)
        .set('Authorization', `bearer ${token}`);
      expect(response.status).to.eql(200);
      expect(response.body.id).to.eql(member.id);
      expect(response.body.email).to.eql('some.test@user.com');
      expect(response.body.lastName).to.eql('Test');
      expect(response.body.firstName).to.eql('Some');
      expect(response.body.created_at).to.exist;
      expect(response.body.updated_at).to.exist;
    });
  });
  describe('Get all the members', function () {
    before(async function() {
      await helpers.addTestMember({ email: 'some.test@user1.com' });
      await helpers.addTestMember({ email: 'some.test@user2.com' });
      await helpers.addTestMember({ email: 'some.test@user3.com' });
      await helpers.addTestMember({ email: 'some.test@user4.com' });
    });
    it('should return a list of members', async function () {
      const response = await chai
        .request(app)
        .get('/api/members')
        .set('Authorization', `bearer ${token}`);
      expect(response.status).to.eql(200);
      expect(response.body.members).to.exist;
      expect(response.body.members.length).to.eql(4);
      response.body.members.forEach(member => {
        expect(member.lastName).to.exist;
        expect(member.firstName).to.exist;
        expect(member.email).to.exist;
        expect(member.id).to.exist;
        expect(member.updated_at).to.exist;
        expect(member.created_at).to.exist;
      });
    });
  });
});