const Pick = require('../Models/Pick');
const PickQueries = require('../Queries/Picks');

async function addPick(req, res) {
  try {
    const pick = new Pick(req.body);
    const newPick = await PickQueries.addPick({ ...pick, startDate: new Date(pick.startDate) });
    res.json(newPick);
  } catch (e) {
    res.status(400).json({ message: 'Failed to add new pick.', reason: e.message });
  }
}

async function getPick(req, res) {
  const pickId = parseInt(req.params.pickId);
  try {
    const pickResult = await PickQueries.getPick(pickId);
    const pick = new Pick({
      ...pickResult,
      active: pickResult.active ? true : false
    });
    res.json({ ...pick });
  } catch (e) {
    res.status(400).json({ message: `Failed to retrieve the member with id ${pickId}.`, reason: e.message });
  }
}

async function activatePick(req, res) {
  const pickId = parseInt(req.params.pickId);
  try {
    await PickQueries.activatePick(pickId);
    res.json({ id: pickId });
  } catch (e) {
    res.status(400).json({ message: `Failed to activate the pick with id ${pickId}.`, reason: e.message });
  }
}

async function deactivatePick(req, res) {
  const pickId = parseInt(req.params.pickId);
  try {
    await PickQueries.deactivatePick(pickId);
    res.json({ id: pickId });
  } catch (e) {
    res.status(400).json({ message: `Failed to deactivate the pick with id ${pickId}.`, reason: e.message });
  }
}

module.exports.activatePick = activatePick;
module.exports.deactivatePick = deactivatePick;
module.exports.addPick = addPick;
module.exports.getPick = getPick;