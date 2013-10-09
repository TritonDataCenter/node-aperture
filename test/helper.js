// Copyright 2012 Mark Cavage.  All rights reserved.

var bunyan = require('bunyan');
var once = require('once');



///--- Helpers

function createLogger(name, stream) {
        var log = bunyan.createLogger({
                level: (process.env.LOG_LEVEL || 'warn'),
                name: name || process.argv[1],
                stream: stream || process.stdout,
                src: true,
                serializers: bunyan.stdSerializers
        });
        return (log);
}



///--- Exports

module.exports = {

        after: function after(teardown) {
                module.parent.exports.tearDown = function _teardown(callback) {
                        try {
                                teardown.call(this, callback);
                        } catch (e) {
                                console.error('after:\n' + e.stack);
                                process.exit(1);
                        }
                };
        },

        before: function before(setup) {
                module.parent.exports.setUp = function _setup(callback) {
                        try {
                                setup.call(this, callback);
                        } catch (e) {
                                console.error('before:\n' + e.stack);
                                process.exit(1);
                        }
                };
        },

        test: function test(name, tester) {
                module.parent.exports[name] = function _(t) {
                        t.end = once(t.done.bind(t));
                        t.notOk = function notOk(ok, message) {
                                return (t.ok(!ok, message));
                        };
                        tester.call(this, t);
                };
        },

        createLogger: createLogger
};
