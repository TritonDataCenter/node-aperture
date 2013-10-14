// Copyright (c) 2013, Joyent, Inc. All rights reserved.
var verror = require('verror');
var assert = require('assert-plus');

var Evaluator = function (opts) {
    assert.object(opts, 'opts');
    assert.object(opts.types, 'opts.types');
    assert.optionalObject(opts.typeTable, 'opts.typeTable');

    this.types = opts.types;
    this.typeTable = opts.typeTable;
};

Evaluator.prototype.evaluate = function (policy, context) {
    var self = this;
    var result = {
        effect: false,
        audit: {}
    };
    var audit = result.audit;

    var PAR = ['principal', 'action', 'resource'].every(function (property) {
        var plural = property + 's';
        if (policy[plural] && !policy[plural][context[property]]) {
            audit[property] = false;
            return (false);
        } else {
            audit[property] = true;
            return (true);
        }
    });

    if (!PAR) {
        return (result);
    }

    if (!policy.conditions) {
        audit.conditions = true;
        result.effect = policy.effect;
        return (result);
    }

    audit.conditions = {};
    if (self.evaluateCondition(policy['conditions'],
        context.conditions, audit.conditions)) {

        result.effect = policy.effect;
    }

    return (result);
};

Evaluator.prototype.evaluateCondition = function (policy, context, audit) {
    var self = this;
    var op = policy[0];
    var lhs = policy[1];
    var rhs = policy[2];

    if (op === 'and') {
        if (!self.evaluateCondition(lhs, context, audit)) {
            return (false);
        }
        return (self.evaluateCondition(rhs, context, audit));
    }

    if (op === 'or') {
        if (self.evaluateCondition(lhs, context, audit)) {
            return (true);
        }
        return (self.evaluateCondition(rhs, context, audit));
    }

    if (op === 'not') {
        return (!self.evaluateCondition(lhs, context, audit));
    }

    lhs.type = lhs.type || (self.typeTable && self.typeTable[lhs.name]);

    if (!lhs.type) {
        throw new verror.VError('no type for "%s"', lhs.name);
    }

    if (!self.types[lhs.type]) {
        throw new verror.VError('unknown type "%s"', lhs.type);
    }

    if (typeof (self.types[lhs.type][op]) !== 'function') {
        throw new verror.VError('unsupported operation ' +
            '"%s" on type "%s"', op, lhs.type);
    }

    if (!context[lhs.name]) {
        throw new verror.VError('missing context "%s"', lhs.name);
    }

    audit[lhs.name] = self.types[lhs.type][op](context[lhs.name], rhs);
    return (audit[lhs.name]);
};

module.exports = Evaluator;
