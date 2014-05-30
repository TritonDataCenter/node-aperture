// Copyright (c) 2013, Joyent, Inc. All rights reserved.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

/*
 * number type
 * - context: a number
 * - policy: string representing a number
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
    assert.number(context, 'context');
    return (context === +policy);
}

function neq(context, policy) {
    return (!eq(context, policy));
}

function lt(context, policy) {
    assert.number(context, 'context');
    return (context < +policy);
}

function gt(context, policy) {
    assert.number(context, 'context');
    return (context > +policy);
}

function le(context, policy) {
    assert.number(context, 'context');
    return (context <= +policy);
}

function ge(context, policy) {
    assert.number(context, 'context');
    return (context >= +policy);
}

function validate(input) {
    if (isNaN(+input)) {
        throw new Error('number: not a number');
    }
}
