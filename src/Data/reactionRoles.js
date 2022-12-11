const { MessageReaction, User } = require("discord.js");

module.exports = {
    /**
     * @param {MessageReaction} reaction 
     * @param {User} user 
     * @param {string} roleId
     */
    async add(reaction, user, roleId) {
        const member = reaction.message.guild.members.cache.get(user.id);
        if(reaction.message.partial) await reaction.message.fetch();
        if(reaction.partial) await reaction.fetch();
        if(user.bot) return;
        if(!reaction.message.guild) return;
        // if(
        //    !member.roles.cache.find(r => r.id === "755286810829258845") && 
        //    !member.roles.cache.find(r => r.id === "810734415327002654") && 
        //    !member.roles.cache.find(r => r.id === "706745103984754718") &&
        //    !member.roles.cache.find(r => r.id === "723820945101291530") && 
        //    !member.roles.cache.find(r => r.id === "801622071045914644") && 
        //    !member.roles.cache.find(r => r.id === "790871033942900746") && 
        //    !member.roles.cache.find(r => r.id === "706745387192680469") && 
        //    !member.roles.cache.find(r => r.id === "718752155707899904") && 
        //    !member.roles.cache.find(r => r.id === "862700534058582017") && 
        //    !member.roles.cache.find(r => r.id === "712558896329392170") && 
        //    !member.roles.cache.find(r => r.id === "848764908501598271") && 
        //    !member.roles.cache.find(r => r.id === "732410413337280633") && 
        //    !member.roles.cache.find(r => r.id === "718748171685068810") && 
        //    !member.roles.cache.find(r => r.id === "706767620078305352")
        // ) {
            // try {
            //     member.send(`🚫 Reaction denied! You must get VIP role or get roles that equal with that!`);
            // } catch (error) {
            //     console.log(error);
            // }
            // return await reaction.users.remove(member.user);
        // }
        return await member.roles.add(roleId);
    },
    /**
     * @param {MessageReaction} reaction 
     * @param {User} user 
     * @param {string} roleId
     */
    async remove(reaction, user, roleId) {
        const member = reaction.message.guild.members.cache.get(user.id);
        if(reaction.message.partial) await reaction.message.fetch();
        if(reaction.partial) await reaction.fetch();
        if(user.bot) return;
        if(!reaction.message.guild) return;
        return await member.roles.remove(roleId);
    },
    /**
     * @param {MessageReaction} reaction 
     * @param {User} user 
     * @param {string} roleId 
     */
    async addRoles(reaction, user, roleId) {
        const member = reaction.message.guild.members.cache.get(user.id);
        if(reaction.message.partial) await reaction.message.fetch();
        if(reaction.partial) await reaction.fetch();
        if(user.bot) return;
        if(!reaction.message.guild) return;
        return await member.roles.add(roleId);
    },
    /**
     * 
     * @param {MessageReaction} reaction 
     * @param {User} user 
     * @param {string} roleId 
     */
    async removeRoles(reaction, user, roleId) {
        const member = reaction.message.guild.members.cache.get(user.id);
        if(reaction.message.partial) await reaction.message.fetch();
        if(reaction.partial) await reaction.fetch();
        if(user.bot) return;
        if(!reaction.message.guild) return;
        return await member.roles.remove(roleId);
    }
}