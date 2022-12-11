module.exports = {
    /**
     * @param {string} guildId 
     * @returns
     */
    findingGuildbyId(guildId) {
        const guild = client.guilds.cache.get(guildId);
        return guild;
    },
    findingRolebyId(roleId) {
        const guild = this.findingGuildbyId("706744372326039573");
        const role = guild.roles.cache.get(roleId);
        return role;
    },
    findingMembersbyID(userId) {
        const guild = this.findingGuildbyId("706744372326039573");
        const member = guild.members.cache.get(userId);
        return member;
    },
    /**
     * @param {string} channelId 
     * @param {string} guildId 
     * @returns 
     */
    findingChannelbyID(channelId, guildId) {
        const guild = this.findingGuildbyId(guildId);
        const channel = guild.channels.cache.get(channelId);
        return channel;
    }
}