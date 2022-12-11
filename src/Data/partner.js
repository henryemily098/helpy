const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema({
    guildId: String,
    partnerList: Array
});

module.exports = mongoose.model("partner", partnerSchema);