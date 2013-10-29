module.exports = {
    Parser: require('./lib/parser.js').Parser,
    createParser: require('./lib/parser.js').createParser,
    Evaluator: require('./lib/evaluator.js').Evaluator,
    createEvaluator: require('./lib/evaluator.js').createEvaluator,
    types: require('./types')
};
