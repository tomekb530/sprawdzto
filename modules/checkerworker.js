var child_process = require('child_process');

process.on('message', async (data) => {
    var Checker = require('./checkers/' + data.checker + '.js');
    var checker = new Checker();
    var result = await checker.run(data.website);
    process.send(result);
    process.exit();
});