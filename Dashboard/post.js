const express = require("express");
const Client = require("../src/client/Client");
const Ticket = require("../src/Data/ticket");
const Partners = require("../src/Data/partner");
const customURL = require("../src/Data/customURL");
const Application = require("../src/Data/application");
const { MessageEmbed } = require("discord.js");

module.exports = ({ app=express(), client=new Client() }) => {
    app.post("/profile/:userId/edit", async(req, res) => {
        if(!req.session.user) return res.redirect(`/login?r=/profile/${req.params.userId}`);
        const guild = client.guilds.cache.get("706744372326039573");
        const member = guild.members.cache.get(req.params.userId);
        if(!member) return res.redirect(`/profile/${req.params.userId}`);

        if(req.body.change) {
            await member.setNickname(req.body.newNickname);
        } else if(req.body.reset) {
            await member.setNickname(null);
        }
        setTimeout(() => {
            return res.redirect(`/profile/${member.user.id}`);
        }, 1000);
    });

    app.post("/partners/apply/submit", async(req, res) => {
        if(!req.session.user) return res.redirect(`/login?r=/partners/apply`);
        const guild = client.guilds.cache.get("706744372326039573");
        let data = await Ticket.findOne({ guildId: guild.id });
        let partners = await Partners.findOne({ guildId: guild.id });

        let index = partners.partnerList.map(i => {
            return i.guild.id
        }).indexOf(req.body.id);
        if(partners.partnerList[index]) return res.redirect(`/partners/${req.body.id}`);
        
        var customId = client.generateId(10);
        let index2 = data.content.map(i => {
            return i.userInformation.userId;
        }).indexOf(req.session.user.id);
        if(data.content[index2]) return res.redirect(`/profile/${req.session.user.id}/partners/request/${data.content[index2].partnerTicket.ticketId}`);
        
        let index3 = req.session.guilds.map(i => {
            return i.id;
        }).indexOf(req.body.id)
        if(!req.session.guilds[index3] && (req.session.guilds[index3].permissions & 0x00000020) == 0x00000020) return res.redirect(`/partners/apply?error=YoureNotModeratorInThatServer`);
        
        let fetchData = req.session.guilds[index3];
        let channel = guild.channels.cache.get("906405142092447764");
        var ticketMessage;
        if(channel.isText()) {
            let embed = new MessageEmbed().setColor("RANDOM")
                .setTitle(fetchData.name)
                .addFields(
                    {
                        name: "Invite Link",
                        value: req.body.invite
                    },
                    {
                        name: "Description",
                        value: req.body.description > 2000 ? req.body.description.substr(0, 2000)+"..." : req.body.description
                    }
                )
                .setThumbnail(fetchData.icon ? `https://cdn.discordapp.com/icons/${fetchData.id}/${fetchData.icon}.png?size=1024` : "https://vectorified.com/images/discord-icon-9.png")
                .setImage(req.body.banner ? req.body.banner : null);
            ticketMessage = await channel.send({ content: `**Request Partner, <@&862700534058582017>!**\n<https://fnafmultiverse.herokuapp.com/${customId}>`, embeds: [embed] });
        }
        
        if(data) {
            let dataSchema = {
                userInformation: {
                    userTag: req.session.user.tag,
                    userId: req.session.user.id,
                    email: req.session.user.email,
                    userAvatar: req.session.user.avatarURL
                },
                partnerTicket: {
                    date: new Date().toLocaleDateString(),
                    guildInfo: {
                        name: fetchData.name,
                        id: fetchData.id,
                        description: req.body.description,
                        inviteLink: req.body.invite,
                        iconURL: fetchData.icon ? `https://cdn.discordapp.com/icons/${fetchData.id}/${fetchData.icon}.png?size=1024` : "https://vectorified.com/images/discord-icon-9.png",
                        banner: req.body.banner ? req.body.banner : null
                    },
                    ticketId: customId,
                    accepted: "Pending",
                    status: false
                },
                messageId: ticketMessage.id
            };
            data.content.push(dataSchema);
            data.save();
        }
        return res.redirect(`/profile/${req.session.user.id}/partners/request/${fetchData.id}/${customId}`);
    });

    app.post("/partner/ticket/:userId/:ticketId", async(req, res) => {
        const guild = client.guilds.cache.get("706744372326039573");
        const ticket = await Ticket.findOne({ guildId: guild.id });
        const data = await Partners.findOne({ guildId: guild.id });
        const Declined = require("../src/Data/decline");
        const declined = await Declined.findOne({ guildId: guild.id });

        if(req.session.user === req.body.userId) return res.redirect(`/profile/${req.params.userId}/partners/request/${req.params.ticketId}`);
        if(!guild.members.cache.get(req.params.userId) && !guild.members.cache.get(req.session.user.id).roles.cache.get("862700534058582017")) return res.redirect(`/profile/${req.params.userId}/partners/request/${req.params.ticketId}`);
        if(!guild.members.cache.get(req.session.user.id).roles.cache.has("862700534058582017")) return res.redirect(`/profile/${req.params.userId}/partners/request/${req.params.ticketId}`);

        let index = ticket.content.map(i => {
            return i.partnerTicket.ticketId
        }).indexOf(req.params.ticketId);
        let fetch = ticket.content[index];
        if(!fetch) return res.redirect(`/partner/apply`);

        let bodyData = {
            userTag: fetch.userInformation.userTag,
            userId: fetch.userInformation.userId,
            email: fetch.userInformation.email,
            guild: {
                name: fetch.partnerTicket.guildInfo.name,
                id: fetch.partnerTicket.guildInfo.id,
                description: fetch.partnerTicket.guildInfo.description,
                inviteLink: fetch.partnerTicket.guildInfo.inviteLink,
                iconURL: fetch.partnerTicket.guildInfo.iconURL,
                banner: fetch.partnerTicket.guildInfo.banner
            },
            ticketId: fetch.partnerTicket.ticketId,
            schema: req.body.schema
        }

        let ticketChannel = guild.channels.cache.get("906405142092447764");
        let ticketMbed = new MessageEmbed().setColor("RANDOM")
            .setTitle(bodyData.guild.name)
            .addFields(
                {
                    name: "Invite Link",
                    value: bodyData.guild.inviteLink
                },
                {
                    name: "Description",
                    value: bodyData.guild.description > 2000 ? bodyData.guild.description.substr(0, 2000)+"..." : bodyData.guild.description
                }
            )
            .setThumbnail(bodyData.guild.iconURL)
            .setImage(bodyData.guild.banner);
        if(ticketChannel.isText()) {
            let msg = await ticketChannel.messages.fetch();
            let findMsg = msg.find(m => m.id === fetch.messageId);
            findMsg.edit({ content: `Partner's Ticket has been responded!\n~~<https://fnafmultiverse.herokuapp.com/${req.params.ticketId}>~~`, embeds: [ticketMbed] })
        }
        ticket.content.splice(index, 1);
        ticket.save();

        var query;
        if(bodyData.schema.toLocaleUpperCase() === "ACCEPT") {
            let object = {
                guild: {
                    name: bodyData.guild.name,
                    id: bodyData.guild.id,
                    description: bodyData.guild.description,
                    inviteLink: bodyData.guild.inviteLink,
                    iconURL: bodyData.guild.iconURL,
                    banner: bodyData.guild.banner
                },
                representative: {
                    tag: bodyData.userTag,
                    id: bodyData.userId,
                    email: bodyData.email
                },
                ticketId: bodyData.ticketId,
                messageId: "",
                moderatorsId: [],
                comments: [],
                vote: [],
                date: new Date().toLocaleDateString()
            }
            let url = `https://fnafmultiverse.herokuapp.com/partners/${bodyData.guild.id}`;
            let channel = guild.channels.cache.get("763579593872506890");
            var partnerMessage = null;
            if(channel.isText()) {
                let embed = new MessageEmbed().setColor("RANDOM")
                    .setAuthor({ name: "Partner Server", iconURL: guild.iconURL(client.data.avatarOptions) })
                    .setTitle(bodyData.guild.name)
                    .setURL(bodyData.guild.inviteLink)
                    .setDescription(`**Representative:** <@${bodyData.userId}>\n\n${bodyData.guild.description}`)
                    .setThumbnail(bodyData.guild.iconURL)
                    .setImage(bodyData.guild.banner)
                    .setFooter({ text: `|[Powered by ${client.user.tag}]| • ${new Date().toLocaleDateString()}` })
                partnerMessage = await channel.send({ content: `<@&872032563634516038> **${embed.title}**\n<${url}>`, embeds: [embed] });
            }

            object.messageId = partnerMessage.id;
            guild.members.cache.get(object.representative.id).roles.add("759997955884449792");
            try {
                guild.members.cache.get(object.representative.id).send("**👷Congratulations!👷**\nYour server has been accepted! Please send this ads in your server (especially if you have partner channel):\n\n```FNaF Multiverse is a fan-made server of the most popular game in 2014 created by Scott Cawthon.\n\nThings that belong to FNaF Multiverse:\n> 🤖 Official bots (based on FNaF Characters)\n> 👥  A roleplay Category\n> 🐻 FNaF Category for people who want to talk about FNaF\n> 🎮 Gaming Channel, for people who search people for playing game together\n> 📊 Role rank system\n> 🛠️ Nice and helpful Staff\n> 🤝 Open partnership\n> 💡 Support all of members reports\n\n🔗 Server link: https://discord.gg/AFwd5Q8```\n\n- Helpy (Automatic Message)");
            } catch (error) {
                console.log(error);
            }

            let partners = data.partnerList.splice(0, data.partnerList.length);
            data.partnerList.push(object);
            for(let partner of partners) {
                data.partnerList.push(partner);
            }
            data.save();
            query = "accept";
        } else if(bodyData.schema === "DECLINE") {
            let object = {
                userId: bodyData.userId,
                ticketId: bodyData.ticketId
            }
            if(declined) {
                declined.declinedData.push(object);
                declined.save();
            } else {
                new Declined({
                    guildId: guild.id,
                    declinedData: [object]
                }).save();
            }
            query = "declined";
        }
        return res.redirect(`/profile/${req.params.userId}/partners/request/${req.params.ticketId}/${query}`);
    });

    app.post("/partners/:guildId/refresh", async(req, res) => {
        const guild = client.guilds.cache.get("706744372326039573");
        const data = await Partners.findOne({ guildId: guild.id });
        if(!req.session.user) return res.redirect(`/partners/${req.params.guildId}`);

        let index = data.partnerList.map(i => {
            return i.guild.id;
        }).indexOf(req.params.guildId);
        let partner = data.partnerList[index];
        if(!partner) return res.redirect("/partners");
        if(req.session.user.id !== partner.representative.id) return res.redirect(`/partners/${req.params.guildId}`);

        let index2 = req.session.guilds.map(i => {
            return i.id;
        }).indexOf(req.params.guildId);
        if(!req.session.guilds[index2]) return res.redirect("/partners");

        let newGuild = req.session.guilds[index2];
        let guildInfo = partner.guild;
        let representativeInfo = partner.representative;
        let url = `https://fnafmultiverse.herokuapp.com/partners/${guildInfo.id}`;

        guildInfo.name = newGuild.name;
        guildInfo.iconURL = newGuild.icon ? `https://cdn.discordapp.com/icons/${newGuild.id}/${newGuild.icon}.png?size=1024` : "https://vectorified.com/images/discord-icon-9.png";

        representativeInfo.tag = req.session.user.tag;
        representativeInfo.email = req.session.user.email;

        const channel = guild.channels.cache.get("763579593872506890");
        if(channel.isText()) {
            const messages = await channel.messages.fetch();
            const msgExisting = messages.find(msg => msg.id === partner.messageId);
            let embed = new MessageEmbed().setColor("RANDOM")
                .setAuthor({ name: "Partner Server", iconURL: guild.iconURL(client.data.avatarOptions) })
                .setTitle(newGuild.name)
                .setURL(guildInfo.inviteLink)
                .setDescription(`**Representative:** <@${representativeInfo.id}>\n\n${guildInfo.description}`)
                .setThumbnail(newGuild.icon ? `https://cdn.discordapp.com/icons/${newGuild.id}/${newGuild.icon}.png?size=1024` : "https://vectorified.com/images/discord-icon-9.png")
                .setImage(guildInfo.banner)
                .setFooter({ text: `|[Powered by ${client.user.tag}]| • ${partner.date}` });
            msgExisting.edit({ embeds: [embed], content: `<@&872032563634516038> **${embed.title}**\n<${url}>` });
        }
        data.save();

        return res.redirect(`/partners/${req.params.guildId}`);
    });

    app.post("/partners/:guildId/edit", async(req, res) => {
        if(req.body.cancel) return res.redirect(`/partners/${req.params.guildId}`);

        const guild = client.guilds.cache.get("706744372326039573");
        const data = await Partners.findOne({ guildId: guild.id });
        if(!req.session.user) return res.redirect(`/partners/${req.params.guildId}`);

        let index = data.partnerList.map(i => {
            return i.guild.id;
        }).indexOf(req.params.guildId);
        let partner = data.partnerList[index];
        if(!partner) return res.redirect("/partners");
        if(req.session.user.id !== partner.representative.id && partner.moderatorsId.includes(req.session.user.id)) return res.redirect(`/partners/${req.params.guildId}`);

        if(!req.body.description && !req.body.inviteLink) return res.redirect(`/partners/${req.params.guildId}/edit`);
        if((!req.body.moderatorId1 || req.body.moderatorId1 === partner.moderatorsId[0]) && (!req.body.moderatorId2 || req.body.moderatorId2 === partner.moderatorsId[1])) {
            partner.guild.description = req.body.description;
            partner.guild.bannerURL = req.body.bannerURL ? req.body.bannerURL : null;
            partner.guild.inviteLink = req.body.inviteLink;
        } else {
            partner.guild.description = req.body.description;
            partner.guild.bannerURL = req.body.bannerURL ? req.body.bannerURL : null;
            partner.guild.inviteLink = req.body.inviteLink;
            
            if(req.body.moderatorId1) {
                if(req.body.moderatorId1 !== partner.moderatorsId[0]) {
                    let secondMod = partner.moderatorsId[1];
                    partner.moderatorsId.splice(0, 2);
                    partner.moderatorsId.push(req.body.moderatorId1);
                    partner.moderatorsId.push(secondMod);
                }
            }

            if(req.body.moderatorId2) {
                if(req.body.moderatorId2 !== partner.moderatorsId[1]) {
                    let firstMod = partner.moderatorsId[0];
                    partner.moderatorsId.splice(0, 2);
                    partner.moderatorsId.push(firstMod);
                    partner.moderatorsId.push(req.body.moderatorId2);
                }
            }
        }

        const channel = guild.channels.cache.get("763579593872506890");
        const url = `https://fnafmultiverse.herokuapp.com/partners/${req.params.guildId}`;
        if(channel.isText()) {
            const messages = await channel.messages.fetch();
            const msgExisting = messages.find(msg => msg.id === partner.messageId);
            let embed = new MessageEmbed().setColor("RANDOM")
                .setAuthor({ name: "Partner Server", iconURL: guild.iconURL(client.data.avatarOptions) })
                .setTitle(partner.guild.name)
                .setURL(partner.guild.inviteLink)
                .setDescription(`**Representative:** <@${partner.representative.id}>\n\n${partner.guild.description}`)
                .setThumbnail(partner.guild.iconURL)
                .setImage(partner.guild.banner ? partner.guild.banner : "")
                .setFooter({ text: `|[Powered by ${client.user.tag}]| • ${partner.date}` });
            msgExisting.edit({ content: `<@&872032563634516038> **${embed.title}**\n<${url}>`, embeds: [embed] });
        }
        data.save();

        return res.redirect(`/partners/${req.params.guildId}`);
    });

    app.post("/admin/manage/url/submit", async(req, res) => {
        const guild = client.guilds.cache.get("706744372326039573");
        if(!req.session.user) return res.redirect(`/login?r=/admin/manage`);
        if(!guild.members.cache.get(req.session.user.id) && !client.data.ownerId.includes(req.session.user.id)) return res.redirect("/");
        if(!guild.members.cache.get(req.session.user.id).roles.cache.get("706745103984754718") && !client.data.ownerId.includes(req.session.user.id)) return res.redirect("/");
        
        const data = await customURL.findOne({ guildId: guild.id });
        let body = req.body;
        if(data) {
            let dataInput = {
                customQuery: client.generateId(10),
                redirectURL: body.url
            };
            data.customURL.push(dataInput);
            data.save();
        }
        return res.redirect("/admin/manage");
    });

    app.post("/teams/application/submit", async(req, res) => {
        if(!req.session.user) return res.redirect("/login?r=/teams/application");
        const guild = client.guilds.cache.get("706744372326039573");
        await guild.members.fetch();
        if(!guild.members.cache.has(req.session.user.id)) return res.redirect("/");

        const data = await Application.findOne({ guildId: guild.id });
        if(!data.status) return res.redirect("/teams/application?error=application_has_been_closed");
        let index = data.submissions.map(i => {
            return i.user.id;
        }).indexOf(req.session.user.id);
        if(data.submissions[index]) return res.redirect("/teams/application");

        var message = null;
        let customId = client.generateId(10);
        const member = guild.members.cache.get(req.session.user.id);
        const channel = guild.channels.cache.get("928097632352612403");
        if(channel.isText()) {
            let embed = new MessageEmbed().setColor(client.data.color)
                .setAuthor({ name: "Someone fill Application", iconURL:  member.user.displayAvatarURL(client.data.avatarOptions) })
                .addFields(
                    {
                        name: "Username:",
                        value: member.user.username,
                        inline: true
                    },
                    {
                        name: "Id:",
                        value: member.user.id,
                        inline: true
                    },
                    {
                        name: "Discriminator:",
                        value: member.user.discriminator,
                        inline: true
                    },
                    {
                        name: "Created At:",
                        value: new Date(member.user.createdTimestamp).toLocaleDateString(),
                        inline: true
                    },
                    {
                        name: "Joined At:",
                        value: new Date(member.joinedTimestamp).toLocaleDateString(),
                        inline: true
                    }
                );
            message = await channel.send({ content: `**<@&706745387192680469>, Application Submission!**\n<https://fnafmultiverse.herokuapp.com/${customId}>`, embeds: [embed] }, embed);
        }

        let body = req.body;
        let object = {
            user: {
                tag: req.session.user.tag,
                id: req.session.user.id
            },
            messageId: message.id,
            ticketId: customId,
            guider: {
                id: null,
                boolean: false
            },
            questions: [
                {
                    question: "What do you know about Discord?",
                    answer: body.question1
                },
                {
                    question: "Have you ever had experience as an admin, staff, or moderator?",
                    answer: body.question2
                },
                {
                    question: "How many servers do you have?",
                    answer: body.question3
                },
                {
                    question: "How active are you from a scale of 1-10?",
                    answer: body.question4
                },
                {
                    question: "What is your timezone?",
                    answer: body.question5
                },
                {
                    question: "Have you ever had problems with other staff on a different server that forced you to leave the server? And why?",
                    answer: body.question6
                },
                {
                    question: "If you became official staff, what would you do?",
                    answer: body.question7
                },
                {
                    question: "What will you do if a raider/spammer comes and your the only staff only or the other staff online is busy?",
                    answer: body.question8
                },
                {
                    question: "Have you ever had to kick or get banned from other servers, because of what you did?",
                    answer: body.question9
                },
                {
                    question: "If you think that there are rules that are incomplete in explaining something, what are they? And how to explain it briefly and completely?",
                    answer: body.question10
                }
            ]
        }
        member.roles.add("791637881868517376");
        try {
            member.send("Thank you for filling out the staff application! Moderators will check your application. If you want to make it easier to become an official staff quickly, do a bump on #⬆│disboard. They will see it as some plus points.");
        } catch (error) {
            console.log(error);
        }

        data.submissions.push(object);
        data.save();

        return res.redirect("/teams/application");
    });

    app.post("/teams/status", async(req, res) => {
        if(!req.session.user) return res.redirect("/login?r=/teams");
        if(!client.data.ownerId.includes(req.session.user.id)) return res.redirect("/teams");

        const guild = client.guilds.cache.get("706744372326039573")
        const data = await Application.findOne({ guildId: guild.id });

        if(req.body.open) {
            data.status = true;
        }

        if(req.body.close){
            data.status = false;
        }
        data.save();

        return res.redirect("/teams");
    });

    app.post("/teams/application/status", async(req, res) => {
        if(!req.session.user) return res.redirect("/api?r=/teams/application");
        if(!client.data.ownerId.includes(req.session.user.id)) return res.redirect("/teams/application");

        const guild = client.guilds.cache.get("706744372326039573")
        const data = await Application.findOne({ guildId: guild.id });

        if(req.body.open) {
            data.status = true;
        }

        if(req.body.close){
            data.status = false;
        }
        data.save();

        return res.redirect("/teams/application");
    });

    app.post("/teams/application/:userId", async(req, res) => {
        const guild = client.guilds.cache.get("706744372326039573");
        const channel = guild.channels.cache.get("928097632352612403");
        const data = await Application.findOne({ guildId: guild.id });
        let index = data.submissions.map(i => {
            return i.user.id;
        }).indexOf(req.params.userId);
        await guild.members.fetch();

        if(!req.session.user) return res.redirect(`/api?r=/teams/application/${req.params.userId}`);
        if(!guild.members.cache.has(req.session.user.id)) return res.redirect(`/teams`);

        const staffMember = guild.members.cache.get(req.session.user.id);
        if(!staffMember.roles.cache.has("862700534058582017") && !staffMember.roles.cache.has("706745103984754718")) return res.redirect("/teams/application");
        if(!guild.members.cache.has(req.params.userId)) {
            if(data.submissions[index]) {
                data.submissions.splice(index, 1);
                data.save();
            }
            return res.redirect("/teams");
        }
        if(guild.members.cache.get(req.params.userId).roles.cache.has("862700534058582017")) {
            if(data.submissions[index]) {
                data.submissions.splice(index, 1);
                data.save();
            }
            return res.redirect("/teams");
        }

        let body = req.body;
        if(!body) return res.redirect(`/teams/application/${req.params.userId}`);
        if(data.submissions[index].guider.boolean) {
            if(req.session.user.id !== data.submissions[index].guider.id) return res.redirect(`/teams/application/${req.params.userId}?error=AlreadyTaken`);
            if(body.accept) {
                let newStaff = guild.members.cache.get(data.submissions[index].user.id);
                newStaff.roles.add("862700534058582017");
                newStaff.roles.add("718752155707899904");

                try {
                    newStaff.send("Congratulation! You have been accepted by the official staff of FNaF Multiverse! Do your job better!\nhttps://fnafmultiverse.herokuapp.com/teams")
                } catch (error) {
                    console.log(error);
                }

                data.submissions.splice(index, 1);
                data.save();
                return res.redirect("/teams");
            }
            if(body.declined) {
                let newStaff = guild.members.cache.get(data.submissions[index].user.id);
                if(newStaff.roles.cache.has("791637881868517376")) {
                    newStaff.roles.remove("791637881868517376");
                }

                try {
                    newStaff.send("Better luck next time dude . . . Maybe you don't contribute much to this server.");
                } catch (error) {
                    console.log(error);
                }

                data.submissions.splice(index, 1);
                data.save();
                return res.redirect("/teams");
            }
        } else {
            if(body.take) {
                let newObject = data.submissions[index];
                newObject.guider.id = req.session.user.id;
                newObject.guider.boolean = true;

                if(channel.isText()) {
                    const messages = await channel.messages.fetch();
                    const existingMsg = messages.find(msg => msg.id === newObject.messageId);
                    if(existingMsg) {
                        const member = guild.members.cache.get(data.submissions[index].user.id);
                        const embed = new MessageEmbed().setColor(client.data.color)
                            .setAuthor({ name: "Someone fill Application", iconURL: member.user.displayAvatarURL(client.data.avatarOptions) })
                            .addFields(
                                {
                                    name: "Username:",
                                    value: member.user.username,
                                    inline: true
                                },
                                {
                                    name: "Id:",
                                    value: member.user.id,
                                    inline: true
                                },
                                {
                                    name: "Discriminator:",
                                    value: member.user.discriminator,
                                    inline: true
                                },
                                {
                                    name: "Created At:",
                                    value: new Date(member.user.createdTimestamp).toLocaleDateString(),
                                    inline: true
                                },
                                {
                                    name: "Joined At:",
                                    value: new Date(member.joinedTimestamp).toLocaleDateString(),
                                    inline: true
                                }
                            );
                        existingMsg.edit({ content: `**${req.session.user.tag}** will guide this Trial Employee!\n<https://fnafmultiverse.herokuapp.com/${data.submissions[index].ticketId}>`, embeds: [embed] });
                    }
                }

                try {
                    guild.members.cache.get(req.params.userId).send(`Moderators respond! The person who will guide you is **${guild.members.cache.get(req.session.user.id).user.username}**!`);
                } catch (error) {
                    console.log(error);
                }

                data.submissions.splice(index, 1);
                data.submissions.push(newObject);
                data.save();
                return res.redirect(`/teams/application/${req.params.userId}`);
            } else {
                return res.redirect(`/teams/application/${req.params.userId}`);
            }
        }
    });
}