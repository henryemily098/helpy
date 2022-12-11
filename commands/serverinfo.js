const { MessageEmbed } = require('discord.js');

module.exports = {
    name: "serverinfo",
    description: "Information about server.",
    data: {
        name: "serverinfo",
        description: "Information about server."
    },
    /**
     * @param {import("discord.js").Message} message 
     * @param {import("../src/client/Client")} client 
     * @param {String[]} args 
     */
    async run(message, client, args){
        const embed = new MessageEmbed()
           .setColor(client.data.color)
           .setTitle(`${message.guild.name} Info`)
           .addFields(
               { name: 'Owner:', value: message.guild.members.cache.get(message.guild.ownerId).user.tag, inline: true },
               { name: 'ID:', value: message.guild.id, inline: true },
               { name: 'MemberCount:', value: `${message.guild.memberCount}`, inline: true },
                { name: 'Channels:', value: `${message.guild.channels.cache.size}`, inline: true },
                { name: 'Roles:', value: `${message.guild.emojis.cache.size}`, inline: true },
                { name: 'Emoji:', value: `${message.guild.roles.cache.size}`, inline: true },
            )
            .setThumbnail(message.guild.iconURL(client.data.avatarOptions))
        message.channel.send({ embeds: [embed] });
    },
    interaction: {
        /**
         * @param {import("discord.js").CommandInteraction} interaction 
         * @param {import("../src/client/Client")} client 
         */
        async run(interaction, client) {
            const embed = new MessageEmbed()
            .setColor(client.data.color)
            .setTitle(`${interaction.guild.name} Info`)
            .addFields(
                { name: 'Owner:', value: interaction.guild.members.cache.get(interaction.guild.ownerId).user.tag, inline: true },
                { name: 'ID:', value: interaction.guild.id, inline: true },
                { name: 'MemberCount:', value: `${interaction.guild.memberCount}`, inline: true },
                    { name: 'Channels:', value: `${interaction.guild.channels.cache.size}`, inline: true },
                    { name: 'Roles:', value: `${interaction.guild.emojis.cache.size}`, inline: true },
                    { name: 'Emoji:', value: `${interaction.guild.roles.cache.size}`, inline: true },
                )
                .setThumbnail(interaction.guild.iconURL(client.data.avatarOptions))
            interaction.reply({ embeds: [embed] });
        }
    }
}
