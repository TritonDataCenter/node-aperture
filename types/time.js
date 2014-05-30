// Copyright (c) 2013, Joyent, Inc. All rights reserved.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

/*
 * time type
 * - context: a Date object
 * - policy: string in hh:mm:ss format or any format parsable by Date.parse
 *
 * If a full datetime string is passed in, only the time part of that datetime
 * will be used and the date part of the string will be ignored. Use the date
 * type to compare dates.
 */

var assert = require('assert-plus');

module.exports = {
    '=': eq,
    '!=': neq,
    '<': lt,
    '>': gt,
    '<=': le,
    '>=': ge,
    'validate': validate
};

function eq(context, policy) {
    assert.date(context, 'context');
    return (daySeconds(context) === daySeconds(parse(policy)));
}

function neq(context, policy) {
    return (!eq(context, policy));
}

function lt(context, policy) {
    assert.date(context, 'context');
    return (daySeconds(context) < daySeconds(parse(policy)));
}

function gt(context, policy) {
    assert.date(context, 'context');
    return (daySeconds(context) > daySeconds(parse(policy)));
}

function le(context, policy) {
    assert.date(context, 'context');
    return (daySeconds(context) <= daySeconds(parse(policy)));
}

function ge(context, policy) {
    assert.date(context, 'context');
    return (daySeconds(context) >= daySeconds(parse(policy)));
}

function daySeconds(input) {
    return (input.getUTCHours() * 3600 +
        input.getUTCMinutes() * 60 +
        input.getUTCSeconds());
}

function parse(input) {
    var split = input.split(':');
    var date;
    if (split.length === 3) {
        date = new Date();
        date.setUTCHours(split[0]);
        date.setUTCMinutes(split[1]);
        date.setUTCSeconds(split[2]);
    }
    if (!date || isNaN(date.getTime())) {
        date = new Date(input);
    }
    return (date);
}

function validate(input) {
    if (isNaN(parse(input).getTime())) {
        throw new Error('time: invalid time');
    }
}
