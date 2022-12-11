const express = require("express");
const tickets = require("../src/Data/ticket");
const Client = require("../src/client/Client");
const partners = require("../src/Data/partner");
const Declined = require("../src/Data/decline");
const customURL = require("../src/Data/customURL");
const Application = require("../src/Data/application");

module.exports.default = {
    get({ app=express(), client=new Client() }) {
        app.get("/", async(req, res) => {
            const guild = client.guilds.cache.get("706744372326039573");
            res.render("index", { bot: client, req, guild });
        });

        app.get("/faq", async(req, res) => {
            const guild = client.guilds.cache.get("706744372326039573");
            await guild.members.fetch({ member: true, user: true, withPresences: true });
            const guider = guild.members.cache.get("796789848228757514");
            res.render("faq", { bot: client, guild, req, guider });
        });

        app.get("/teams", async(req, res) => {
            const guild = client.guilds.cache.get("706744372326039573");
            await guild.members.fetch({ member: true, withPresences: true, user: true });
            const primeMinister = guild.members.cache.filter(m => m.roles.highest.id === "706745103984754718" || m.roles.highest.id === "755286810829258845");
            const moderators = guild.members.cache.filter(m => m.roles.highest.id === "706745387192680469" || m.roles.highest.id === "801622071045914644");
            const jrsModerators = guild.members.cache.filter(m => m.roles.highest.id === "718752155707899904");

            const application = await Application.findOne({ guildId: guild.id });
            res.render("teams", { bot: client, guild, req, primeMinister, moderators, jrsModerators, data: application });
        });

        app.get("/teams/application", async(req, res) => {
            if(!req.session.user) return res.redirect("/login?r=/teams/application");
            const guild = client.guilds.cache.get("706744372326039573");
            await guild.members.fetch();
            const application = await Application.findOne({ guildId: guild.id });

            let index = application.submissions.map(i => {
                return i.user.id;
            }).indexOf(req.session.user.id);
            let data = application.submissions[index];

            res.render("application", { bot: client, guild: guild, req: req, data: data, application: application });
        });

        app.get("/teams/application/:userId", async(req, res) => {
            if(!req.session.user) return res.redirect(`/login?r=/teams/application/${req.params.userId}`);
            const guild = client.guilds.cache.get("706744372326039573");
            await guild.members.fetch();
            const data = await Application.findOne({ guildId: guild.id });
            let index = data.submissions.map(i => {
                return i.user.id;
            }).indexOf(req.params.userId);

            if(req.query.error) return res.render("404guild", { bot: client, guild, req, backMsg: "home", msg: "Application", url: "/" });
            if(!guild.members.cache.has(req.session.user.id)) return res.redirect("/teams");
            if(!data.submissions[index]) return res.redirect(`/teams/application/${req.params.userId}`);

            let member = guild.members.cache.get(req.session.user.id);
            if(!member.roles.cache.has("706745387192680469") && !member.roles.cache.has("706745103984754718")) return res.redirect("/teams/application");
            if(!guild.members.cache.has(req.params.userId)) {
                data.submissions.splice(index, 1);
                data.save();
                return res.redirect(`/teams/application/${req.params.userId}`);
            }
            if(guild.members.cache.get(req.params.userId).roles.cache.has("862700534058582017")) {
                data.submissions.splice(index, 1);
                data.save();
                return res.redirect("/teams");
            }

            res.render("applicationSubmissions", { bot: client, guild: guild, req: req, data: data.submissions[index], member: guild.members.cache.get(req.params.userId) });
        });
        
        app.get("/profile", async(req, res) => {
            if(!req.session.user) return res.redirect("/login?r=/profile");
            res.redirect(`/profile/${req.session.user.id}`);
        });

        app.get("/profile/:userId", async(req, res) => {
            if(!req.session.user) return res.redirect(`/login?r=/profile/${req.params.userId}`);
            if(req.session.user.id !== req.params.userId) return res.redirect(`/profile/${req.session.user.id}`);

            const guild = client.guilds.cache.get("706744372326039573");
            await guild.members.fetch();
            res.render("userProfile", { req, bot: client, guild });
        });

        app.get("/profile/:userId/partners/request/:guildId/:ticketId", async(req, res) => {
            if(!req.session.user) return res.redirect(`/login?r=/profile/${req.params.userId}/partners/request/${req.params.ticketId}`);
            const guild = client.guilds.cache.get("706744372326039573");
            if(req.session.user.id !== req.params.userId && !guild.members.cache.get(req.session.user.id)) return res.redirect(`/profile/${req.session.user.id}`);
            if(req.session.user.id !== req.params.userId && !guild.members.cache.get(req.session.user.id).roles.cache.has("862700534058582017")) return res.redirect(`/profile/${req.session.user.id}`);
            
            const ticket = await tickets.findOne({ guildId: guild.id });
            let index = ticket.content.map(i => {
                return i.partnerTicket.ticketId
            }).indexOf(req.params.ticketId);
            if(!ticket.content[index]) return res.redirect(`/partners/apply`);

            let index2 = ticket.content.map(i => {
                return i.userInformation.userId;
            }).indexOf(req.params.userId);
            if(!ticket.content[index2]) return res.redirect(`/partners/apply`);

            const partner = await partners.findOne({ guildId: guild.id });
            const declined = await Declined.findOne({ guildId: guild.id });

            let index3 = partner.partnerList.map(i => {
                return i.ticketId;
            }).indexOf(req.params.ticketId);
            let index4 = declined.declinedData.map(i => {
                return i.ticketId;
            }).indexOf(req.params.ticketId);
            if(partner.partnerList[index3] || declined.declinedData[index4]) return res.redirect("/partners/apply?error=TheTicketHasAlreadyRespond");

            let index5 = partner.partnerList.map(i => {
                return i.guild.id;
            }).indexOf(req.params.guildId);
            if(partner.partnerList[index5]) return res.redirect(`/partners/${req.params.guildId}`);

            res.render("ticket", { bot: client, req, guild, fetchData: ticket.content[index] });
        });

        app.get("/partners", async(req, res) => {
            const guild = client.guilds.cache.get("706744372326039573");
            const data = await partners.findOne({ guildId: guild.id });
            res.render("partners", { req, bot: client, guild, data });
        });

        app.get("/partners/terms", async(req, res) => {
            const guild = client.guilds.cache.get("706744372326039573");
            const member = guild.members.cache.get("654931494737018882");
            res.render("partnerTerms", { req, bot: client, guild, member });
        });

        app.get("/partners/accept", async(req, res) => {
            const guild = client.guilds.cache.get("706744372326039573");
            const member = guild.members.cache.get("654931494737018882");
            if(!member) return res.redirect("/partners");
            if(!member.roles.cache.has("862700534058582017")) return res.redirect("/partners");

            res.render("acceptPartner", { guild: guild, req, bot: client });
        });

        app.get("/partners/apply", async(req, res) => {
            if(!req.session.user) return res.redirect(`/login?r=/partners/apply`);
            const guild = client.guilds.cache.get("706744372326039573");
            const data = await tickets.findOne({ guildId: guild.id });

            let index = data.content.map(i => {
                return i.userInformation.userId;
            }).indexOf(req.session.user.id);
            let fetchData = data.content[index];
            if(fetchData) return res.redirect(`/profile/${req.session.user.id}/partners/request/${fetchData.partnerTicket.ticketId}`);

            res.render("applyPartner", { req, bot: client, guild });
        });

        app.get("/partners/:guildId", async(req, res) => {
            const guild = client.guilds.cache.get("706744372326039573");
            const data = await partners.findOne({ guildId: guild.id });

            let index = data.partnerList.map(i => {
                return i.guild.id;
            }).indexOf(req.params.guildId);
            if(req.query.error) return res.render("404guild", { bot: client, guild, req, backMsg: "Partner", msg: "Partner", url: "/partners" });
            if(!data.partnerList[index]) return res.redirect(`/partners/${req.params.guildId}?error=not_found`);

            res.render("guild", { req, bot: client, guild, data: data.partnerList[index] });
        });

        app.get("/partners/:guildId/edit", async(req, res) => {
            if(!req.session.user) return res.redirect(`/login?r=/partners/${req.params.guildId}/edit`);
            const guild = client.guilds.cache.get("706744372326039573");
            const data = await partners.findOne({ guildId: guild.id });

            let index = data.partnerList.map(i => {
                return i.guild.id
            }).indexOf(req.params.guildId);
            let partner = data.partnerList[index];

            if(!partner) return res.redirect("/partners");
            if(req.session.user.id !== partner.representative.id && !partner.moderatorsId.includes(req.session.user.id)) return res.redirect(`/partners/${req.params.guildId}`);

            res.render("partnerEdit", { bot: client, guild, req, data: partner });
        });

        app.get("/profile/:userId/partners/request/:ticketId/:query", async(req, res) => {
            if(!req.session.user) return res.redirect(`/login?r=/profile/${req.params.userId}/partners/request/${req.params.ticketId}/${req.params.query}`);
            const guild = client.guilds.cache.get("706744372326039573");
            let data = await partners.findOne({ guildId: guild.id });
            let data2 = await Declined.findOne({ guildId: guild.id });

            var redirectURL;
            if(req.params.query !== "accept" && req.params.query !== "declined") return res.redirect(`/profile/${req.params.userId}/partners/request/${req.params.ticketId}`);
            if(req.params.query === "accept") {
                if(!data) return res.redirect("/");
                let index = data.partnerList.map(i => {
                    return i.ticketId;
                }).indexOf(req.params.ticketId);
                if(!data.partnerList[index]) return res.redirect("/");
                redirectURL = `/partners/${data.partnerList[index].guild.id}`;
            }
            if(req.params.query === "declined") {
                if(!data2) return res.redirect("/");
                let index = data2.declinedData.map(i => {
                    return i.ticketId;
                }).indexOf(req.params.ticketId);
                if(!data2.declinedData[index]) return res.redirect("/");
                redirectURL = "/";
            }
            res.render("onload", { req, bot: client, guild, redirectURL });
        });

        app.get("/youtube", async(req, res) => {
            if(req.query.video) {
                let video = await client.grab.youtube.getInfo(`https://www.youtube.com/watch?v=${req.query.video}`);
                if(!video) return res.redirect(`https://bit.ly/OfficialFNaFMultiverse`);
                return res.redirect(video.url);
            } else {
                return res.redirect("https://bit.ly/OfficialFNaFMultiverse");
            }
        });

        app.get("/reddit", async(req, res) => {
            const fetch = require("node-fetch").default;
            if(!req.query.post) {
                let url = `https://www.reddit.com/r/FNaF_Multiverse`;
                if(req.query.type) {
                    if(req.query.type === "json") {
                        let json = await fetch(`${url}.json`).then(res => res.json());
                        return res.send(json);
                    } else {
                        return res.redirect(url);
                    }
                }
                return res.redirect(url);
            }
            
            if(req.query.post) {
                const guild = client.guilds.cache.get("706744372326039573");
                let reddit = await fetch(`https://www.reddit.com/r/FNaF_Multiverse/comments/${req.query.post}/.json`).then(res => res.json());
                if(reddit.error) return res.render("404guild", { bot: client, guild, req, backMsg: "home", msg: "Reddit post", url: "/" });

                let data = reddit[0].data.children[0].data;
                let url = `https://www.reddit.com${data.permalink}`;
                if(req.query.type) {
                    if(req.query.type === "json") {
                        let json = await fetch(`${url}.json`).then(res => res.json());
                        return res.send(json);
                    } else {
                        return res.redirect(url);
                    }
                }
                return res.redirect(url);
            }
        });

        app.get("/storage/api/fnafcharacters.json", async(req, res) => {
            let data = require("../src/characters").characters;
            res.json(data);
        });

        app.get("/:customId", async(req, res) => {
            const guild = client.guilds.cache.get("706744372326039573");
            const data = await customURL.findOne({ guildId: guild.id });
            const ticket = await tickets.findOne({ guildId: guild.id });
            const partner = await partners.findOne({ guildId: guild.id });
            const application = await Application.findOne({ guildId: guild.id });
            
            let index = ticket.content.map(i => {
                return i.partnerTicket.ticketId
            }).indexOf(req.params.customId);
            let index2 = data.customURL.map(i => {
                return i.customQuery;
            }).indexOf(req.params.customId);
            let index3 = partner.partnerList.map(i => {
                return i.ticketId;
            }).indexOf(req.params.customId);
            let index4 = application.submissions.map(i => {
                return i.ticketId;
            }).indexOf(req.params.customId);

            let fetch = data.customURL[index2];
            let fetchTicket = ticket.content[index];
            let fetchPartner = partner.partnerList[index3];
            let fetchApplication = application.submissions[index4];
            
            if(req.query.error) return res.render("404guild", { bot: client, guild, req, backMsg: "home", msg: "Custom URL", url: "/" });
            if(fetch) {
                return res.redirect(fetch.redirectURL);
            } else if(fetchTicket) {
                return res.redirect(`/profile/${fetchTicket.userInformation.userId}/partners/request/${fetchTicket.partnerTicket.guildInfo.id}/${req.params.customId}`);
            } else if(fetchPartner) {
                return res.redirect(`/partners/${fetchPartner.guild.id}`);
            } else if(fetchApplication) {
                return res.redirect(`/teams/application/${fetchApplication.user.id}`);
            } else {
                return res.redirect(`/${req.params.customId}?error=not_found`);
            }
        });

        require("./post")({ app, client });
    }
}