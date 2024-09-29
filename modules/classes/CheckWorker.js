var child_process = require('child_process');
var fs = require('fs');
var path = require('path');

class CheckWorker{
    constructor(){
        this.worker = child_process.fork('./modules/checkerworker.js');
    }
    send(data){
        this.worker.send(data);
    }
    on(event, callback){
        this.worker.on(event, callback);
    }

    exit(){
        this.worker.kill();
    }

    async run(checker, website){
        if(!fs.existsSync(path.join(__dirname, '../checkers', checker + '.js'))){
            this.exit();
            return {status: 'error', message: `Checker ${checker} does not exist`};
        }
        this.send({checker: checker, website: website});
        return {status: 'success', message: `Checker ${checker} for ${website}`};
    }
}

module.exports = CheckWorker;