const mongoose = require('mongoose');

const warnsSchema = new mongoose.Schema({
    userID: String,
    guildID: String,
    content: Array
});

module.exports = mongoose.model('warn', warnsSchema);