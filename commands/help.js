const fs = require('fs');
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "help",
    description: "Give a list commands",
    data: {
        name: "help",
        description: "Give a list commands"
    },
    /**
     * @param {import("discord.js").Message} message 
     * @param {import("../src/client/Client")} client 
     * @param {String[]} args 
     */
    async run(message, client, args) {
        let str = "";
        const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
        for (let file of commandFiles) {
            const command = require(`./${file}`);
            str += `\`${command.name}\`\n${command.description}\n\n`;
        }

        let embed = new MessageEmbed().setColor(client.data.color)
            .setTitle("Commands list of {bot}".replace('{bot}', client.user.tag))
            .setDescription(str);
        return message.reply({ embeds: [embed] });
    },
    interaction: {
        /**
         * @param {import("discord.js").CommandInteraction} interaction 
         * @param {import("../src/client/Client")} client 
         */
        async run(interaction, client) {
            let str = "";
            const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
            for (let file of commandFiles) {
                const command = require(`./${file}`);
                str += `\`${command.name}\`\n${command.description}\n\n`;
            }

            let embed = new MessageEmbed().setColor(client.data.color)
                .setTitle("Commands list of {bot}".replace('{bot}', client.user.tag))
                .setDescription(str);
            return interaction.reply({ embeds: [embed] });
        }
    }
}