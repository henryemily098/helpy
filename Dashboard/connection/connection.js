const App = require("express")();

module.exports = (app=App) => {
    app.get("/discord", (req, res) => {
        res.redirect("https://bit.ly/DiscordFM")
    });
    app.get("/twitter", (req, res) => {
        res.redirect("https://bit.ly/3gwizsw");
    });
}