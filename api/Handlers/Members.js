const Member = require('../Models/Member');
const MemberQueries = require('../Queries/Members');

async function addMember(req, res) {
  try {
    const member = new Member(req.body);
    const newMember = await MemberQueries.addMember(member);
    res.json(newMember);
  } catch (e) {
    res.status(400).json({ message: 'Failed to add new member.', reason: e.message });
  }
}

async function getMember(req, res) {
  const { memberId } = req.params
  try {
    const memberResult = await MemberQueries.getMember(memberId);
    const member = new Member(memberResult);
    res.json({ ...member });
  } catch (e) {
    res.status(400).json({ message: `Failed to retrieve the member with id ${memberId}.`, reason: e.message });
  }
}

async function getAllMembers(req, res) {
  try {
    const memberResults = await MemberQueries.getAllMembers();
    const members = memberResults.map(memberResult => new Member(memberResult));
    res.json({ members });
  } catch (e) {
    res.status(400).json({ message: `Failed to retrieve all the members.`, reason: e.message });
  }
}

module.exports.addMember = addMember;
module.exports.getMember = getMember;
module.exports.getAllMembers = getAllMembers;