const express = require("express");

module.exports = (app=express()) => {
    app.use('/code', require("./discord"));
}