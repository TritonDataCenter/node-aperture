// Copyright (c) 2013, Joyent, Inc. All rights reserved.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

var helper = require('./helper.js');
var types = require('../types');

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
        }, Object, ip);
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
        }, /ip/, ip);
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
        t.ok(types.ip['='](pair[0], pair[1]), pair);
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


test('string: ops', function (t) {
    t.ok(types.string['=']('a', 'a'));
    t.ok(types.string['<']('a', 'b'));
    t.ok(types.string['>']('b', 'a'));
    t.ok(types.string['<=']('a', 'b'));
    t.ok(types.string['<=']('a', 'a'));
    t.ok(types.string['>=']('b', 'a'));
    t.ok(types.string['>=']('a', 'a'));

    t.notOk(types.string['=']('a', 'b'));
    t.notOk(types.string['<']('b', 'a'));
    t.notOk(types.string['>']('a', 'b'));
    t.notOk(types.string['<=']('b', 'a'));
    t.notOk(types.string['>=']('a', 'b'));
    t.done();
});


test('date: validate', function (t) {
    var dates = [
        '2013-06-07T21:00:00',
        '2013-06-07',
        'Wed, 09 Aug 1995 00:00:00 GMT',
        'Aug 9, 1995'
    ];

    dates.forEach(function (date) {
        t.doesNotThrow(function () {
            types.date.validate(date);
        }, Object, date);
    });

    dates = [
        'asdf',
        '12:32:00'
    ];

    dates.forEach(function (date) {
        t.throws(function () {
            types.date.validate(date);
        }, /date/, date);
    });

    t.done();
});


test('day: validate', function (t) {
    var days = [
        '1', '2', '3', '4', '5', '6', '7',
        '2013-06-04', 'Aug 9, 1995'
    ];

    days.forEach(function (day) {
        t.doesNotThrow(function () {
            types.day.validate(day);
        }, Object, day);
    });

    days = [
        '0', '8',
        'Monday',
        'asdf'
    ];

    days.forEach(function (day) {
        t.throws(function () {
            types.day.validate(day);
        }, /day/, day);
    });

    t.done();
});


test('time: validate', function (t) {
    var times = [
        '2013-06-01T13:00:00',
        '00:00:00',
        '23:59:59',
        '00:00',
        '23:59'
    ];

    times.forEach(function (time) {
        t.doesNotThrow(function () {
            types.time.validate(time);
        }, Object, time);
    });

    times = [
        'asdf'
    ];

    times.forEach(function (time) {
        t.throws(function () {
            types.time.validate(time);
        }, /time/, time);
    });

    t.done();
});
