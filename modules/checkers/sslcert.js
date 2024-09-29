var Checker = require('../classes/Checker.js');
var sslCertificate = require('get-ssl-certificate');


class SSLCert extends Checker {
    constructor() {
        super();
        this.name = 'SSLCert';
        this.fn = async (website) => {
        var data = await this.sslcert(website);
        return data;
        }
    }
    async sslcert(website){
        var sslData = await sslCertificate.get(website);
        return sslData;
    }
}

module.exports = SSLCert;