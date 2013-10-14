// Copyright (c) 2013, Joyent, Inc. All rights reserved.
module.exports = {
    '=': eq,
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
    return (context.search(new RegExp(policy)));
}

function validate() {
    // input is always a string, so validation always passes
}
