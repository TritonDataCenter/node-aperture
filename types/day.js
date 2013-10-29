// Copyright (c) 2013, Joyent, Inc. All rights reserved.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

/*
 * day type
 * - context: a Date object
 * - policy: a number between 1 (Monday) and 7 (Sunday) or a date that is on the
 *   same weekday as the one desired, or Monday/Mon/M (TH for Thursday, SU for
 *   Sunday)
 */

var assert = require('assert-plus');

module.exports = {
    '=': eq,
    '<': lt,
    '>': gt,
    '<=': le,
    '>=': ge,
    'validate': validate
};

var dayNames = {
    'monday': 1,
    'mon': 1,
    'm': 1,
    'tuesday': 2,
    'tue': 2,
    't': 2,
    'wednesday': 3,
    'wed': 3,
    'w': 3,
    'thursday': 4,
    'thu': 4,
    'th': 4,
    'friday': 5,
    'fri': 5,
    'f': 5,
    'saturday': 6,
    'sat': 6,
    's': 6,
    'sunday': 7,
    'sun': 7,
    'su': 7
}


function eq(context, policy) {
    assert.date(context, 'context');
    return (isoDay(context) === stringToDay(policy));
}

function lt(context, policy) {
    assert.date(context, 'context');
    return (isoDay(context) < stringToDay(policy));
}

function gt(context, policy) {
    assert.date(context, 'context');
    return (isoDay(context) > stringToDay(policy));
}

function le(context, policy) {
    assert.date(context, 'context');
    return (isoDay(context) <= stringToDay(policy));
}

function ge(context, policy) {
    assert.date(context, 'context');
    return (isoDay(context) >= stringToDay(policy));
}

function isoDay(date) {
    // ISO-8601 specifies Sunday as 7. getUTCDay returns 0 for Sunday.
    return (date.getUTCDay() === 0 ? 7 : date.getUTCDay());
}

function stringToDay(str) {
    if (dayNames[str.toLowerCase()]) {
        return (dayNames[str.toLowerCase()]);
    }

    // use unary + instead of parseInt because parseInt stops at first
    // non-number character and will parse '2013-01-01' as 2013
    var cast = +str;
    return (isNaN(cast) ? isoDay(new Date(str)) : cast);
}

function validate(input) {
    var day = stringToDay(input);
    if (isNaN(day)) {
        throw new Error('day: unable to parse day');
    }
    if (day < 1 || day > 7) {
        throw new Error('day: day must be between 1 (Monday) and 7 (Sunday)');
    }
}
