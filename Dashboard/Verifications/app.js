/**
 * @param {import("express").Application} app 
 * @param {import("../../src/client/Client")} client
 */
module.exports = async(app, client) => {
    app.use('/verify', require('./discord'));
}