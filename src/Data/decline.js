const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    guildId: String,
    declinedData: Array
});

module.exports = mongoose.model("decline", schema);