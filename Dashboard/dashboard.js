const http = require("http");
const { default: image } = require("./connection/image");
const { default: page } = require("./page");
const Client = require("../src/client/Client");
const session = require("express-session");
const Store = require("connect-mongo");
const bodyParser = require("body-parser");
const express = require("express");

class Dashboard {
    constructor({ bot=new Client(), port=Number() }) {
        this.config = {
            port,
            client: bot,
        }
    }

    init() {
        const config = this.config;
        const app = express();
        const port = config.port;
        const client = config.client;

        const server = http.createServer(app);
        const listener = server.listen(port, () => {
            console.log(`Listening to port: ${listener.address().port}`);
        });
        
        let sessionIs = session({
            secret: 'total_secret_cookie_secret',
            resave: true,
            saveUninitialized: true,
            cookie: {
                expires: new Date(253402300799999),
                maxAge: 253402300799999
            },
            store: Store.create({
                autoRemove: "native",
                mongoUrl: process.env.MONGODB
            })
        })

        app.use(sessionIs);
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended: true
        }));

        app.use(express.static("Javascript"));
        app.use(express.static("public"));
        app.set('view engine', 'ejs');

        app.use((req, res, next) => {
            if(!req.body) req.body = {};
            
            req.client = client;
            req.redirectUri = process.env.URL_CALLBACK;
            next();
        });
        require("./Routes/app")(app)
        require("./connection/connection")(app)
        require("./connection/image").default.get({ app, client });

        app.use("/api", require("./api/router"));
        app.get("/login", function(req, res) {
            let r = req.query.r ? `?r=${req.query.r}` : "";
            res.redirect(`/code${r}`);
        });
        app.get("/logout", function(req, res) {
            res.redirect("/code/destroy")
        });

        app.get("/verify", async(req, res) => {
            const guild = client.guilds.cache.get("706744372326039573");
            await guild.members.fetch();
            require("./Verifications/app")(config.app, client);
        });

        page.get({ app: app, client: client });
        image.get({ app: app, client: client });

        app.get("*", async(req, res) => {
            const guild = client.guilds.cache.get("706744372326039573");
            res.render("404guild", { bot: client, guild, req, backMsg: "home", msg: "Page", url: "/" });
        });
    }
}

module.exports.Dashboard = Dashboard