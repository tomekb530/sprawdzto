var fs = require('fs');
var cacheFolder = 'cache/';

class CacheManager{
    constructor(){
        if (!fs.existsSync(cacheFolder)){
            fs.mkdirSync(cacheFolder);
        }
    }
    get(key){
        var file = cacheFolder + key + '.json';
        if(fs.existsSync(file)){
            return JSON.parse(fs.readFileSync(file)).value;
        }
        return null;
    }

    set(key, value){
        var file = cacheFolder + key + '.json';
        var cache = {};
        cache.date = new Date();
        cache.value = value;
        fs.writeFileSync(file, JSON.stringify(cache));
    }

    checkDate(key){
        var file = cacheFolder + key + '.json';
        if(fs.existsSync(file)){
            var cache = JSON.parse(fs.readFileSync(file));
            var now = new Date();
            var diff = now - new Date(cache.date);
            if(diff > 60000){
                return false;
            }
            return true;
        }
    }

    clean(){
        var files = fs.readdirSync(cacheFolder);
        files.forEach(file => {
            var cache = JSON.parse(fs.readFileSync(cacheFolder + file));
            var now = new Date();
            var diff = now - new Date(cache.date);
            // check if older than 30 days
            if(diff > 1000 * 60 * 60 * 24 * 30){
                fs.unlinkSync(cacheFolder + file);
            }
        });
    }
}

module.exports = CacheManager;