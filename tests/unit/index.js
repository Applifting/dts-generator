(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "intern!object", "intern/chai!assert", "../../index", "fs"], factory);
    }
})(function (require, exports) {
    "use strict";
    var registerSuite = require("intern!object");
    var assert = require("intern/chai!assert");
    var index_1 = require("../../index");
    var fs = require("fs");
    registerSuite({
        name: 'index',
        'api': function () {
            assert.isFunction(index_1.default, 'generate should be a function');
        },
        'generate': function () {
            return index_1.default({
                name: 'foo',
                baseDir: 'tests/support/foo',
                files: ['index.ts'],
                out: 'tmp/foo.d.ts'
            }).then(function () {
                var contents = fs.readFileSync('tmp/foo.d.ts', { encoding: 'utf8' });
                assert(contents, 'foo.d.ts should exist and have contents');
                assert.include(contents, "module 'foo/index'");
                assert.include(contents, "module 'foo/Bar'");
            });
        },
        'no files': function () {
            return index_1.default({
                name: 'foo',
                baseDir: 'tests/support/foo',
                out: 'tmp/foo.nofiles.d.ts'
            }).then(function () {
                var contents = fs.readFileSync('tmp/foo.nofiles.d.ts', { encoding: 'utf8' });
                assert(contents, 'foo.nofiles.d.ts should exist and have contents');
                assert.include(contents, "module 'foo/index'");
                assert.include(contents, "module 'foo/Bar'");
            });
        },
        'project that explicitly lists all files': function () {
            return index_1.default({
                name: 'foo',
                project: 'tests/support/foo',
                out: 'tmp/foo.config.d.ts'
            }).then(function () {
                var contents = fs.readFileSync('tmp/foo.config.d.ts', { encoding: 'utf8' });
                assert(contents, 'foo.config.d.ts should exist and have contents');
                assert.include(contents, "module 'foo/index'");
                assert.include(contents, "module 'foo/Bar'");
                assert.include(contents, "module 'foo/baz'");
            });
        },
        'project json file': function () {
            return index_1.default({
                name: 'foo',
                project: 'tests/support/foo/tsconfig-alt.json',
                out: 'tmp/foo-alt.config.d.ts'
            }).then(function () {
                var contents = fs.readFileSync('tmp/foo-alt.config.d.ts', { encoding: 'utf8' });
                assert(contents, 'foo-alt.config.d.ts should exist and have contents');
                // tsconfig-alt.json includes baz and Bar but not index
                assert.include(contents, "module 'foo/baz'");
                assert.include(contents, "module 'foo/Bar'");
                assert.notInclude(contents, "module 'foo/index'");
            });
        },
        'project with outDir and rootDir - directory handling stress test': function () {
            // having the extra "sub" directory in this project makes sure that we
            // respect the rootDir option.  This project also has an outDir so this
            // stresses our path-handling logic - if we mix up the directories, it'll
            // show in the output module names.
            //
            // This project uses absolute paths, for extra fun.
            return index_1.default({
                project: 'tests/support/foo-directories',
                out: 'tmp/foo.config.d.ts',
            }).then(function () {
                var contents = fs.readFileSync('tmp/foo.config.d.ts', { encoding: 'utf8' });
                assert(contents, 'foo.config.d.ts should exist and have contents');
                assert.include(contents, "module 'sub/index'");
                assert.include(contents, "module 'sub/Bar'");
                assert.include(contents, "module 'sub/baz'");
                // also check imports look right
                assert.include(contents, "import Bar from 'sub/Bar'");
                assert.include(contents, "from 'sub/baz';");
            });
        },
        'project that lets typescript resolve tsx imports for a jsx:react project': function () {
            // This essentially tests that we properly handle the jsx option, if any.
            // tsx alone, or module resolution with just ts files (no tsx), does need the
            // jsx option to be handled correctly to work.
            return index_1.default({
                name: 'foo2',
                project: 'tests/support/foo-resolve-tsx/tsconfig.json',
                out: 'tmp/foo.config.d.ts'
            }).then(function () {
                var contents = fs.readFileSync('tmp/foo.config.d.ts', { encoding: 'utf8' });
                assert(contents, 'foo.config.d.ts should exist and have contents');
                assert.include(contents, "module 'foo2/index'");
                assert.include(contents, "module 'foo2/Bar'");
                assert.include(contents, "module 'foo2/baz'");
            });
        },
        'es6 main module': function () {
            return index_1.default({
                name: 'foo',
                project: 'tests/support/foo-es6',
                out: 'tmp/foo.es6.d.ts',
                main: 'index.ts'
            }).then(function () {
                var contents = fs.readFileSync('tmp/foo.es6.d.ts', { encoding: 'utf8' });
                assert(contents, 'foo.es6.d.ts should exist and have contents');
                // assert.include(contents, `module 'foo/index'`);
                // assert.include(contents, `module 'foo/Bar'`);
            });
        },
        'resolve module id': function () {
            return index_1.default({
                name: 'foo',
                project: 'tests/support/foo-resolve-module-id',
                out: 'tmp/foo.resolve-module-id.d.ts',
                resolveModuleId: function (params) {
                    if (params.currentModuleId === 'FooInterfaceExportAssignment') {
                        return 'ReplacedFooInterfaceExportAssignment';
                    }
                    else if (params.currentModuleId === 'FooInterfaceExportDeclaration') {
                        return 'ReplacedFooInterfaceExportDeclaration';
                    }
                    else if (params.currentModuleId === 'ReExport') {
                        return 'ReplacedReExport';
                    }
                    else {
                        return null;
                    }
                },
                resolveModuleImport: function (params) {
                    if (params.importedModuleId === './FooInterfaceExportAssignment') {
                        return 'ReplacedFooInterfaceExportAssignment';
                    }
                    else if (params.importedModuleId === './FooInterfaceExportDeclaration') {
                        return 'ReplacedFooInterfaceExportDeclaration';
                    }
                    else if (params.importedModuleId === './ReExport') {
                        return 'ReplacedReExport';
                    }
                    else if (params.isDeclaredExternalModule) {
                        return 'ReplacedSomethingInJavaScript';
                    }
                    else {
                        return null;
                    }
                }
            }).then(function () {
                var contents = fs.readFileSync('tmp/foo.resolve-module-id.d.ts', { encoding: 'utf8' });
                // replaced interface module declarations
                assert.include(contents, "declare module 'ReplacedFooInterfaceExportAssignment'");
                assert.include(contents, "declare module 'ReplacedFooInterfaceExportDeclaration'");
                // replaced interface imports
                assert.include(contents, "import FooInterfaceExportAssignment = require('ReplacedFooInterfaceExportAssignment');");
                assert.include(contents, "import { FooInterfaceExportDeclaration } from 'ReplacedFooInterfaceExportDeclaration';");
                // replaced ReExport
                assert.include(contents, "declare module 'ReplacedReExport'");
                assert.include(contents, "export { ReExport } from 'ReplacedReExport';");
                // replaced external module declaration import
                assert.include(contents, "import { ClassInJavaScript } from 'ReplacedSomethingInJavaScript';");
                // non relative module import, should not be changed
                assert.include(contents, "import { NonRelative } from 'NonRelative';");
                // class imports should not be replaced, also assert on them
                assert.include(contents, "import FooImplExportAssignment = require('foo/FooImplExportAssignment');");
                assert.include(contents, "import { FooImplExportDeclaration } from 'foo/FooImplExportDeclaration';");
                // class module declarations should not be replaced, also assert on them
                assert.include(contents, "declare module 'foo/FooImplExportAssignment'");
                assert.include(contents, "declare module 'foo/FooImplExportDeclaration'");
            });
        },
        'add reference types package dependency  ': function () {
            return index_1.default({
                name: 'foo',
                baseDir: 'tests/support/foo',
                files: ['index.ts'],
                types: ['es6-promise'],
                out: 'tmp/foo.d.ts'
            }).then(function () {
                var contents = fs.readFileSync('tmp/foo.d.ts', { encoding: 'utf8' });
                assert.include(contents, "/// <reference types=\"es6-promise\" />");
            });
        },
        'add external path dependency  ': function () {
            return index_1.default({
                name: 'foo',
                baseDir: 'tests/support/foo',
                files: ['index.ts'],
                externs: ['../some/path/es6-promise.d.ts'],
                out: 'tmp/foo.d.ts'
            }).then(function () {
                var contents = fs.readFileSync('tmp/foo.d.ts', { encoding: 'utf8' });
                assert.include(contents, "/// <reference path=\"../some/path/es6-promise.d.ts\" />");
            });
        },
    });
});
