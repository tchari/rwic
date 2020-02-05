const knex = require('./initConnection');
const tables = require('./tables');

const { MEMBER } = tables;
function init() {
  return knex.schema.createTable(MEMBER, function (table) {
    table.increments();
    table.string('firstName').notNullable();
    table.string('lastName').notNullable();
    table.string('email').notNullable();
    table.timestamps(false, true);
  });
}

async function addMember(member) {
  const result = await knex(MEMBER).insert(member)
  return result[0];
}

async function getMember(memberId) {
  const result = await knex(MEMBER)
    .select()
    .where({ id: memberId });
  return result[0]; // should only have 1 result
}

function getAllMembers() {
  return knex(MEMBER).select();
}

module.exports.init = init;
module.exports.addMember = addMember;
module.exports.getAllMembers = getAllMembers;
module.exports.getMember = getMember;