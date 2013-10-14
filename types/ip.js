// Copyright (c) 2013, Joyent, Inc. All rights reserved.
var ipaddr = require('ipaddr.js');

module.exports = {
    '=': eq,
    'validate': validate
};

function eq(context, policy) {
    policy = policy.split('/');
    var p_addr = ipaddr.parse(policy[0]);
    var p_bits = policy[1] || (p_addr.kind() === 'ipv6' ? 128 : 32);
    var c_addr = ipaddr.parse(context);
    if (c_addr.kind() === p_addr.kind()) {
        return (c_addr.match(p_addr, p_bits));
    } else if (c_addr.kind() === 'ipv4') {
        return (c_addr.toIPv4MappedAddress().match(p_addr, p_bits));
    } else {
        if (c_addr.isIPv4MappedAddress()) {
            return (c_addr.toIPv4Address().match(p_addr, p_bits));
        } else {
            return (false);
        }
    }
}

function validate(input) {
    input = input.split('/');
    var addr = ipaddr.parse(input[0]);
    var upper;
    if (input.length > 1) {
        upper = addr.kind() === 'ipv6' ? 128 : 32;
        if (input[1] < 0 || input[1] > upper) {
            throw new Error('prefix size must be between 0 and ' + upper);
        }
    }
}
