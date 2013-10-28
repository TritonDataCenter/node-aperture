// Copyright (c) 2013, Joyent, Inc. All rights reserved.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

var Parser = require('../lib/parser.js').Parser;
var errors = require('../lib/errors.js');
var test = require('tap').test;



var strings = [
    'Fred can read foo',
    'Fred can read foo when sourceip::ip = 0.0.0.0',
    'Fred can read foo where sourceip::ip = 0.0.0.0',
    'Fred can read foo if sourceip::ip = 0.0.0.0',
    'Fred can read foo if sourceip = 0.0.0.0',
    'Fred and Bob can read and write foo and bar when sourceip::ip = 0.0.0.0',
    'Fred, George, and Bob can read, write, and modify ' +
        'foo, bar, and baz when sourceip::ip = 0.0.0.0 and ' +
        'requesttime::datetime >= 2013-10-01T13:00:00 and ' +
        'requesttime::datetime < 2013-10-01T14:00:00',
    'Fred, George and Bob can read, write and modify ' +
        'foo, bar and baz when sourceip::ip = 0.0.0.0 and ' +
        'requesttime::datetime >= 2013-10-01T13:00:00 and ' +
        'requesttime::datetime < 2013-10-01T14:00:00',
    'Fred can read foo when sourceip::ip = "::ffff:ada0:d182"',
    'Fred can read "this resource" when some::string = "foo bar"',
    'Fred and "and" can read foo',
    'Fred can read foo when sourceip in (0.0.0.0)',
    'Fred can read foo when sourceip in (0.0.0.0, 1.1.1.1)',
    'Fred can read foo when sourceip in (0.0.0.0, 1.1.1.1, 2.2.2.2)',
    'Fred can read',
    'Can read foo',
    'Can read',
    'Fred can read /foo/bar',
    'Fred can /read/::regexp',
    'Fred can /read/::regex when sourceip::ip = 0.0.0.0',
    'Fred can /read/::REGEXP when sourceip::ip = 0.0.0.0',
    '* can r*e*ad *foo',
    '* can /.*/::regex *'
];

strings.forEach(function (s) {
    test(s, function (t) {
        var p = new Parser();
        t.doesNotThrow(function () {
            p.parse(s);
        }, s);
        t.end();
    });
});


test('no conditions', function (t) {
    var p = new Parser();
    var actual = p.parse('Fred can read foo');
    var expected = {
        principals: {
            regex: [],
            exact: {
                'Fred': true
            }
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true
            }
        },
        conditions: undefined
    };
    t.deepEqual(expected, actual);
    t.end();
});


test('basic', function (t) {
    var p = new Parser();
    var texts = [
        'Fred can read foo when sourceip::ip = 0.0.0.0',
        'Fred can read foo where sourceip::ip = 0.0.0.0',
        'Fred can read foo if sourceip::ip = 0.0.0.0'
    ];

    var expected = {
        principals: {
            regex: [],
            exact: {
                'Fred': true
            }
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true
            }
        },
        conditions: [ '=', { name: 'sourceip', type: 'ip'}, '0.0.0.0']
    };
    var actual;
    for (var i = 0; i < texts.length; i++) {
        actual = p.parse(texts[i]);
        t.deepEqual(expected, actual);
    }
    t.end();
});


test('lists, length 2', function (t) {
    var p = new Parser();
    var actual = p.parse('Fred and Bob can read and write foo and bar when ' +
        'sourceip::ip = 0.0.0.0');

    var expected = {
        principals: {
            regex: [],
            exact: {
                'Fred': true,
                'Bob': true
            }
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true,
                'write': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true,
                'bar': true
            }
        },
        conditions: [ '=', { name: 'sourceip', type: 'ip'}, '0.0.0.0']
    };
    t.deepEqual(expected, actual);
    t.end();
});


test('lists, length 3', function (t) {
    var p = new Parser();
    var serial = p.parse('Fred, George, and Bob can read, write, and modify ' +
        'foo, bar, and baz when sourceip::ip = 0.0.0.0 and ' +
        'requesttime::datetime >= 2013-10-01T13:00:00 and ' +
        'requesttime::datetime < 2013-10-01T14:00:00');
    var noserial = p.parse('Fred, George and Bob can read, write and modify ' +
        'foo, bar and baz when sourceip::ip = 0.0.0.0 and ' +
        'requesttime::datetime >= 2013-10-01T13:00:00 and ' +
        'requesttime::datetime < 2013-10-01T14:00:00');
    var expected = {
        principals: {
            regex: [],
            exact: {
                'Fred': true,
                'Bob': true,
                'George': true
            }
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true,
                'write': true,
                'modify': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true,
                'bar': true,
                'baz': true
            }
        },
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
    t.deepEqual(expected, serial);
    t.deepEqual(expected, noserial);
    t.end();

});


