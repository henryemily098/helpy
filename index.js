require("dotenv").config();
const fs = require("fs");
const Client = require("./src/client/Client");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB, {autoIndex: false});

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Dashboard } = require("./Dashboard/dashboard");

const client = new Client().start(process.env.TOKEN);
const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (let file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    if(command.aliases) {
        for (let aliases of command.aliases) {
            client.aliases.set(aliases, command);
        }
    }
    if(command.data) {
        client.interactions.set(command.data.name, command);
    }
}

const dashboard = new Dashboard({
    bot: client,
    port: process.env.PORT || 5000
});
dashboard.init();

let slashCommands = [];
for (let command of client.interactions.toJSON()) {
    slashCommands.push(command.data);
}

(async() => {
    try {
        console.log("Refreshing (/) slash commands");
        rest.put(
            Routes.applicationCommands("761855907918905364"),
            { body: slashCommands }
        );
        console.log("Successfully (/) slash commands");
    } catch (error) {
        console.log(error);
    }
})();

client.on("ready", () => {
    console.log(`${client.user.tag} its ready!`);
    setInterval(() => {
        const guild = client.guilds.cache.get("706744372326039573");
        const randomMember = guild.members.cache.toJSON()[Math.floor(Math.random() * guild.memberCount)];
        client.user.setActivity(randomMember.user.tag, { type: "WATCHING" });
    }, 5000);
    
    setInterval(() => {
        check();
        partner();
        checkReddit();
        HandleCount();
    }, 5000);
});

let allowChannels = [
    "723048394494312478", "719098165214838876", "895172353779200040",
    "719100820695679037", "719045368830230528", "719039483886043157",
    "719039257213403218", "736844980307492925", "719043456277807214",
    "709282247387119678"
];

client.on("messageCreate", async(message) => {
    if(message.author.bot) return;
    if(!message.guild) return;

    const discordJS = require("discord.js");
    if(message.guild.id === "706744372326039573") {
        if(!allowChannels.includes(message.channel.id)) {
            const urlPattern =  /(https?:\/\/[^\s]+)/g;
            const words = message.content.split(" ");
            const member = message.member;
            let content = false;
      
            for (let i = 0;i < words.length;i++) {
                let word = words[i];
                const urlValid = urlPattern.test(word);
                if(urlValid) content = true;
            }
      
            if(content) {
                if(message.member.roles.cache.has("862700534058582017")) return;
                await message.delete();
                if(message.guild.roles.cache.get("727449744414081043")) {
                  await member.roles.add("727449744414081043");
                }
                let embed = new discordJS.MessageEmbed()
                  .setColor(client.data.color)
                  .setAuthor({ name: `${message.author.tag} has been warned`, iconURL: message.author.displayAvatarURL(client.data.avatarOptions) })
                  .setDescription(`**Reason:** Message contain link`);
                try {
                    let permission = message.channel.permissionsFor(client.user);
                    if(permission.has("SEND_MESSAGE") && permission.has("EMBED_LINKS")) message.channel.send({ embeds: [embed] }).catch(console.error);
                } catch (error) {
                    console.log(error);
                }
                setTimeout(() => {
                  if(message.guild.roles.cache.get("727449744414081043")) {
                      if(member.roles.cache.has("727449744414081043")) {
                          member.roles.remove("727449744414081043");
                      }
                  }
                }, 300*1000);
            }
        }

        if(message.channel.id === "748717267499483227") {

            const reminders = client.reminders.has(message.guild.id);
            const ms = require("ms");

            if(message.author.id === "302050872383242240") {

                if(!reminders) {

                    let embed = new discordJS.MessageEmbed()
                        .setColor(client.data.color)
                        .setTitle("Auto Reminder is on!")
                        .setDescription(`Reminder has been activated! Wait for 2 hours to bump the server again!`);
                    var reminderMessage = await message.channel.send({ embeds: [embed] });
                    client.reminders.set(message.guild.id, { date: Date.now(), end_date: (Date.now() + ms("2h")), message: reminderMessage.toJSON() });

                    setTimeout(() => {

                        const reminder = client.reminders.get(message.guild.id);
                        if(reminder) {

                            reminder.message.delete().catch(console.error);
                            client.reminders.delete(message.guild.id);

                            let reminderMbed = new discordJS.MessageEmbed()
                                .setColor(client.data.color)
                                .setTitle("Reminder Active")
                                .setDescription(`Reminder active! Bump server now, use \`/bump\` commands!`);
                            return message.channel.send({ embeds: [reminderMbed], content: "@here" });

                        }

                    }, ms("2h"));

                }

            }

        }

        if(message.channel.id === "719039483886043157") {
            await message.delete();
            message.channel.permissionOverwrites.create(message.author, { SEND_MESSAGES: false });
            const image = message.attachments.size > 0 ? await client.extension(message, message.attachments.array()[0].url) : "";
            let embed = new discordJS.MessageEmbed().setColor(client.data.color)
                .setTitle(`Suggestions Submissions`)
                .setDescription(message.content)
                .setImage(image)
            try {
                message.author.send(`You can submit a suggestion again after 5 minutes!`);
            } catch (error) {
                console.log(error);
            }
            var suggestionMsg = await message.channel.send({ embeds: [embed] });
            suggestionMsg.react(client.emojis.cache.get("843473342131732510"));
            suggestionMsg.react(client.emojis.cache.get("866517259317149707"));
            setTimeout(() => {
                message.channel.permissionOverwrites.delete(message.author);
            }, 5*60000);
        }

        if(!message.content.startsWith(client.data.prefix)) return;
        const args = message.content.slice(client.data.prefix.length).split(" ");
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName) || client.aliases.get(commandName);
        if(command) return command.run(message, client, args);
    }
});

