const warns = require('../src/Data/warns');
const { MessageEmbed, Message, WebhookClient } = require('discord.js');
const Client = require('../src/client/Client');
const ms = require('ms');

module.exports = { 
    name: "warn",
    description: "Warned people",
    data: {
        name: "warn",
        description: "Warned people",
        options: [
            {
                name: "target",
                description: "target member!",
                type: 6,
                required: true
            },
            {
                name: "reason",
                description: "Give a reason!",
                type: 3,
                required: true
            }
        ]
    },
    /**
     * @param {Message} message 
     * @param {Client} client 
     * @param {String[]} args 
     */
    async run(message, client, args){
        if(!message.member.roles.cache.has('862700534058582017')) return message.channel.send(`Missing Permission: \`MANAGE_MESSAGES\``);
        if(args.length < 1) return message.channel.send("You must mention user!");

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if(!member) return message.channel.send(`They're not in this server!`);
        if(member){
            if(member.permissions.has('862700534058582017')) return message.channel.send(`Sorry, you can't warn this member, ${message.author}!`);
        }

        const reason = args.splice(1).join(' ') || 'No reason provide';
        message.delete();

        const userId = member.user.id;
        const guildId = message.guild.id;
        const moderatorId = message.author.id;
        
        warns.findOne({ userID: userId, guildID: guildId }, async(err, data) => {
            if(err) throw err;
            if(!data) {
                data = new warns({
                    userID: userId,
                    guildID: guildId,
                    content: [
                        {
                            moderator: moderatorId,
                            reason: reason
                        }
                    ]
                });
            } else {
                let object = {
                    moderator: moderatorId,
                    reason: reason
                };
                data.content.push(object);
            }
            data.save();

            var minute = 60*1000;
            const role = message.guild.roles.cache.get("727449744414081043");
            if(data.content.length == 1) return;
            else if (6 > data.content.length >= 2) {
                member.roles.add(role.id);
                setTimeout(() => {
                    member.roles.remove(role.id);
                }, data.content.length*minute);
            }
            else if(data.content.length == 6) {
                    try {
                        await member.send('**You has been Kicked**, now Goodbye! <:GetOut:771279088455122984>');
                    } catch(err) {
                        console.log(err);
                    }
                    member.kick(`${member.user.tag} have 6 infractions in my data!`);
                }
            else if(10 > data.content.length >= 7) {
                try {
                    await member.send('**You has been Banned**, now Goodbye for 3 days from now! <a:Aftondeath:740863798256074782>');
                } catch(err) {
                    console.log(err);
                }
                member.ban({ reason: `${member.user.tag} have 7 infractions and they got tempban for 1 day!` });
                setTimeout(() => {
                    message.guild.members.unban(member.user);
                }, ms('3d'));
            }
            else if(data.content.length === 10) {
                try {
                    await member.send('**You has been Banned**, now Goodbye! <a:Aftondeath:740863798256074782>');
                } catch(err) {
                    console.log(err);
                }
                member.ban({ reason: `Badword Usage! ${member.user.tag} have 10 infractions and they got permanent ban because of what they did!` });
                await warns.findByIdAndDelete({ userID: member.user.id, guildID: guildId });
            }
        });

        const hook = new WebhookClient('798760239985852436', 'rFqnBn7IP5TD8fnViY-1EbvFLT0aRqft6oYIUDiwWoUNYx2DtJsB3pU4Zmim0qvtW6Q3');
        const log = new MessageEmbed()
            .setAuthor({ name: `[WARN] ${member.user.tag}`, iconURL: member.user.displayAvatarURL(client.data.avatarOptions) })
            .setColor(client.data.color)
            .addField('User:', `<@${member.user.id}>`, true)
            .addField('Moderator:', `<@${message.author.id}>`, true)
            .addField('Reason:', reason);
        hook.send({
            username: client.user.username,
            avatarURL: client.user.displayAvatarURL(client.data.avatarOptions),
            embeds: [log]
        });

        const embed = new MessageEmbed()
            .setAuthor({ name: `${member.user.tag} has been warned`, iconURL: member.user.displayAvatarURL(client.data.avatarOptions) })
            .setDescription(`**Reason:** ${reason}`);
        message.channel.send({ embeds: [embed] });
    },
    interaction: {
        /**
         * @param {import("discord.js").CommandInteraction} interaction 
         * @param {import("../src/client/Client")} client 
         */
        async run(interaction, client) { 
            if(!interaction.member.roles.cache.has('862700534058582017')) return interaction.reply({ content: `Missing Permission: \`MANAGE_MESSAGES\``, ephemeral: true });

            const target = interaction.options.getUser("target");
            const member = interaction.guild.members.cache.get(target.id);
            if(!member) return interaction.reply({ content: `They're not in this server!`, ephemeral: true });
            if(member){
                if(member.permissions.has('862700534058582017')) return interaction.reply({ content: `Sorry, you can't warn this member, ${message.author}!`, ephemeral: true });
            }

            const userId = member.user.id;
            const guildId = interaction.guild.id;
            const moderatorId = interaction.user.id;
            const reason = interaction.options.getString("reason");
            
            warns.findOne({ userID: userId, guildID: guildId }, async(err, data) => {
                if(err) throw err;
                if(!data) {
                    data = new warns({
                        userID: userId,
                        guildID: guildId,
                        content: [
                            {
                                moderator: moderatorId,
                                reason: reason
                            }
                        ]
                    });
                } else {
                    let object = {
                        moderator: moderatorId,
                        reason: reason
                    };
                    data.content.push(object);
                }
                data.save();

                var minute = 60*1000;
                const role = interaction.guild.roles.cache.get("727449744414081043");

                if(data.content.length == 1) return;
                else if (6 > data.content.length >= 2) {
                    member.roles.add(role.id);
                    setTimeout(() => {
                        member.roles.remove(role.id);
                    }, data.content.length*minute);
                }
                else if(data.content.length == 6) {
                        try {
                            await member.send('**You has been Kicked**, now Goodbye! <:GetOut:771279088455122984>');
                        } catch(err) {
                            console.log(err);
                        }
                        member.kick(`${member.user.tag} have 6 infractions in my data!`);
                    }
                else if(10 > data.content.length >= 7) {
                    try {
                        await member.send('**You has been Banned**, now Goodbye for 3 days from now! <a:Aftondeath:740863798256074782>');
                    } catch(err) {
                        console.log(err);
                    }
                    member.ban({ reason: `${member.user.tag} have 7 infractions and they got tempban for 1 day!` });
                    setTimeout(() => {
                        interaction.guild.members.unban(member.user);
                    }, ms('3d'));
                }
                else if(data.content.length === 10) {
                    try {
                        await member.send('**You has been Banned**, now Goodbye! <a:Aftondeath:740863798256074782>');
                    } catch(err) {
                        console.log(err);
                    }
                    member.ban({ reason: `Badword Usage! ${member.user.tag} have 10 infractions and they got permanent ban because of what they did!` });
                    await warns.findByIdAndDelete({ userID: member.user.id, guildID: guildId });
                }
            });

            const hook = new WebhookClient('798760239985852436', 'rFqnBn7IP5TD8fnViY-1EbvFLT0aRqft6oYIUDiwWoUNYx2DtJsB3pU4Zmim0qvtW6Q3');
            const log = new MessageEmbed()
                .setAuthor({ name: `[WARN] ${member.user.tag}`, iconURL: member.user.displayAvatarURL(client.data.avatarOptions) })
                .setColor(client.data.color)
                .addField('User:', `<@${member.user.id}>`, true)
                .addField('Moderator:', `<@${interaction.user.id}>`, true)
                .addField('Reason:', reason);
            hook.send({
                username: client.user.username,
                avatarURL: client.user.displayAvatarURL(client.data.avatarOptions),
                embeds: [log]
            });

            const embed = new MessageEmbed()
                .setAuthor({ name: `${member.user.tag} has been warned`, iconURL: member.user.displayAvatarURL(client.data.avatarOptions) })
                .setDescription(`**Reason:** ${reason}`);
            interaction.reply({ embeds: [embed] });
        }
    }
}