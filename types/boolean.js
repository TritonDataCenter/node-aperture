// Copyright (c) 2014, Joyent, Inc. All rights reserved.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

/*
 * boolean type
 * - context: a boolean
 * - policy: "true" or "false"
 */

var assert = require('assert-plus');

module.exports = {
    '=': eq,
    '!=': neq,
    'validate': validate
};

function eq(context, policy) {
    assert.bool(context);
    return (context && policy === 'true') ||
           (!context && policy === 'false');
}

function neq(context, policy) {
    return (!eq(context, policy));
}

function validate(value, op) {
    if (value !== 'true' && value !== 'false') {
        throw new Error('boolean: must be "true" or "false"');
    }
}
