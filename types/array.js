// Copyright (c) 2014, Joyent, Inc. All rights reserved.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

/*
 * array type
 * - context: an array
 * - policy: a string
 */

var assert = require('assert-plus');

module.exports = {
    'contains': contains,
    'validate': validate
};

/*
 * Will only look for matching strings, as `policy` is always a string.
 */
function contains(context, policy) {
    assert.ok(Array.isArray(context), 'context');
    return (context.indexOf(policy) > -1);
}

function validate(value, op) {
    var arr;

    if (op === 'contains') {
        return;
    }

    try {
        arr = JSON.parse(value);
        if (!Array.isArray(arr)) {
            throw new Error('array: not an array');
        }
    } catch (e) {
        throw new Error('array: unable to parse array');
    }
}
