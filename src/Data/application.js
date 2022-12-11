const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    guildId: String,
    submissions: Array,
    status: Boolean
});

module.exports = mongoose.model("application", schema);