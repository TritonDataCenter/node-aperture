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

module.exports = {
    '=': eq,
    '!=': neq,
    '<': lt,
    '>': gt,
    '<=': le,
    '>=': ge,
    'like': like,
    'validate': validate
};

function eq(context, policy) {
    return (context === policy);
}

function neq(context, policy) {
    return (!eq(context, policy));
}

function lt(context, policy) {
    return (context < policy);
}

function gt(context, policy) {
    return (context > policy);
}

function le(context, policy) {
    return (context <= policy);
}

function ge(context, policy) {
    return (context >= policy);
}

function like(context, policy) {
    return (toRegExp(policy).test(context));
}

function toRegExp(string) {
    var last = string.lastIndexOf('/');
    var body = string.substring(1, last);
    var flags = string.substring(last + 1);
    return (new RegExp(body, flags));
}

function validate(value, op) {
    // validate as regex literal if op is `like`
    // otherwise value is always a string
    if (op === 'like') {
        toRegExp(value);
    }
}
