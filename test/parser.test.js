// Copyright (c) 2013, Joyent, Inc. All rights reserved.

var bunyan = require('bunyan');
var helper = require('./helper.js');

var Parser = require('../lib/parser.js');

var log = new bunyan({
        'name': 'parser.test.js',
        'level': process.env['LOG_LEVEL'] || 'debug'
});

var test = helper.test;

test('Fred can read foo', function (t) {
        var p = new Parser();
        var actual = p.parse('Fred can read foo');
        var expected = {
                principals: {'Fred': true},
                effect: 'allow',
                actions: {'read': true },
                resources: {'foo': true }
        };
        t.deepEqual(expected, actual);
        t.done();
});

test('Fred can read foo when sourceip::ip = 0.0.0.0', function (t) {
        var p = new Parser();
        var actual = p.parse('Fred can read foo when sourceip::ip = 0.0.0.0');
        var expected = {
                principals: {'Fred': true},
                effect: 'allow',
                actions: {'read': true },
                resources: {'foo': true },
                conditions: [ '=', { name: 'sourceip', type: 'ip'}, '0.0.0.0']
        };
        t.deepEqual(expected, actual);
        t.done();
});