client.on("interactionCreate", async(interaction) => {
    if(interaction.isCommand()) {
        const command = client.interactions.get(interaction.commandName);
        if(command) return command.interaction.run(interaction, client);
        return;
    }

    if(interaction.isButton()) {
        if(client.timeout.has(interaction.user.id)) {
            const discordJS = require("discord.js");
            let embed = new discordJS.MessageEmbed()
                .setColor(client.data.color)
                .setDescription("You're in slow mode! Wait a while to take on the role again.");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            const data = require("./src/reactionRoles/data").roles;
            const guild = client.guilds.cache.get("706744372326039573");
            const channel = guild.channels.cache.get("937697929009954866");
            const interactionMember = interaction.guild.members.cache.get(interaction.user.id);

            if(channel.isText()) {
                let str = "";
                const msgs = await channel.messages.fetch();
                for (let msg of msgs.toJSON()) {
                    if(msg.id === interaction.message.id) str += msg.id;
                }

                let customId = "";
                const existingMsg = msgs.get(str);
                for (let component of existingMsg.components) {
                    for (let button of component.components) {
                        if(button.customId === interaction.customId) customId += button.customId;
                    }
                }

                let index = data.announcements.map(i => {
                    return i.roleId;
                }).indexOf(customId);
                let index2 = data.colors.map(i => {
                    return i.roleId;
                }).indexOf(customId);
                let index3 = data.pronounce.map(i => {
                    return i.roleId;
                }).indexOf(customId);
                let index4 = data.language.map(i => {
                    return i.roleId;
                }).indexOf(customId);
                let index5 = data.other.map(i => {
                    return i.roleId;
                }).indexOf(customId);

                if(data.announcements[index]) {
                    if(interactionMember.roles.cache.has(data.announcements[index].roleId)) {
                        interactionMember.roles.remove(data.announcements[index].roleId);
                    } else {
                        let addRole = data.announcements[index].roleId;
                        interactionMember.roles.add(addRole);
                    }
                } else 
                if(data.colors[index2]) {
                    if(interactionMember.roles.cache.has(data.colors[index2].roleId)) {
                        interactionMember.roles.remove(data.colors[index2].roleId);
                    } else {
                        for (let role of data.colors) {
                            if(interactionMember.roles.cache.has(role.roleId)) interactionMember.roles.remove(role.roleId);
                        }
                        let addRole = data.colors[index2].roleId
                        interactionMember.roles.add(addRole);
                    }
                } else
                if(data.pronounce[index3]) {
                    if(interactionMember.roles.cache.has(data.pronounce[index3].roleId)) {
                        interactionMember.roles.remove(data.pronounce[index3].roleId);
                    } else {
                        for (let role of data.pronounce) {
                            if(interactionMember.roles.cache.has(role.roleId)) interactionMember.roles.remove(role.roleId);
                        }
                        let addRole = data.pronounce[index3].roleId;
                        interactionMember.roles.add(addRole);
                    }
                } else
                if(data.language[index4]) {
                    if(interactionMember.roles.cache.has(data.language[index4].roleId)) {
                        interactionMember.roles.remove(data.language[index4].roleId);
                    } else {
                        let addRole = data.language[index4].roleId;
                        interactionMember.roles.add(addRole);
                    }
                } else 
                if(data.other[index5]) {
                    if(data.other[index5].roleId === "749845020223209502") {
                        if(interactionMember.roles.cache.has("749906312225095711")) {
                            if(interactionMember.roles.cache.has("749845020223209502")) interactionMember.roles.remove("749845020223209502");
                            return interaction.reply({ content: "You can't take <@&749845020223209502> because  you already have <@&749906312225095711>!", ephemeral: true });
                        }
                        if(interactionMember.roles.cache.has("712558896329392170")) {
                            if(interactionMember.roles.cache.has("749845020223209502")) interactionMember.roles.remove("749845020223209502");
                            return interaction.reply({ content: "You can't take <@&749845020223209502> because  you already have <@&712558896329392170>!", ephemeral: true });
                        }
                    }
                    if(interactionMember.roles.cache.has(data.other[index5].roleId)) {
                        interactionMember.roles.remove(data.other[index5].roleId);
                    } else {
                        let addRole = data.other[index5].roleId;
                        interactionMember.roles.add(addRole);
                    }
                } else
                if(interaction.customId === "reset") {
                    for (let r of data.announcements) {
                        interactionMember.roles.remove(r.roleId);
                    }
                    for (let r of data.colors) {
                        interactionMember.roles.remove(r.roleId);
                    }
                    for (let r of data.language) {
                        interactionMember.roles.remove(r.roleId);
                    }
                    for (let r of data.other) {
                        interactionMember.roles.remove(r.roleId);
                    }
                    for (let r of data.pronounce) {
                        interactionMember.roles.remove(r.roleId);
                    }

                    return interaction.reply({ content: "Reset all reaction roles from you!", ephemeral: true });
                }

                client.timeout.set(interaction.user.id, { slowmode: 10 });
                setTimeout(() => {
                    client.timeout.delete(interaction.user.id);
                }, 5000);
                return interaction.reply({ content: `Finish interaction!`, ephemeral: true });
            }
        }
    }
});

