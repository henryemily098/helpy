const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    guildId: String,
    customURL: Array
});

module.exports = mongoose.model("url", schema);