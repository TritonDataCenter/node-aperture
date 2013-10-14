// Copyright (c) 2013, Joyent, Inc. All rights reserved.
var types = require('../types');
var helper = require('./helper.js');

var test = helper.test;


test('ip: validate', function (t) {
    var ips = [
        '192.168.1.1',
        '192.168.1.0/24',
        '0.0.0.0',
        '::ffff:192.168.1.1',
        '::ffff:192.168.1.1/128'
    ];

    ips.forEach(function (ip) {
        t.doesNotThrow(function () {
                types.ip.validate(ip);
            }
        );
    });

    ips = [
        '192.168.1.1/128',
        '::ffff:192.168.1.1/129',
        'asdf',
        '300.1.2.3'
    ];

    ips.forEach(function (ip) {
        t.throws(function () {
                types.ip.validate(ip);
            }
        );
    });

    t.done();
});

test('ip: eq', function (t) {
    var pairs = [
        [ '192.168.1.1', '192.168.1.1' ],
        [ '192.168.1.1', '192.168.1.0/24' ],
        [ '192.168.1.1', '::ffff:c0a8:101' ],
        [ '192.168.1.1', '::ffff:c0a8:0/16' ],
        [ '::ffff:c0a8:101', '192.168.1.1' ],
        [ '::ffff:c0a8:101', '192.168.1.0/24' ],
        [ '::ffff:c0a8:101', '::ffff:c0a8:101' ],
        [ '::ffff:c0a8:101', '::ffff:c0a8:0/112' ]
    ];

    pairs.forEach(function (pair) {
        t.ok(types.ip['='](pair[0], pair[1]));
    });

    pairs = [
        [ '192.168.1.1', '192.168.1.2' ],
        [ '192.168.1.1', '192.168.2.0/24' ],
        [ '192.168.1.1', '::ffff:c0a8:102' ],
        [ '192.168.1.1', '::ffff:c0a9:0/112' ],
        [ '::ffff:c0a8:101', '192.168.1.2' ],
        [ '::ffff:c0a8:101', '192.168.2.0/24' ],
        [ '::ffff:c0a8:101', '::ffff:c0a8:102' ],
        [ '::ffff:c0a8:101', '::ffff:c0a9:0/112' ]
    ];

    pairs.forEach(function (pair) {
        t.notOk(types.ip['='](pair[0], pair[1]), pair);
    });

    t.done();
});
