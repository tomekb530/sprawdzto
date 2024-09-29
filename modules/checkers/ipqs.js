var Checker = require('../classes/Checker.js');
var axios = require('axios');
var utils = require('../utils.js');

class IPQS extends Checker {
  constructor() {
    super();
    this.name = 'IPQS';
    this.fn = async (website) => {
      var data = await this.ipqs(website);
      return data;
    }
  }

    async ipqs(website){
        var host = utils.parseUrl(website).host;
        var response = await axios.get(`https://www.ipqualityscore.com/api/json/url/${process.env.IPQS_KEY}/${host}`);
        return response.data;
    }
}

module.exports = IPQS;