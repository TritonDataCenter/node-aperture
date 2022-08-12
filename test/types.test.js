// Copyright (c) 2013, Joyent, Inc. All rights reserved.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

var types = require('..').types;
var test = require('tap').test;


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
        }, ip);
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
        }, ip);
    });

    t.end();
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

    t.end();
});


test('string: validate', function (t) {
    t.doesNotThrow(function () {
        types.string.validate('/asdf/i', 'like');
    }, 'like');
    t.throws(function () {
        types.string.validate('/*asdf/i', 'like');
    }, 'like throws');
    t.end();
});

test('string: ops', function (t) {
    t.ok(types.string['=']('a', 'a'));
    t.ok(types.string['<']('a', 'b'));
    t.ok(types.string['>']('b', 'a'));
    t.ok(types.string['<=']('a', 'b'));
    t.ok(types.string['<=']('a', 'a'));
    t.ok(types.string['>=']('b', 'a'));
    t.ok(types.string['>=']('a', 'a'));
    t.ok(types.string['like']('a', '/a/'));
    t.ok(types.string['like']('A', '/a/i'));

    t.notOk(types.string['=']('a', 'b'));
    t.notOk(types.string['<']('b', 'a'));
    t.notOk(types.string['>']('a', 'b'));
    t.notOk(types.string['<=']('b', 'a'));
    t.notOk(types.string['>=']('a', 'b'));
    t.notOk(types.string['like']('b', '/a/'));
    t.notOk(types.string['like']('B', '/a/i'));
    t.end();
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
        }, date);
    });

    dates = [
        'asdf',
        '12:32:00'
    ];

    dates.forEach(function (date) {
        t.throws(function () {
            types.date.validate(date);
        }, date);
    });

    t.end();
});

test('date: ops', function (t) {
    var date = new Date('2013-10-24');
    t.throws(function () {
        types.date['=']('2013-10-24', '2013-10-24');
    }, 'AssertionError');
    t.ok(types.date['='](date, '2013-10-24'));
    t.ok(types.date['<'](date, '2013-10-25'));
    t.ok(types.date['>'](date, '2013-10-23'));
    t.ok(types.date['<='](date, '2013-10-24'));
    t.ok(types.date['<='](date, '2013-10-25'));
    t.ok(types.date['>='](date, '2013-10-24'));
    t.ok(types.date['>='](date, '2013-10-23'));

    t.notOk(types.date['='](date, '1000-10-10'));
    t.notOk(types.date['<'](date, '2013-10-23'));
    t.notOk(types.date['>'](date, '2013-10-25'));
    t.notOk(types.date['<='](date, '2013-10-23'));
    t.notOk(types.date['>='](date, '2013-10-25'));
    t.end();
});


test('day: validate', function (t) {
    var days = [
        '1', '2', '3', '4', '5', '6', '7',
        '2013-06-04', 'Aug 9, 1995', 'Monday', 'SU', 'thu'
    ];

    days.forEach(function (day) {
        t.doesNotThrow(function () {
            types.day.validate(day);
        }, day);
    });

    days = [
        '0', '8', 'asdf'
    ];

    days.forEach(function (day) {
        t.throws(function () {
            types.day.validate(day);
        }, day);
    });

    t.end();
});

test('day: ops', function (t) {
    var day = new Date('2013-10-24'); // Thursday
    t.throws(function () {
        types.day['=']('2013-10-24', '2013-10-24');
    }, 'AssertionError');
    t.ok(types.day['='](day, 'Thursday'));
    t.ok(types.day['<'](day, 'Friday'));
    t.ok(types.day['>'](day, 'Wednesday'));
    t.ok(types.day['<='](day, 'Thursday'));
    t.ok(types.day['<='](day, 'Friday'));
    t.ok(types.day['>='](day, 'Thursday'));
    t.ok(types.day['>='](day, 'Wednesday'));
    t.ok(types.day['>'](new Date('2013-10-27'), 'Monday'));

    t.notOk(types.day['='](day, 'Friday'));
    t.notOk(types.day['<'](day, 'Wednesday'));
    t.notOk(types.day['>'](day, 'Thursday'));
    t.notOk(types.day['<='](day, 'Wednesday'));
    t.notOk(types.day['>='](day, 'Friday'));
    t.end();
});


