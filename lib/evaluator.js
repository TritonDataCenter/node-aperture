// Copyright (c) 2013, Joyent, Inc. All rights reserved.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

var assert = require('assert-plus');
var errors = require('./errors.js');



function parseRegex(literal) {
    var last = literal.lastIndexOf('/');
    var body = literal.substring(1, last);
    var flags = literal.substring(last + 1);
    return (new RegExp(body, flags));
}


function Evaluator(opts) {
    assert.object(opts, 'opts');
    assert.object(opts.types, 'opts.types');
    assert.optionalObject(opts.typeTable, 'opts.typeTable');

    this.types = opts.types;
    this.typeTable = opts.typeTable;
}


Evaluator.prototype.evaluateOne = function evaluateOne(policy, context) {
    var self = this;

    var PAR = ['principal', 'action', 'resource'].every(function (property) {
        var plural = property + 's';

        // undefined property -> implied property (skip checking it)
        if (!policy[plural]) {
            return (true);
        }

        // ALL/Everything/Anything
        if (policy[plural] === 1) {
            return (true);
        }

        // check exact matches
        if (policy[plural].exact[context[property]]) {
            return (true);
        }

        // check regexes
        return (policy[plural].regex.some(function (regex) {
            return (parseRegex(regex).test(context[property]));
        }));

    });

    if (!PAR) {
        return (false);
    }

    if (!policy.conditions) {
        return (policy.effect);
    }

    if (self.evaluateCondition(policy['conditions'], context.conditions)) {
        return (policy.effect);
    } else {
        return (false);
    }
};

Evaluator.prototype.evaluate = function evaluate(policies, context) {
    var self = this;
    function e(policy) {
        return (self.evaluateOne(policy, context));
    }

    if (!Array.isArray(policies)) {
        policies = [ policies ];
    }

    return (policies.some(e));
};

Evaluator.prototype.evaluateCondition =
    function evaluateCondition(policy, context) {

    var self = this;
    var op = policy[0];
    var lhs = policy[1];
    var rhs = policy[2];
    var i;

    if (op === 'and') {
        if (!self.evaluateCondition(lhs, context)) {
            return (false);
        }
        return (self.evaluateCondition(rhs, context));
    }

    if (op === 'or') {
        if (self.evaluateCondition(lhs, context)) {
            return (true);
        }
        return (self.evaluateCondition(rhs, context));
    }

    if (op === 'not') {
        return (!self.evaluateCondition(lhs, context));
    }

    if (op === 'in') {
        for (i = 0; i < rhs.length; i++) {
            if (self.evaluateCondition(['=', lhs, rhs[i]], context)) {
                return (true);
            }
        }
        return (false);
    }

    lhs.type = lhs.type || (self.typeTable && self.typeTable[lhs.name]);

    if (!lhs.type) {
        throw new errors.MissingTypeError('no type for "%s"', lhs.name);
    }

    if (!self.types[lhs.type]) {
        throw new errors.UnknownTypeError('unknown type "%s"', lhs.type);
    }

    if (typeof (self.types[lhs.type][op]) !== 'function') {
        throw new errors.UnsupportedOperationError('unsupported '+
            'operation "%s" on type "%s"', op, lhs.type);
    }

    if (!context[lhs.name]) {
        throw new errors.MissingConditionError(
            'missing condition in context: "%s"', lhs.name);
    }

    return (self.types[lhs.type][op](context[lhs.name], rhs));
};



module.exports = {
    Evaluator: Evaluator,

    createEvaluator: function createEvaluator(opts) {
        return (new Evaluator(opts));
    }
};
