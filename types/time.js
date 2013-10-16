// Copyright (c) 2013, Joyent, Inc. All rights reserved.
/*
 * Extremely basic time type with support for date-agnostic times. This type
 * only supports the formats hh:mm:ss and hh:mm, and will always assume UTC. It
 * also does not include support for leap seconds.
 */
module.exports = {
    '=': eq,
    '<': lt,
    '>': gt,
    '<=': le,
    '>=': ge,
    'validate': validate
};

function eq(context, policy) {
    return (daySeconds(context) === daySeconds(policy));
}

function lt(context, policy) {
    return (daySeconds(context) < daySeconds(policy));
}

function gt(context, policy) {
    return (daySeconds(context) > daySeconds(policy));
}

function le(context, policy) {
    return (daySeconds(context) <= daySeconds(policy));
}

function ge(context, policy) {
    return (daySeconds(context) >= daySeconds(policy));
}

function daySeconds(input) {
    var date = parse(input);
    return (date.getUTCHours() * 3600 +
        date.getUTCMinutes() * 60 +
        date.getUTCSeconds());
}

function parse(input) {
    var split = input.split(':');
    date = new Date();
    date.setUTCHours(split[0]);
    date.setUTCMinutes(split[1]);
    date.setUTCSeconds(split[2] || 0);
    if (isNaN(date.valueOf())) {
        date = new Date(input);
    }
    return (date);
}

function validate(input) {
    if (isNaN(parse(input).valueOf())) {
        throw new Error('time: invalid time');
    }
}
