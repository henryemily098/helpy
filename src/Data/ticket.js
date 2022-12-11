const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    guildId: String,
    content: Array
});

module.exports = mongoose.model('ticket', schema);