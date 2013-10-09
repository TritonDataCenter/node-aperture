var parser = require('./language').parser;

/*
 * There are three levels of type validation:
 * 1. No type validation.
 * 2. Validate typed conditions only and ignore untyped conditions.
 * 3. Validate typed conditions and lookup types for untyped conditions.
 *
 * To enable validation of explicitly typed conditions, pass in 'types'.
 * To enable type lookup, pass in 'typeTable'.
 */
var Parser = function (opts) {
    this.parser = new parser.Parser();
    if (typeof(opts.types) === 'undefined') {
        this.parser.yy.validate = function () { return (true); };
    } else {
        this.parser.yy.types = opts.types;
        this.parser.yy.typeTable = opts.typeTable;
        this.parser.yy.validate = function (op, name, value, type) {

            type = type || (this.typeTable && this.typeTable[name]);
            if (typeof (this['types'][type]) === 'undefined') {
                throw new Error('UnknownTypeParseError');
            }

            if (typeof (this['types'][type][op]) === 'undefined') {
                throw new Error('UnsupportedOperationParseError');
            }

            try {
                this['types'][type].validate(value);
            } catch (e) {
                throw new Error('ValidationParseError', e);
            }

            return (true);
        };
    }
};

Parser.prototype.parse = function (input) {
    return (this.parser.parse(input));
};

module.exports = Parser;
