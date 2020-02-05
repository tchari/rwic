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
  const values = await knex(MEMBER).insert(member);
  const memberId = values[0];
  return memberId;
}

function getAllMembers() {
  return knex.select().from(MEMBER);
}

module.exports.init = init;
module.exports.addMember = addMember;
module.exports.getAllMembers = getAllMembers;