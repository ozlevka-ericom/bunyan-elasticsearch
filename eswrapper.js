

const es = require('elasticsearch');
const request = require('request');
require('array.prototype.flatmap').shim();


class ESWrapper {
    constructor(options) {
        this.options = options || {};
        this._client = es.Client(options);
    }

    async checkReady() {
        let res = await this.pingEs();
        if(res >= 400) {
            return false;
        }
        return await this._client.indices.existsTemplate({
            name: this.options.templateName || 'reports',
            requestTimeout: 3000
        });
    }

    async pingEs() {
        const address = this.options.node || 'http://localhost:9200';
        return new Promise((resolve, reject) => {
           request.get(address, function(err, res){
               if(err) {
                   if (err && !res) {
                        resolve(1000);
                   } else {
                       resolve(res.statusCode);
                   }

               } else {
                   if(res.statusCode < 400) {
                       resolve(res.statusCode);
                   } else {
                       resolve(res.statusCode);
                   }
               }
           });
        });
    }

    async index(index, obj) {
        const indexObject = {
            index: index,
            body: obj
        };
        return await this._client.index(indexObject);
    }

    async bulk(arr, index) {
        const body = arr.flatMap(doc => [{index: {_index: index}},doc]);
        return await this._client.bulk({ refresh: true, body })
    }
}

module.exports = ESWrapper;