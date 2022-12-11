const { Reddit } = require("../Reddit/index");
const { Client, Collection, Partials } = require('discord.js');

module.exports = class extends Client {
    constructor() {
        super({
            partials: [Partials.Channel, Partials.GuildMember, Partials.GuildScheduledEvent, Partials.Message, Partials.Reaction, Partials.ThreadMember, Partials.User],
            intents: [
                "DirectMessageReactions",
                "DirectMessageTyping",
                "DirectMessages",
                "GuildBans",
                "GuildEmojisAndStickers",
                "GuildIntegrations",
                "GuildInvites",
                "GuildMembers",
                "GuildMessageReactions",
                "GuildMessageTyping",
                "GuildMessages",
                "GuildPresences",
                "GuildScheduledEvents",
                "GuildVoiceStates",
                "GuildWebhooks",
                "Guilds",
                "MessageContent"
            ]
        });

        this.timeout = new Map();
        this.reddit = new Reddit();

        this.reminders = new Map();
        this.interactions = new Collection();
        this.commands = new Collection();
        this.aliases = new Collection();

        this.reaction = require("../Data/reactionRoles");
        this.data = require('../config.json');
        this.util = require('../util');
    }
    extension(message, attachment) {
        const imageLink = attachment.split('.');
        const typeOfImage = imageLink[imageLink.length - 1];
        const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
        if (!image) return '';
        return attachment;
    }
    buildWeb() {
        const express = require("express");
        const app = express();
        return app;
    }
    /**
     * @param {string} token 
     */
    start(token) {
        this.login(token);
        return this;
    }
    /**
     * @param {Number} length
     * @returns 
     */
    generateId(length) {
        let results = "";
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            results += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return results;
    }
}