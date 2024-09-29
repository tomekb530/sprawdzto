var axios = require('axios');
var randomuseragent = require('random-useragent');
module.exports = {
    parseUrl: function(url) {
        var proto = 'http://';
        if (url.indexOf('https') > -1) {
            proto = 'https://';
        }
        var host = url.replace(proto, '').split('/')[0];
        var path = url.replace(proto + host, '');
        return {host: host, path: path};
    },

    checkIfConnectable: async function(website) {
        try {
            await axios.get("https://"+website, {headers: {'User-Agent': randomuseragent.getRandom()}});
            return true;
        } catch (error) {
            return false;
        }
    }
};