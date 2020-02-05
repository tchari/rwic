const express = require('express');
const Member = require('./Handlers/Member');

const app = express();
const port = 3000;

app.use(express.json())

app.post('/members', Member.addMember);
app.get('/members/:memberId', Member.getMember);
app.get('/members', Member.getAllMembers);

app.listen(port, () => console.log(`Listening on port ${port}!`));

module.exports = app;