client.on("guildMemberAdd", async(member) => {
    const discordJS = require("discord.js");
    const greetChannel = member.guild.channels.cache.get("708518759287095299");

    if(!greetChannel) return;
    if(greetChannel.isText()) {
        let embed = new discordJS.MessageEmbed().setColor(client.data.color)
            .setTitle("WELCOME TO THE "+member.guild.name.toLocaleUpperCase())
            .setDescription("Since you are new here, please read <#719038315357012050>, <#719038487214686278>, <#741891605920743435>. After read all of them, verify yourself and **ENJOY YOUR STAY!**")
            .setImage("https://tinyurl.com/rusujfgg")
            .setThumbnail(member.guild.iconURL({ dynamic: true, size: 1024, format: "png" }))
            .setFooter({ text: `[Greetings Powered by ${client.user.tag}]`, iconURL: client.user.displayAvatarURL(client.data.avatarOptions) });
        greetChannel.send({ content: `Welcome to the **${member.guild.name}**, ${member}`, embeds: [embed] });
        try {
            member.roles.add("718747564756828193");
        } catch (error) {
            console.log(error);
        }
        try {
            let message = client.data.greetingMsg
                .replace("{guild}", member.guild.name).replace("{user}", member)
            let attachment = new discordJS.MessageAttachment("https://tinyurl.com/rusujfgg", `welcome-${member.user.id}.png`);
            member.send({ content: message, files: [attachment] });
        } catch (error) {
            console.log(error);
        }
    }
});