test('time: validate', function (t) {
    var times = [
        '2013-06-01T13:00:00',
        '00:00:00',
        '23:59:59'
    ];

    times.forEach(function (time) {
        t.doesNotThrow(function () {
            types.time.validate(time);
        }, time);
    });

    times = [
        // A 24th hour is allowed only if minutes, seconds, and milliseconds are 0
        '2013-06-01T24:00:01',
        'asdf',
        '20',
        '20:00'
    ];

    times.forEach(function (time) {
        t.throws(function () {
            types.time.validate(time);
        }, time);
    });

    t.end();
});


test('time: ops', function (t) {
    var time = new Date('2013-10-24T12:00:00'); // noon
    t.throws(function () {
        types.time['=']('2013-10-24T12:00:00', '2013-10-24T:00:00');
    }, 'AssertionError');

    t.ok(types.time['='](time, '12:00:00'));
    t.ok(types.time['<'](time, '12:00:01'));
    t.ok(types.time['>'](time, '11:59:59'));
    t.ok(types.time['<='](time, '14:00:00'));
    t.ok(types.time['<='](time, '12:00:00'));
    t.ok(types.time['>='](time, '10:00:00'));
    t.ok(types.time['>='](time, '12:00:00'));

    t.notOk(types.time['='](time, '12:00:01'));
    t.notOk(types.time['<'](time, '11:59:59'));
    t.notOk(types.time['>'](time, '12:00:01'));
    t.notOk(types.time['<='](time, '11:59:59'));
    t.notOk(types.time['>='](time, '12:00:01'));
    t.end();
});

test('number: validate', function (t) {
    var valid = [
        '3', '123', '010', '0x1F', '9.9'
    ];

    valid.forEach(function (n) {
        t.doesNotThrow(function () {
            types.number.validate(n);
        }, n);
    });

    var invalid = [
        'asdf', '3*3', '9,9'
    ];
    invalid.forEach(function (n) {
        t.throws(function () {
            types.number.validate(n);
        }, n);
    });
    t.end();
});

test('number: ops', function (t) {
    t.throws(function () {
        types.number['=']('5', '5');
    }, 'AssertionError');

    t.ok(types.number['='](5, '5'));
    t.ok(types.number['<'](5, '6'));
    t.ok(types.number['>'](5, '4'));
    t.ok(types.number['<='](5, '5'));
    t.ok(types.number['<='](5, '6'));
    t.ok(types.number['>='](5, '5'));
    t.ok(types.number['>='](5, '4'));
    t.ok(types.number['='](31, '0x1F'));

    t.notOk(types.number['='](5, '6'));
    t.notOk(types.number['<'](5, '4'));
    t.notOk(types.number['>'](5, '6'));
    t.notOk(types.number['<='](5, '4'));
    t.notOk(types.number['>='](5, '6'));
    t.end();
});

test('array: validate', function (t) {
    var valid = [
        '[1,2,3]', '[1, 2, 3]'
    ];
    valid.forEach(function (n) {
        t.doesNotThrow(function () {
            types.array.validate(n);
        }, n);
    });

    var invalid = [
        '1,2,3', '{"key":"value"}'
    ];
    invalid.forEach(function (n) {
        t.throws(function () {
            types.number.validate(n);
        }, n);
    });
    t.end();
});

test('array: contains', function (t) {
    t.throws(function () {
        types.array.contains('["a", "b", "c"]', 'b');
    }, 'AssertionError');

    t.ok(types.array.contains(['a', 'b', 'c'], 'b'));
    t.end();
});

test('boolean', function (t) {
    t.ok(types.boolean['='](true, 'true'));
    t.ok(types.boolean['='](false, 'false'));
    t.ok(types.boolean['!='](true, 'false'));
    t.ok(types.boolean['!='](false, 'true'));

    t.notOk(types.boolean['='](true, 'false'));
    t.notOk(types.boolean['='](false, 'true'));
    t.notOk(types.boolean['!='](true, 'true'));
    t.notOk(types.boolean['!='](false, 'false'));
    t.end();
});
