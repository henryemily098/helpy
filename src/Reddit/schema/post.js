const fetch = require("node-fetch").default;
/**
 * @param {string} jsonUrl 
 * @returns 
 */
module.exports.get = async(jsonUrl) => {
    let data = await fetch(jsonUrl).then(res => res.json());
    let resource = data[0].data.children[0].data;
    let request = {
        title: `${resource.title}`,
        description: `${resource.selftext}`,
        url: `https://www.reddit.com${resource.permalink}`,
        id: `${resource.id}`,
        image: resource.url ? `${resource.url}` : "",
        user: {
            name: `${resource.author}`,
            url: `https://www.reddit.com/u/${resource.author}`
        },
        subReddit: {
            name: `${resource.subreddit}`,
            url: `https://www.reddit.com/r/${resource.subreddit}`
        }
    }
    return request;
}