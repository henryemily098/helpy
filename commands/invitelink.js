module.exports = {
    name: "invitelink",
    description: "Show your official invite link of FNaF Multiverse",
    data: {
        name: "invitelink",
        description: "Show your official invite link of FNaF Multiverse"
    },
    /**
     * @param {import("discord.js").Message} message 
     * @param {import("../src/client/Client")} client 
     * @param {String[]} args 
     */
    async run(message, client, args) {
        const Discord = require("discord.js");
        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setStyle("LINK")
                    .setLabel("Invite Link")
                    .setURL("https://fnafmultiverse.herokuapp.com/discord")
            );
        return message.reply({ content: `This is an official invite link for **FNaF Multiverse**:\n<https://fnafmultiverse.herokuapp.com/discord>`, components: [row] });
    },
    interaction: {
        /**
         * @param {import("discord.js").CommandInteraction} interaction 
         * @param {import("../src/client/Client")} client 
         */
        async run(interaction, client) {
            const Discord = require("discord.js");
            const row = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setStyle("LINK")
                        .setLabel("Invite Link")
                        .setURL("https://fnafmultiverse.herokuapp.com/discord")
                );
            return interaction.reply({ content: `This is an official invite link for **FNaF Multiverse**:\n<https://fnafmultiverse.herokuapp.com/discord>`, components: [row], ephemeral: true });
        }
    }
}