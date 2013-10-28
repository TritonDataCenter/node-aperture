// Copyright (c) 2013, Joyent, Inc. All rights reserved.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

/*
 * IP type
 * - context: an IP address (v4 or v6) as a string
 * - policy: an IP address or IP address CIDR range (v4 or v6) as a string
 *
 * Checks if the IP addresses match or if the context IP address is within the
 * policy IP address range. Converts between IPv4 and IPv6 as needed. Equality
 * check will return false if the context is an IPv6 address and the policy has
 * an IPv4 address or range and the context IPv6 address can not be mapped to a
 * IPv4 address for comparison.
 */

var assert = require('assert-plus');
var ipaddr = require('ipaddr.js');

module.exports = {
    '=': eq,
    'validate': validate
};

function eq(context, policy) {
    assert.string(context, 'context');
    policy = policy.split('/');
    var p_addr = ipaddr.parse(policy[0]);
    var p_bits = policy[1] || (p_addr.kind() === 'ipv6' ? 128 : 32);
    var c_addr = ipaddr.parse(context);
    var result = false;

    if (c_addr.kind() === p_addr.kind()) { // matching types
        result = c_addr.match(p_addr, p_bits);
    } else if (c_addr.kind() === 'ipv4') { // ipv4 == ipv6
        result = c_addr.toIPv4MappedAddress().match(p_addr, p_bits);
    } else if (c_addr.isIPv4MappedAddress()) { // ipv6 == ipv4
        result = c_addr.toIPv4Address().match(p_addr, p_bits);
    }

    return (result);
}

function validate(input) {
    input = input.split('/');
    var addr = ipaddr.parse(input[0]);
    var upper;
    if (input.length > 1) {
        upper = addr.kind() === 'ipv6' ? 128 : 32;
        if (input[1] < 0 || input[1] > upper) {
            throw new Error('ip: prefix size must be between 0 and ' + upper);
        }
    }
}
