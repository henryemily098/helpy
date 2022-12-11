const post = require("./schema/post");
class Reddit {
    constructor() {}

    /**
     * @param {string} url 
     * @returns 
     */
    async getPostInfo(url) {
        let jsonUrl = url.endsWith(".json") ? url : `${url}.json`;
        let data = await post.get(jsonUrl);
        return data;
    }
}

module.exports.Reddit = Reddit;