let stats = {
    GuildID: "706744372326039573",
    TotalMembers: "758552146865160222",
    Users: "758552149679538198",
    Robots: "758552152813207552",
  };
  
async function HandleCount() {
    try {
        const Guild = client.guilds.cache.get(stats.GuildID);
        await Guild.members.fetch();

        var TotalMembers = Guild.memberCount;
        var Users = Guild.members.cache.filter(m => !m.user.bot).size;
        var RoBots = Guild.members.cache.filter(m => m.user.bot).size;
        await Guild.channels.cache.get(stats.TotalMembers).setName('Total Members: ' + TotalMembers);
        await Guild.channels.cache.get(stats.Users).setName('Users: ' + Users);
        await Guild.channels.cache.get(stats.Robots).setName('RoBots: ' + RoBots);
    } catch (error) {
        console.log(error);
    }
}

// Partner 

async function partner() {
    try {
        const partnerData = require("./src/Data/partner");
        const data = await partnerData.findOne({ guildId: "706744372326039573" });
        if(!data) return;
        let lastPartner = data.partnerList.shift();
        data.partnerList.push(lastPartner);
        data.save();
    } catch (error) {
        console.log(error)
    }
}

// youtube

const Parser = require("rss-parser");
const parser = new Parser();
const startAt = Date.now();
const lastVideos = {};

/**
 * Call a rss url to get the last video of a youtuber
 * @param {string} rssURL The rss url to call to get the videos of the youtuber
 * @returns The last video of the youtuber
 */
 async function getLastVideo(rssURL){
    let content = await parser.parseURL(rssURL);
    let tLastVideos = content.items.sort((a, b) => {
        let aPubDate = new Date(a.pubDate || 0).getTime();
        let bPubDate = new Date(b.pubDate || 0).getTime();
        return bPubDate - aPubDate;
    });
    return tLastVideos[0];
}

/**
 * Check if there is a new video from the youtube channel
 * @param {string} youtubeChannelId The name of the youtube channel to check
 * @param {string} rssURL The rss url to call to get the videos of the youtuber
 * @returns The video || null
 */
async function checkVideos(youtubeChannelId, rssURL){
    let lastVideo = await getLastVideo(rssURL);
    if(!lastVideo) return;
    if(new Date(lastVideo.pubDate).getTime() < startAt) return;
    let lastSavedVideo = lastVideos[youtubeChannelId];
    if(lastSavedVideo && (lastSavedVideo.id === lastVideo.id)) return;
    return lastVideo;
}

/**
 * Get the youtube channel id from an url
 * @param {string} url The URL of the youtube channel
 * @returns The channel ID || null
 */
function getYoutubeChannelIdFromURL(url) {
    let id = null;
    url = url.replace(/(>|<)/gi, "").split(/(\/channel\/|\/user\/)/);
    if(url[2]) {
      id = url[2].split(/[^0-9a-z_-]/i)[0];
    }
    return id;
}

