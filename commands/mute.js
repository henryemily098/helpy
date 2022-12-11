const Discord = require('discord.js');
const Client = require('../src/client/Client');
const ms = require('ms');

module.exports = {
    name: "mute",
    description: "Muted people",
    data: {
        name: "mute",
        description: "Muted people",
        options: [
            {
                name: "target",
                description: "target member!",
                type: 6,
                required: true
            },
            {
                name: "duration_number",
                description: "Set mute duration number",
                type: 3,
                required: true
            },
            {
                name: "duration_format",
                description: "Set mute duration format",
                type: 3,
                required: true,
                choices: [
                    {
                        name: "Minute",
                        value: "m"
                    },
                    {
                        name: "Hour",
                        value: "h"
                    },
                    {
                        name: "Day",
                        value: "d"
                    }
                ]
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
     * @param {Discord.Message} message 
     * @param {Client} client 
     * @param {String[]} args 
     */
    async run(message, client, args) {
        if(!message.member.roles.cache.has("862700534058582017")) return message.reply('You can\'t use this command!');
        if(args.length < 1) return message.reply("You must mention one user!");

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if(!member) return message.reply('They aren\'t in the server!');
        if(member.roles.cache.has("862700534058582017")) return message.reply('You cannot mute that person!');

        var rawTime = args[1];
        var time = ms(rawTime);
        if(!time) return message.reply('You didn\'t specify a time!');
        var reason = args.splice(2).join(' ') || "No reason provide";

        const hook = new Discord.WebhookClient('798760239985852436', 'rFqnBn7IP5TD8fnViY-1EbvFLT0aRqft6oYIUDiwWoUNYx2DtJsB3pU4Zmim0qvtW6Q3');
        const embed = new Discord.MessageEmbed()
            .setColor(client.data.color)
            .setAuthor({ name: `[MUTE] ${member.user.tag}`, iconURL: member.user.displayAvatarURL(client.data.avatarOptions) })
            .addField('User', `<@${member.user.id}>`, true)
            .addField('Moderator', `<@${message.author.id}>`, true)
            .addField('Reason', reason, true)
            .addField('Duration', rawTime, true)
        hook.send({ embeds: [embed] });

        try {
            member.send('**You\'ve been muted**, enjoy your muted now!');
        } catch(err) {
            console.log(err);
        }   

        var role = message.guild.roles.cache.find(r => r.id === '727449744414081043');
        member.roles.add(role.id);

        const removerole = new Discord.MessageEmbed()
            .setColor(client.data.color)
            .setAuthor({ name: `[UNMUTE] ${member.user.tag}`, iconURL: member.user.displayAvatarURL(client.data.avatarOptions) })
            .addField('User', `<@${member.user.id}>`, true)
            .addField('Moderator', `<@${message.author.id}>`, true)

        setTimeout(async() => {
            member.roles.remove(role.id);
            return hook.send({ embeds: [removerole] });
        }, time);
    
        const mutembed = new Discord.MessageEmbed()
            .setColor(client.data.color)
            .setAuthor({ name: `${member.user.tag} has been muted`, iconURL: member.user.displayAvatarURL(client.data.avatarOptions) })
            .setDescription(`**Reason:** ${reason}`)
        message.channel.send({ embeds: [mutembed] });
        await message.delete().catch(console.error);
    },
    interaction: {
        /**
         * @param {import("discord.js").CommandInteraction} interaction 
         * @param {import("../src/client/Client")} client 
         */
        async run(interaction, client) {
            if(!interaction.member.roles.cache.has("862700534058582017")) return interaction.reply({ content: 'You can\'t use this command!', ephemeral: true });

            const target = interaction.options.getUser("target");
            const member = interaction.guild.members.cache.get(target.id);
            if(!member) return interaction.reply({ content: 'They aren\'t in the server!', ephemeral: true });
            if(member.roles.cache.has("862700534058582017")) return interaction.reply({ content: 'You cannot mute that person!', ephemeral: true });

            var rawTime = `${interaction.options.getInteger("duration_number")}${interaction.options.getString("duration_format")}`;
            var time = ms(rawTime);
            if(!time) return interaction.reply({ content: 'You didn\'t specify a time!', ephemeral: true });
            var reason = interaction.options.getString("reason");

            const hook = new Discord.WebhookClient('798760239985852436', 'rFqnBn7IP5TD8fnViY-1EbvFLT0aRqft6oYIUDiwWoUNYx2DtJsB3pU4Zmim0qvtW6Q3');
            const embed = new Discord.MessageEmbed()
                .setColor(client.data.color)
                .setAuthor({ name: `[MUTE] ${member.user.tag}`, iconURL: member.user.displayAvatarURL(client.data.avatarOptions) })
                .addField('User', `<@${member.user.id}>`, true)
                .addField('Moderator', `<@${interaction.user.id}>`, true)
                .addField('Reason', reason, true)
                .addField('Duration', rawTime, true)
            hook.send({ embeds: [embed] });

            try {
                member.send('**You\'ve been muted**, enjoy your muted now!');
            } catch(err) {
                console.log(err);
            }   

            var role = interaction.guild.roles.cache.get('727449744414081043');
            member.roles.add(role.id);

            const removerole = new Discord.MessageEmbed()
                .setColor(client.data.color)
                .setAuthor({ name: `[UNMUTE] ${member.user.tag}`, iconURL: member.user.displayAvatarURL(client.data.avatarOptions) })
                .addField('User', `<@${member.user.id}>`, true)
                .addField('Moderator', `<@${interaction.user.id}>`, true)

            setTimeout(async() => {
                member.roles.remove(role.id);
                return hook.send({ embeds: [removerole] });
            }, time);
        
            const mutembed = new Discord.MessageEmbed()
                .setColor(client.data.color)
                .setAuthor({ name: `${member.user.tag} has been muted`, iconURL: member.user.displayAvatarURL(client.data.avatarOptions) })
                .setDescription(`**Reason:** ${reason}`)
            interaction.reply({ embeds: [mutembed] });
        }
    }
}
