// Copyright (c) 2013, Joyent, Inc. All rights reserved.
/*
 * Extremely basic time type.
 * Any string that Date.parse() can parse will be accepted. In addition,
 * date-agnostic times are supported. However, this type will only support the
 * time formats hh:mm:ss and hh:mm, and will always assume UTC. It also does
 * not include support for leap seconds or the 24:00 representation for
 * midnight.
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
    var date = new Date(input);
    var split;
    if (isNaN(date.valueOf())){
        date = new Date();
        split = input.split(':');
        date.setUTCHours(split[0]);
        date.setUTCMinutes(split[1]);
        date.setUTCSeconds(split[2] || 0);
    }
    return (date);
}

function validate(input) {
    if (isNaN(parse(input).valueOf())) {
        throw new Error('time: invalid time');
    }
}
