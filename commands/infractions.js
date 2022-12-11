const warns = require("../src/Data/warns");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "infractions",
    description: "Infractions count",
    data: {
        name: "infractions",
        description: "Infractions count",
        options: [
            {
                name: "target",
                description: "Choose member",
                type: 6,
                required: true
            }
        ]
    },
    /**
     * @param {import("discord.js").Message} message 
     * @param {import("../src/client/Client")} client 
     * @param {String[]} args 
     */
    async run(message, client, args) {
        if(!message.member.permissions.has("MANAGE_MESSAGES")) return;
        if(args.length < 1) return message.channel.send(`Please, mention or insert an user ID`);

        var member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if(!member) return message.channel.send(`Cannot find user: ${args[0]}`)

        const data = await warns.findOne({
            userID: member.user.id,
            guildID: message.guild.id,
        });
        if(!data) return message.channel.send(`This user doesn't have infractions!`);
        let embed = new MessageEmbed().setColor(client.data.color)
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ dynamic: true, size: 1024, format: "png" }) })
            .setDescription(data.content.map((infraction, index) => `**__INFRACTIONS ${index + 1}__**\nModerator: *<@${infraction.moderator}>*\nReason: *${infraction.reason}*\n`).join("\n\n"));
        message.channel.send({ embeds: [embed] });
    },
    interaction: {
        /**
         * @param {import("discord.js").CommandInteraction} interaction 
         * @param {*} client 
         */
        async run(interaction, client) {
            if(!interaction.member.permissions.has("MANAGE_MESSAGES")) return;

            var target = interaction.options.getUser("target");
            var member = interaction.guild.members.cache.get(target.id);

            const data = await warns.findOne({
                userID: member.user.id,
                guildID: message.guild.id,
            });
            if(!data) return interaction.channel.send(`This user doesn't have infractions!`);
            let embed = new MessageEmbed().setColor(client.data.color)
                .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ dynamic: true, size: 1024, format: "png" }) })
                .setDescription(data.content.map((infraction, index) => `**__INFRACTIONS ${index + 1}__**\nModerator: *<@${infraction.moderator}>*\nReason: *${infraction.reason}*\n`));
            interaction.channel.send({ embeds: [embed] });
        }
    }
}