async function check() {
    try {
        const discordJS = require("discord.js");
        let channelInfos = getYoutubeChannelIdFromURL("https://www.youtube.com/channel/UCqKuDEQ97gnh9woEU9jwa4A");
        let video = await checkVideos(channelInfos, `https://www.youtube.com/feeds/videos.xml?channel_id=${channelInfos}`);
        if(!video) return;

        let channel = client.channels.cache.get("742556431089401958");
        if(!channel) return;

        if(channel.isText()) {
            let videoInfo = await client.grab.youtube.getInfo(video.link);
            let embed = new discordJS.MessageEmbed().setColor("RANDOM")
                .setAuthor({ name: videoInfo.author.name, iconURL: "https://logos-world.net/wp-content/uploads/2020/04/YouTube-Emblem.png", url: "https://fnafmultiverse.herokuapp.com/youtube" })
                .addField("Video Description", `[${videoInfo.title.length > 67 ? videoInfo.title.substr(0, 67)+"..." : videoInfo.title}](https://fnafmultiverse.herokuapp.com/youtube?video=${videoInfo.id})`)
                .setThumbnail(videoInfo.author.thumbnails[2].url)
                .setImage(videoInfo.thumbnails[3].url)
                .setFooter({ text: `[100% property owned by ${client.user.tag}] | ${new Date().toLocaleDateString()}` });
            channel.send({ content: `**${videoInfo.author.name}** has uploaded a new video, @everyone! Go check it now!`, embeds: [embed] });
        }
        lastVideos[channelInfos] = video;
    } catch (error) {
        console.log(error);
    }
}

const lastPosts = {};

/**
 * Call a rss url to get the last video of a youtuber
 * @param {string} rssURL The rss url to call to get the videos of the youtuber
 * @returns The last video of the youtuber
 */
 async function getLastPost(rssURL){
    let content = await parser.parseURL(rssURL);
    let tLastPosts = content.items.sort((a, b) => {
        let aPubDate = new Date(a.pubDate || 0).getTime();
        let bPubDate = new Date(b.pubDate || 0).getTime();
        return bPubDate - aPubDate;
    });
    return tLastPosts[0];
}

/**
 * Check if there is a new video from the youtube channel
 * @param {string} subRedditName The name of the youtube channel to check
 * @param {string} rssURL The rss url to call to get the videos of the youtuber
 * @returns The video || null
 */
async function checkPosts(subRedditName, rssURL){
    let lastPost = await getLastPost(rssURL);
    if(!lastPost) return;
    if(new Date(lastPost.pubDate).getTime() < startAt) return;
    let lastSavedPost = lastPosts[subRedditName];
    if(lastSavedPost && (lastSavedPost.id === lastPost.id)) return;
    return lastPost;
}

async function checkReddit() {
    try {
        const discordJS = require("discord.js");
        let post = await checkPosts("FNaF_Multiverse", `https://www.reddit.com/r/FNaF_Multiverse.xml`);
        if(!post) return;
        let postInfo = await client.reddit.getPostInfo(post.link);

        let channel = client.channels.cache.get("889768582127448064");
        if(!channel) return;

        if(channel.isText()) {
            let embed = new discordJS.MessageEmbed().setColor(0xFF4301)
                .setAuthor({ name: postInfo.user.name, iconURL: "http://www.vectorico.com/download/social_media/Reddit-Icon.png", url: postInfo.user.url })
                .setDescription(`**${postInfo.title}**${postInfo.description.length > 0 ? `\n${postInfo.description.length > 256 ? `${postInfo.description.substr(0, 256)}...` : ""}` : ""}\n\n[\`link\`](https://fnafmultiverse.herokuapp.com/reddit?post=${postInfo.id})`)
                .setImage(postInfo.image)
                .setFooter({ text: `👥${postInfo.subReddit.name} | 📅${new Date().toLocaleDateString()}` });
            channel.send({ embeds: [embed] });
        }
        lastPosts[postInfo.subReddit.name] = post;
    } catch (error) {
        console.log(error);
    }
}