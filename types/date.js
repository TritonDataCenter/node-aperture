// Copyright (c) 2013, Joyent, Inc. All rights reserved.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

/*
 * date type
 * - context: a Date object
 * - policy: any string parsable by Date.parse
 *
 * Compares epoch time in ms
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

function eq(context, policy) {
    assert.date(context, 'context');
    return (context.getTime() === Date.parse(policy));
}

function lt(context, policy) {
    assert.date(context, 'context');
    return (context.getTime() < Date.parse(policy));
}

function gt(context, policy) {
    assert.date(context, 'context');
    return (context.getTime() > Date.parse(policy));
}

function le(context, policy) {
    assert.date(context, 'context');
    return (context.getTime() <= Date.parse(policy));
}

function ge(context, policy) {
    assert.date(context, 'context');
    return (context.getTime() >= Date.parse(policy));
}

function validate(input) {
    if (isNaN(Date.parse(input))) {
        throw new Error('date: unable to parse date');
    }
}
