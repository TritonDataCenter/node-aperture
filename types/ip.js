var assert = require('assert-plus');
var ipaddr = require('ipaddr.js');

module.exports = {
    '=': eq,
    'validate': validate
};

function eq(lhs, rhs) {
    return lhs === rhs;
}

function validate(input) {
    ipaddr.parse(input);
}
