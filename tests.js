

const assert = require('assert');
const fs = require('fs');


describe("Test for test", () => {
    'use strict';
    describe("First Test for test", () => {
        
        it.only("should run for config", () => {
           console.log("The first")
        });


        it("should run for test only alone", () => {
            console.log("Test alone");
        });
    });
});
