var Checker = require('../classes/Checker.js');
var whois = require('whois-json');

class Whois extends Checker {
  constructor() {
    super();
    this.name = 'Whois';
    this.fn = async (website) => {
      var data = await whois(website);
      return data;
    }
  }
}

module.exports = Whois;