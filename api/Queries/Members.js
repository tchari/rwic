const knex = require('./initConnection');
const tables = require('./tables');
const Member = require('../Models/Member');

const { MEMBER } = tables;

function init() {
  return knex.schema.createTable(MEMBER, function (table) {
    table.increments();
    table.string('firstName').notNullable();
    table.string('lastName').notNullable();
    table.string('email').unique().notNullable();
    table.timestamps(false, true);
  });
}

async function addMember(member) {
  await knex(MEMBER).insert(member);
  const added = await knex(MEMBER).select().whereRaw('id = last_insert_id()');
  return new Member(added[0]);
}

async function getMemberByEmail(email) {
  return await getMember({ email });
}

async function getMemberById(memberId) {
  return getMember({ id: memberId });
}

async function getMember(whereCondition) {
  const result = await knex(MEMBER).select().where(whereCondition);
  return result.length === 0 ? null : new Member(result[0]); // will have 1 or 0 results
}

function getAllMembers() {
  return knex(MEMBER).select();
}

module.exports.init = init;
module.exports.addMember = addMember;
module.exports.getAllMembers = getAllMembers;
module.exports.getMemberById = getMemberById;
module.exports.getMemberByEmail = getMemberByEmail;