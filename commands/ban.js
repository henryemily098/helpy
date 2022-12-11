const { MessageEmbed } = require('discord.js');

module.exports = {
    name: "ban",
    description: "Banned people who break the rules!",
    data: {
        name: "ban",
        description: "Banned people who break the rules!",
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
     * @param {import("discord.js").Message} message 
     * @param {import("../src/client/Client")} client 
     * @param {String[]} args 
     */
    async run(message, client, args) {
        if(!message.member.roles.cache.has("862700534058582017")) return message.reply(`You're not staff!`);
        if(args.length < 1) return message.reply(`Follow these instructions: \`=ban\` \`<mention user / ID>\` \`<reason>\``);

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if(!member) return message.channel.send(`Follow these instructions: \`=ban\` \`<mention user / ID>\` \`<reason>\``);

        if(member){
            if(member.roles.cache.has("862700534058582017")) return message.reply(`You can ban this person! They're a staff!`);
        }

        var reason = args.splice(1).join(' ') || "No provide reason";
        try {
            await member.send('**You has been Banned**, now Goodbye! <a:Aftondeath:740863798256074782>');
        } catch(err) {
            console.log(err);
        }

        member.ban({reason: reason});

        const banmbed = new MessageEmbed()
            .setColor(client.data.color)
            .setAuthor({ name: `${member.user.tag} has been banned`, iconURL: member.user.displayAvatarURL(client.data.avatarOptions) })
            .setDescription(`**Reason:** ${reason}`);
        message.channel.send({ embeds: [banmbed] });
        await message.delete().catch(console.error);
    },
    interaction: {
        /**
         * @param {import("discord.js").CommandInteraction} interaction 
         * @param {import("../src/client/Client")} client 
         */
        async run(interaction, client) {
            if(!interaction.member.roles.cache.has("862700534058582017")) return interaction.reply({ content: `You're not staff!`, ephemeral: true });
            const member = interaction.guild.members.cache.get(interaction.options.getUser("target").id);
            const reason = interaction.options.getString("reason");

            if(!member) return interaction.reply({ content: "They're not in the server!", ephemeral: true });
            if(member) {
                if(member.roles.cache.has("862700534058582017")) return interaction.reply({ content: `You can ban this person! They're a staff!`, ephemeral: true });
            }

            try {
                await member.send('**You has been Banned**, now Goodbye! <a:Aftondeath:740863798256074782>');
            } catch (error) {
                console.log(error);
            }

            member.ban({ reason: reason });
            const banmbed = new MessageEmbed()
                .setColor(client.data.color)
                .setAuthor({ name: `${member.user.tag} has been banned`, iconURL: member.user.displayAvatarURL(client.data.avatarOptions) })
                .setDescription(`**Reason:** ${reason}`);
            await interaction.reply({ embeds: [banmbed] });
        } 
    }
}
