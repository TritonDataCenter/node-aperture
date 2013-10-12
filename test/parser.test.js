// Copyright (c) 2013, Joyent, Inc. All rights reserved.

var bunyan = require('bunyan');
var helper = require('./helper.js');

var Parser = require('../lib/parser.js');

var log = new bunyan({
    'name': 'parser.test.js',
    'level': process.env['LOG_LEVEL'] || 'debug'
});

var test = helper.test;

test('no conditions', function (t) {
    var p = new Parser();
    var actual = p.parse('Fred can read foo');
    var expected = {
        principals: {'Fred': true},
        effect: true,
        actions: {'read': true },
        resources: {'foo': true }
    };
    t.deepEqual(expected, actual);
    t.done();
});

test('basic', function (t) {
    var p = new Parser();
    var texts = [
        'Fred can read foo when sourceip::ip = 0.0.0.0',
        'Fred can read foo where sourceip::ip = 0.0.0.0',
        'Fred can read foo if sourceip::ip = 0.0.0.0'
    ];

    var expected = {
        principals: {'Fred': true},
        effect: true,
        actions: {'read': true },
        resources: {'foo': true },
        conditions: [ '=', { name: 'sourceip', type: 'ip'}, '0.0.0.0']
    };
    for (var i = 0; i < texts.length; i++) {
        actual = p.parse(texts[i]);
        t.deepEqual(expected, actual);
    }
    t.done();
});

test('lists, length 2', function (t) {
    var p = new Parser();
    var actual = p.parse('Fred and Bob can read and write foo and bar when ' +
        'sourceip::ip = 0.0.0.0');

    var expected = {
        principals: {'Fred': true, 'Bob': true},
        effect: true,
        actions: {'read': true , 'write': true},
        resources: {'foo': true, 'bar': true },
        conditions: [ '=', { name: 'sourceip', type: 'ip'}, '0.0.0.0']
    };
    t.deepEqual(expected, actual);
    t.done();
});

test('lists, length 3', function (t) {
    var p = new Parser();
    var actual = p.parse('Fred, George, and Bob can read, write, and modify ' +
        'foo, bar, and baz when sourceip::ip = 0.0.0.0 and ' +
        'requesttime::datetime >= 2013-10-01T13:00:00 and ' +
        'requesttime::datetime < 2013-10-01T14:00:00');
    var expected = {
        principals: {'Fred': true, 'Bob': true, 'George': true},
        effect: true,
        actions: {'read': true , 'write': true, 'modify': true},
        resources: {'foo': true, 'bar': true, 'baz': true},
        conditions: ['and',
            ['and',
                [ '=',
                    { name: 'sourceip', type: 'ip'},
                    '0.0.0.0'],
                [ '>=',
                    { name: 'requesttime', type: 'datetime'},
                    '2013-10-01T13:00:00']
            ],
            [ '<',
                { name: 'requesttime', type: 'datetime'},
                '2013-10-01T14:00:00']
        ]
    };
    t.deepEqual(expected, actual);
    t.done();

});

test('validation', function (t) {

    var parser = new Parser({
        types: {}
    });
    var text = 'Fred can read foo when sourceip = 0.0.0.0';

    try {
        parser.parse(text);
        t.fail('block should throw');
    } catch (e) {
        t.equal('parse error: no type for "sourceip"', e.message);
    }

    text = 'Fred can read foo when sourceip::ip = 0.0.0.0';
    try {
        parser.parse(text);
        t.fail('block should throw');
    } catch (e) {
        t.equal('parse error: unknown type "ip"', e.message);
    }

    parser = new Parser({
        types: {
            'ip': {
                'validate': function () {}
            }
        }
    });
    try {
        parser.parse(text);
        t.fail('block should throw');
    } catch (e) {
        t.equal('parse error: unsupported operation "=" on type "ip"',
            e.message);
    }

    parser = new Parser({
        types: {
            'ip': {
                '=': function () {},
                'validate': function () {throw new Error('bad'); }
            }
        }
    });
    try {
        parser.parse(text);
        t.fail('block should throw');
    } catch (e) {
        t.equal('parse error: ' +
            'unable to validate value "0.0.0.0" as type "ip": bad',
            e.message);
    }

    parser = new Parser({
        types: {
            'ip': {
                '=': function () {}
            }
        }
    });
    try {
        parser.parse(text);
        t.fail('block should throw');
    } catch (e) {
        t.equal('parse error: ' +
            'unable to validate value "0.0.0.0" as type "ip": ' +
            'Object #<Object> has no method \'validate\'',
            e.message)
    }

    parser = new Parser({
        types: {
            'ip': {
                '=': function () {},
                'validate': function () {}
            }
        }
    });
    t.doesNotThrow(function () {
        parser.parse(text);
    });

    t.done();
});


test('parentheses', function (t) {
    var p = new Parser();
    var actual = p.parse('Fred, George, and Bob can read, write, and modify ' +
        'foo, bar, and baz when sourceip::ip = 0.0.0.0 and ' +
        '(requesttime::datetime >= 2013-10-01T13:00:00 and ' +
        'requesttime::datetime < 2013-10-01T14:00:00)');
    var expected = {
        principals: {'Fred': true, 'Bob': true, 'George': true},
        effect: true,
        actions: {'read': true , 'write': true, 'modify': true},
        resources: {'foo': true, 'bar': true, 'baz': true},
        conditions: ['and',
            [ '=',
                { name: 'sourceip', type: 'ip'},
                '0.0.0.0'],
                ['and',
                    [ '>=',
                        { name: 'requesttime', type: 'datetime'},
                        '2013-10-01T13:00:00'],
                    [ '<',
                        { name: 'requesttime', type: 'datetime'},
                        '2013-10-01T14:00:00']
                ]
        ]
    };
    t.deepEqual(expected, actual);
    t.done();

});

test('string literals', function (t) {
    var p = new Parser();

    t.throws(function () {
        p.parse('Fred can read foo when sourceip::ip = ::ffff:ada0:d182');
    });

    t.doesNotThrow(function () {
        p.parse('Fred can read foo when sourceip::ip = "::ffff:ada0:d182"');
    });

    t.throws(function () {
        p.parse('Fred and and can read foo');
    });

    t.doesNotThrow(function () {
        p.parse('Fred and "and" can read foo');
    });

    t.done();
});
