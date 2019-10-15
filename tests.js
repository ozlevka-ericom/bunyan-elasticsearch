
const async = require('async');
const assert = require('assert');
const fs = require('fs');
const ElasticsearchStream = require('./index');


describe("Test elasticsearch init", () => {
   describe("Initialization stream test", () => {
       it("should initialize stream and test client ready", function(done) {
            const esStream = new ElasticsearchStream({
                node: "http://localhost:9200",
                host: "http://localhost:9200",
                apiVersion: "7.0"
            });
            const client = esStream._client;
            client.index({index: "test", op_type: "index", body: {name: "Hello"}},(err, res, code) => {
                if(err) {
                    console.log(err);
                } else {
                    console.log(code, res)
                }
                done();
            });
       });
   });
});