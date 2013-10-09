var Evaluator = function (opts) {
    this.types = opts.types;
    this.typeTable = opts.typeTable;
};

Evaluator.prototype.evaluate = function (policy, context) {
    var self = this;
    var principal = context['principal'];
    var action = context['action'];
    var resource = context['resource'];
    var conditions = context['conditions'];
    var audit = {};

    if (typeof (policy['principals']) !== 'undefined' &&
        typeof (policy['principals'][principal]) === 'undefined') {

        return (false);
    }

    audit['principal'] = true;

    if (typeof (policy['actions']) !== 'undefined' &&
        typeof (policy['actions'][action]) === 'undefined') {

        return (false);
    }

    audit['action'] = true;

    if (typeof (policy['resources']) !== 'undefined' &&
        typeof (policy['resources'][resource]) === 'undefined') {

        return (false);
    }

    audit['resource'] = true;

    if (typeof (policy['conditions']) === 'undefined') {
        return (true);
    }


    return (self.evaluateCondition(policy['conditions'], conditions));
};

Evaluator.prototype.evaluateCondition = function (policy, context) {
    var self = this;
    var op = policy[0];
    var lhs = policy[1];
    var rhs = policy[2];

    if (op === 'and') {
        if (!self.evaluateCondition(lhs)) {
            return (false);
        }
        return (self.evaluateCondition(rhs));
    }

    if (op === 'or') {
        if (self.evaluateCondition(lhs)) {
            return (true);
        }
        return (self.evaluateCondition(rhs));
    }

    if (op === 'not') {
        return (!self.evaluateCondition(lhs));
    }

    lhs.type = lhs.type || (self.typeTable && self.typeTable[lhs.name]);
    if (typeof (lhs.type) === 'undefined') {
        throw new Error('TypeNotFoundForConditionName');
    }

    if (typeof (self.types[lhs.type]) === 'undefined') {
        throw new Error('UnknownTypeEvaluationError');
    }

    if (typeof (self.types[lhs.type][op]) === 'undefined') {
        throw new Error('UnsupportedOperationEvaluationError');
    }

    if (typeof (context[lhs.name]) === 'undefined') {
        throw new Error('MissingContextEvaluationError');
    }

    return (self.types[lhs.type][op](context[lhs.name], rhs));
}

module.exports = Evaluator;
