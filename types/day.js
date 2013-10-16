// Copyright (c) 2013, Joyent, Inc. All rights reserved.
/*
 * Extremely basic day type.
 * Pass in a number between 1 (Monday) and 7 (Sunday) or a date that is on the
 * same weekday as the one desired. Always assumes UTC.
 */
module.exports = {
    '=': eq,
    'validate': validate
};

function eq(context, policy) {
    var parsed = parseInt(context, 10);
    if (!isNaN(parsed)) {
        return (parsed === policy);
    }

    // If context can't be parsed as a Date, getUTCDay will return NaN.
    // Javascript uses 0-6, ISO-8601 uses 1-7.
    return (new Date(context).getUTCDay() + 1 === policy);
}

function validate(input) {
    var parsed = parseInt(input, 10);
    var day = isNaN(parsed) ? new Date(input).getUTCDay() + 1 : parsed;
    if (isNaN(day)) {
        throw new Error('day: unable to parse day');
    }
    if (input < 1 || input > 7) {
        throw new Error('day: day must be between 1 (Monday) and 7 (Sunday)');
    }
}
