const express = require("express");
const Client = require("../../src/client/Client");
module.exports.default = {
    get({ app=express(), client=new Client() }) {
        app.get("/staff-icon.png", function(req, res) {
            res.redirect("https://cdn.discordapp.com/attachments/837618984476082206/875633666439659540/sb-logo.png");
        });

        app.get("/helpy-welcome.png", function(req, res) {
            res.redirect("https://vignette.wikia.nocookie.net/freddy-fazbears-pizzeria-simulator/images/b/be/HelpyExcite.gif/revision/latest?cb=20180223002707");
        });

        app.get("/discord-icon.png", function(req, res) {
            res.redirect("https://vectorified.com/images/discord-icon-9.png");
        });

        app.get("/profile-icon-vector.png", function(req, res) {
            res.redirect("https://cdn.onlinewebfonts.com/svg/img_24787.png");
        });

        app.get("/check-mark.gif", function(req, res) {
            res.redirect("https://s3-ap-southeast-1.amazonaws.com/gw-thinksaas-deploy/website/images/checkmark-gif.gif");
        });

        app.get("/partner-example.png", function(req, res) {
            res.redirect("https://cdn.discordapp.com/attachments/905337980447780924/914353572911661056/Screenshot_20211128-101410_Discord.jpg");
        });

        app.get("/banner-image.png", function(req, res) {
            res.redirect("https://cdn.discordapp.com/attachments/905337980447780924/914455883814162432/FNaF_Multiverse_banner.jpg");
        });

        app.get("/helpy-dance.gif", function(req, res) {
            res.redirect("https://vignette.wikia.nocookie.net/freddy-fazbears-pizza/images/1/18/Helpy-dance3.gif/revision/latest?cb=20171217200952");
        });

        app.get("/replace-banner.jpg", function(req ,res) {
            res.redirect("https://cdn.wallpapersafari.com/67/18/dOQ8wW.png");
        });

        app.get("/helpy-sad.png", function(req, res) {
            res.redirect("https://vignette.wikia.nocookie.net/pizzaria-freddy-fazbear/images/6/63/Helpy-fail.png/revision/latest?cb=20171218102122&path-prefix=pt-br");
        });

        app.get("/staff-example-members.jpg", function(req, res) {
            res.redirect("https://cdn.discordapp.com/attachments/905337980447780924/927575534991470622/Screenshot_20220103-215353_Discord.jpg");
        });

        app.get("/partners/:guildId/:ticketId.png", async(req, res) => {
            const data = await (require("../../src/Data/partner")).findOne({ guildId: "706744372326039573" });
            let index = data.partnerList.map(i => {
                return i.guild.id;
            }).indexOf(req.params.guildId);
            let guildPartner = data.partnerList[index];
            if(!guildPartner) return res.redirect("/");
            if(!guildPartner.ticketId.includes(req.params.ticketId)) return res.redirect("/");

            let format = ".png";
            let iconURL = guildPartner.guild.iconURL.replace(".gif", format).replace(".jpg", format).replace(".webp", format);
            res.redirect(iconURL);
        });

        app.get("/partners/:guildId/:ticketId.webp", async(req, res) => {
            const data = await (require("../../src/Data/partner")).findOne({ guildId: "706744372326039573" });
            let index = data.partnerList.map(i => {
                return i.guild.id;
            }).indexOf(req.params.guildId);
            let guildPartner = data.partnerList[index];
            if(!guildPartner) return res.redirect("/");
            if(!guildPartner.ticketId.includes(req.params.ticketId)) return res.redirect("/");

            let format = ".webp";
            let iconURL = guildPartner.guild.iconURL.replace(".gif", format).replace(".jpg", format).replace(".png", format);
            res.redirect(iconURL);
        });

        app.get("/partners/:guildId/:ticketId.jpg", async(req, res) => {
            const data = await (require("../../src/Data/partner")).findOne({ guildId: "706744372326039573" });
            let index = data.partnerList.map(i => {
                return i.guild.id;
            }).indexOf(req.params.guildId);
            let guildPartner = data.partnerList[index];
            if(!guildPartner) return res.redirect("/");
            if(!guildPartner.ticketId.includes(req.params.ticketId)) return res.redirect("/");

            let format = ".jpg";
            let iconURL = guildPartner.guild.iconURL.replace(".png", format).replace(".gif", format).replace(".webp", format);
            res.redirect(iconURL);
        });

        app.get("/partners/:guildId/:ticketId.gif", async(req, res) => {
            const data = await (require("../../src/Data/partner")).findOne({ guildId: "706744372326039573" });
            let index = data.partnerList.map(i => {
                return i.guild.id;
            }).indexOf(req.params.guildId);
            let guildPartner = data.partnerList[index];
            if(!guildPartner) return res.redirect("/");
            if(!guildPartner.ticketId.includes(req.params.ticketId)) return res.redirect("/");

            let format = ".gif";
            let iconURL = guildPartner.guild.iconURL.replace(".png", format).replace(".jpg", format).replace(".webp", format);
            res.redirect(iconURL);
        });
    }
}