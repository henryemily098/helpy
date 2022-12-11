const router = require("express").Router();

router.post("/get", (req, res) => {

    let { id } = req.body;
    const client = req.client;
    const botUser = client.users.cache.get(id);

    let bot = {
        username: botUser.username,
        id: botUser.id,
        discriminator: botUser.discriminator,
        avatarURL: botUser.displayAvatarURL({ dynamic: true, format: "png", size: 1024 })
    }

    return res.json(bot);

});

module.exports = router;