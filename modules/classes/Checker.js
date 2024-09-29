var axios = require('axios');
var randomuseragent = require('random-useragent');


class Checker {
  constructor() {
    this.name = 'Module';
    this.config = {};
    this.useragent = randomuseragent.getRandom();
    this.fn = () => {
        return {};
    };
  }

  async run(website){
    console.log(`Running ${this.name} on ${website}`);
    //check if website is reachable
    try {
      //await axios.get("https://"+website, {headers: {'User-Agent': this.useragent}});
    } catch (error) {
      console.log(`Done ${this.name} on ${website}`);
      return {name: this.name, website: website, status: 'error', data: {error: 'Website is not reachable'}};
    }
    var data = await this.fn(website);
    console.log(`Done ${this.name} on ${website}`);
    return {name: this.name, website: website, status: 'success', data: data};
  }
}

module.exports = Checker;