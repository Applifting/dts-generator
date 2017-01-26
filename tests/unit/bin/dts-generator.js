(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "intern!object", "intern/chai!assert", "../../../bin/dts-generator"], factory);
    }
})(function (require, exports) {
    "use strict";
    var registerSuite = require("intern!object");
    var assert = require("intern/chai!assert");
    var dts_generator_1 = require("../../../bin/dts-generator");
    registerSuite({
        name: 'bin/dts-generator',
        api: function () {
            assert.isFunction(dts_generator_1.default, 'dtsGenerator should be a function');
            assert.strictEqual(Object.keys(dts_generator_1.default).length, 0, 'There should be no other keys');
        },
        basic: function () {
            return dts_generator_1.default([
                '-name',
                'foo',
                '-project',
                'tests/support/foo',
                '-out',
                'tmp/foo.cli.d.ts'
            ]);
        }
    });
});
