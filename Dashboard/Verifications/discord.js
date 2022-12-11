const router = require("express").Router();
const scopes = ["identify"];
const fetch = require('node-fetch').default;
const FormData = require('form-data');
const { MessageEmbed } = require("discord.js");

router.get('/', (req, res) => {
    const clientId = process.env.CLIENT_ID;
    const redirectUri = process.env.URL_CALLBACK_VERIFICATION;
    const authorizeUrl = `https://discordapp.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes.join('%20')}`;
    res.redirect(authorizeUrl);
});

router.get('/callback', async(req, res) => {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const redirectUri = process.env.URL_CALLBACK_VERIFICATION;

    const accessCode = req.query.code;
    if (!accessCode) return res.redirect('https://discord.com/channels/706744372326039573/719038487214686278');

    const data = new FormData();
    data.append('client_id', clientId);
    data.append('client_secret', clientSecret);
    data.append('grant_type', 'authorization_code');
    data.append('redirect_uri', redirectUri);
    data.append('scope', scopes.join(' '));
    data.append('code', accessCode);

    fetch('https://discordapp.com/api/oauth2/token', {
        method: "POST",
        body: data
    })
    .then(res => res.json())
    .then(response => {
        fetch('https://discordapp.com/api/users/@me', {
            method: 'GET',
            headers: {
                authorization: `${response.token_type} ${response.access_token}`
            },
        })
        .then(res2 => res2.json())
        .then(async userResponse => {
            const client = req.client;
            const roleId = "767609668091510785";
            const guild = client.guilds.cache.get("706744372326039573");
            const channelLog = guild.channels.cache.get("931489429497982976");
            const member = guild.members.cache.get(userResponse.id);

            if(!member) return res.redirect("https://discordapp.com/users/@me");
            if(member.roles.cache.has(roleId)) return res.redirect("https://discord.com/channels/706744372326039573/719038487214686278");

            if(channelLog) {
                if(channelLog.isText()) {
                    let embed = new MessageEmbed().setColor(client.data.color)
                        .setTitle("User Verification!")
                        .setThumbnail(member.user.displayAvatarURL(client.data.avatarOptions))
                        .addFields(
                            {
                                name: "Username:",
                                value: member.user.tag,
                                inline: true
                            },
                            {
                                name: "Discriminator:",
                                value: member.user.discriminator,
                                inline: true
                            },
                            {
                                name: "Id:",
                                value: member.user.id,
                                inline: true
                            },
                            {
                                name: "Joined At:",
                                value: new Date(member.joinedTimestamp).toLocaleDateString(),
                                inline: true
                            },
                            {
                                name: "Created At:",
                                value: new Date(member.user.createdTimestamp).toLocaleDateString(),
                                inline: true
                            }
                        );
                    channelLog.send(embed);
                }
            }

            member.roles.add(roleId);
            try {
                member.send("<:check_mark:819771972283662367> Thank you for verify yourself!");
            } catch (error) {
                console.log(error);
            }
        });
    });
    res.redirect("https://discord.com/channels/706744372326039573/719038487214686278");
});

module.exports = router;