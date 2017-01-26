(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.loaders = {
        'host-browser': 'node_modules/dojo-loader/loader.js',
        'host-node': 'dojo-loader'
    };
    exports.loaderOptions = {
        packages: [
            { name: 'dts-generator', location: '.' }
        ]
    };
    exports.suites = ['dts-generator/tests/unit/all'];
    exports.excludeInstrumentation = /^(?:tests|node_modules)\//;
});
