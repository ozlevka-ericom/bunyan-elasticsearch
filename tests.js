
const async = require('async');
const assert = require('assert');
const fs = require('fs');
const ElasticsearchStream = require('./index');
const ESwrapper = require('./eswrapper');


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
       require('array.prototype.flatmap').shim();
       it("should test body creation", function(){
           const dataset = [{
               id: 1,
               text: 'If I fall, don\'t bring me back.',
               user: 'jon',
               date: new Date()
           }, {
               id: 2,
               text: 'Witer is coming',
               user: 'ned',
               date: new Date()
           }, {
               id: 3,
               text: 'A Lannister always pays his debts.',
               user: 'tyrion',
               date: new Date()
           }, {
               id: 4,
               text: 'I am the blood of the dragon.',
               user: 'daenerys',
               date: new Date()
           }, {
               id: 5, // change this value to a string to see the bulk response with errors
               text: 'A girl is Arya Stark of Winterfell. And I\'m going home.',
               user: 'arya',
               date: new Date()
           }];

           const body = dataset.flatMap(doc => [{ index: { _index: 'tweets' } }, doc]);
           console.log(body);
       });
   });
});


describe("Stream Tests (require es)", () => {
    describe("Ready tests", () => {
        const esStream = new ElasticsearchStream({
            node: "http://localhost:9200",
            requestTimeout: 2000,
            templateName: 'reports'
        });

        it("shoud write to stream during 10 seconds and stop stream after this", function(done) {
            this.timeout(20000);
            const interval = setInterval(function(){
                for(var i = 0; i < 100; i++) {
                    esStream.write(JSON.stringify({
                        name: "aaaaa"
                    }));
                }
            }, 200);

            setTimeout(function(){
                 clearInterval(interval);
                 esStream.stop();
                 done();
            }, 11000);
        });
    });
});


describe("Test es wrapper", ()=> {
    describe("Test basic functions", () => {
        const wrapper = new ESwrapper({
            node: "http://localhost:9200",
            requestTimeout: 2000,
            maxRetries: 10,
            apiVersion: "7.x"
        });

        it("just test template exists", async function(){
            const res = await wrapper.checkReady();
            console.log(res)
        });

        it("should index object to test index", async function(){
            const obj = {
                name: "aaaaa"
            };

            const res = await wrapper.index("test", obj);
            assert.equal(res._shards.failed, 0);
        });

        it("should bulk index to test", async function(){
            const dataset = [{
                id: 1,
                text: 'If I fall, don\'t bring me back.',
                user: 'jon',
                date: new Date()
            }, {
                id: 2,
                text: 'Witer is coming',
                user: 'ned',
                date: new Date()
            }, {
                id: 3,
                text: 'A Lannister always pays his debts.',
                user: 'tyrion',
                date: new Date()
            }, {
                id: 4,
                text: 'I am the blood of the dragon.',
                user: 'daenerys',
                date: new Date()
            }, {
                id: 5, // change this value to a string to see the bulk response with errors
                text: 'A girl is Arya Stark of Winterfell. And I\'m going home.',
                user: 'arya',
                date: new Date()
            }];

            const res = await wrapper.bulk(dataset, "test");
            assert.equal(res.errors, false);
        });
    })
});