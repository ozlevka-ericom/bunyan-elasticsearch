
const async = require('async');
const assert = require('assert');
const fs = require('fs');
const ElasticsearchStream = require('./index');


describe("Test elasticsearch init", () => {
   describe("Initialization stream test", () => {
       it("should initialize stream and test client ready", function() {
            const esStream = new ElasticsearchStream();
            const client = esStream._client;
            client.ping((err, res, code) => {
                if(err) {
                    console.log(err);
                } else {
                    console.log(code, res)
                }
            });
       });
   });
});