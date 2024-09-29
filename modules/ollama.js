var axios = require('axios');
class Ollama{
    constructor(){
        this.model = "llama3";
        this.url = "http://localhost:11434";
    }

    async getResponse(prompt){
        var response = await axios.post(this.url+"/api/generate", JSON.stringify({model: this.model, prompt: prompt, stream: false}));
        return response.data.response;
    }
}

module.exports = Ollama;