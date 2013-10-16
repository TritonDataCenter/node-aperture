// Copyright (c) 2013, Joyent, Inc. All rights reserved.
module.exports = {
    '=': eq,
    '<': lt,
    '>': gt,
    '<=': le,
    '>=': ge,
    'validate': validate
};

function eq(context, policy) {
    return (Date.parse(context) === Date.parse(policy));
}

function lt(context, policy) {
    return (Date.parse(context) < Date.parse(policy));
}

function gt(context, policy) {
    return (Date.parse(context) > Date.parse(policy));
}

function le(context, policy) {
    return (Date.parse(context) <= Date.parse(policy));
}

function ge(context, policy) {
    return (Date.parse(context) >= Date.parse(policy));
}

function validate(input) {
    if (isNaN(Date.parse(input))) {
        throw new Error('date: unable to parse date');
    }
}
