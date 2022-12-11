const { MessageEmbed } = require('discord.js');

module.exports = {
    name: "userinfo",
    description: "Information about user.",
    data: {
        name: "userinfo",
        description: "Information about user.",
        options: [
            {
                name: "target",
                description: "Choose user",
                type: 6,
                required: false
            }
        ]
    },
    /**
     * @param {import("discord.js").Message} message 
     * @param {import("../src/client/Client")} client 
     * @param {String[]} args 
     */
    async run(message, client, args){
        await message.guild.members.fetch({ withPresences: true });
        const fetchMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const member = await fetchMember.fetch(true);

        const status = filter(member);
        const embed = new MessageEmbed().setColor(client.data.color)
            .setAuthor({ name: member.user.username })
            .setThumbnail(member.user.displayAvatarURL(client.data.avatarOptions))
            .addFields(
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
                    name: "Status:",
                    value: status,
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
                },
                {
                    name: "Roles:",
                    value: member.roles.cache.filter(r => r.id !== message.guild.roles.everyone.id).map((role) => `<@&${role.id}>`).join(", ")
                }
            );
        message.reply({ embeds: [embed] });
    },
    interaction: {
        /**
         * @param {import("discord.js").CommandInteraction} interaction 
         * @param {import("../src/client/Client")} client 
         */
        async run(interaction, client) {
            await interaction.guild.members.fetch({ withPresences: true });
            const user = interaction.options.getUser("target") || interaction.user;
            
            const fetchMember = interaction.guild.members.cache.get(user.id);
            const member = await fetchMember.fetch(true);

            const status = filter(member);
            const embed = new MessageEmbed().setColor(client.data.color)
                .setAuthor({ name: member.user.username })
                .setThumbnail(member.user.displayAvatarURL(client.data.avatarOptions))
                .addFields(
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
                        name: "Status:",
                        value: status,
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
                    },
                    {
                        name: "Roles:",
                        value: member.roles.cache.filter(r => r.id !== interaction.guild.roles.everyone.id).map((role) => `<@&${role.id}>`).join(", ")
                    }
                );
                interaction.reply({ embeds: [embed] });
        }
    }
}

/**
 * @param {import("discord.js").GuildMember} member 
 * @returns 
 */
function filter(member) {
    let status = "";
    if(member.presence) {
        if(!member.presence.status) status += "⚫️Offline";
        if(member.presence.status === "dnd") status += "⛔️Do Not Disturb";
        if(member.presence.status === "idle") status += "🌙Idle";
        if(member.presence.status === "online") status += "🟢Online"
    } else {
        status += "⚫️Offline";
    }
    return status;
}