test('validation', function (t) {

    var parser = new Parser({
        types: {}
    });
    var text = 'Fred can read foo when sourceip like 0.0.0.0';

    t.throws(function () {
        parser.parse(text);
    }, new errors.MissingTypeError('no type for "sourceip"'));

    text = 'Fred can read foo when sourceip::ip = 0.0.0.0';
    t.throws(function () {
        parser.parse(text);
    }, new errors.UnknownTypeError('unknown type "ip"'));


    parser = new Parser({
        types: {
            'ip': {
                'validate': function () {}
            }
        }
    });

    t.throws(function () {
        parser.parse(text);
    }, new errors.UnsupportedOperationError(
        'unsupported operation "=" on type "ip"'));


    parser = new Parser({
        types: {
            'ip': {
                '=': function () {},
                'validate': function () {throw new Error('bad'); }
            }
        }
    });

    t.throws(function () {
        parser.parse(text);
    }, new errors.ValidationError(
        'unable to validate value "0.0.0.0" as type "ip"'));

    parser = new Parser({
        types: {
            'ip': {
                '=': function () {}
            }
        }
    });
    t.throws(function () {
        parser.parse(text);
    }, new errors.ValidationError(
        'unable to validate value "0.0.0.0" as type "ip"'));

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

    t.end();
});



test('parentheses', function (t) {
    var p = new Parser();
    var actual = p.parse('Fred, George, and Bob can read, write, and modify ' +
        'foo, bar, and baz when sourceip::ip = 0.0.0.0 and ' +
        '(requesttime::datetime >= 2013-10-01T13:00:00 and ' +
        'requesttime::datetime < 2013-10-01T14:00:00)');
    var expected = {
        principals: {
            regex: [],
            exact: {
                'Fred': true,
                'Bob': true,
                'George': true
            }
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true,
                'write': true,
                'modify': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true,
                'bar': true,
                'baz': true
            }
        },
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
    t.end();

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

    t.end();
});


test('condition lists "in (x, y, z)"', function (t) {
    var p = new Parser();
    var actual = p.parse('Fred can read foo when sourceip::ip in ' +
        '(0.0.0.0, 1.1.1.1)');
    var expected = {
        principals: {
            regex: [],
            exact: {
                'Fred': true
            }
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true
            }
        },
        conditions: [ 'in', { name: 'sourceip', type: 'ip'},
            ['0.0.0.0', '1.1.1.1']]
    };
    t.deepEqual(expected, actual);
    t.end();

});


test('condition list validation', function (t) {
    t.plan(3);
    var parser = new Parser({
        types: {
            'ip': {
                '=': function () {},
                'validate': function (value) {
                    if (!this.ran) {
                        t.equal(value, '0.0.0.0');
                    } else {
                        t.equal(value, '1.1.1.1');
                    }
                    this.ran = true;
                }
            }
        }
    });
    var text = 'Fred can read foo if sourceip::ip in (0.0.0.0, 1.1.1.1)';
    t.doesNotThrow(function () {
        parser.parse(text);
    });
    t.end();
});


test('"IN" can only be used with lists', function (t) {
    var p = new Parser();
    var text = 'Fred can read foo when sourceip::ip in 1.1.1.1';
    t.throws(function () {
        p.parse(text);
    });
    t.end();
});

test('regular expressions', function (t) {
    var p = new Parser();
    var actual = p.parse('Fred can /read/::regex foo');
    var expected = {
        principals: {
            regex: [],
            exact: {
                'Fred': true
            }
        },
        effect: true,
        actions: {
            regex: [
                '/read/'
            ],
            exact: {}
        },
        resources: {
            regex: [],
            exact: {
                'foo': true
            }
        },
        conditions: undefined
    };
    t.deepEqual(actual, expected);

    actual = p.parse('Fred can read foo, bar*, and /b[a]*z/i::regex');
    expected = {
        principals: {
            regex: [],
            exact: {
                'Fred': true
            }
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true
            }
        },
        resources: {
            regex: [
                '/bar.*/',
                '/b[a]*z/i'
            ],
            exact: {
                'foo': true
            }
        },
        conditions: undefined
    };
    t.deepEqual(actual, expected);
    t.end();
});
