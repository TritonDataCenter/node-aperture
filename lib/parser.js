var verror = require('verror');
var parser = require('./language').parser;

/**
 * There are three levels of type validation:
 * 1. No type validation.
 * 2. Validate typed conditions only and ignore untyped conditions.
 * 3. Validate typed conditions and lookup types for untyped conditions.
 *
 * To enable validation of explicitly typed conditions, pass in 'types'.
 * To enable type lookup, pass in 'types' and 'typeTable'.
 *
 * opts.types: mapping of type name to type object
 * opts.typeTable: mapping of condition name to type name
 */
var Parser = function (opts) {
    this.parser = new parser.Parser();

    if (!opts || !opts.types) {
        this.parser.yy.validate = function () {};
    } else {
        this.parser.yy.types = opts.types;
        this.parser.yy.typeTable = opts.typeTable;
        this.parser.yy.validate = function (op, name, value, type) {

            type = type || (this.typeTable && this.typeTable[name]);

            if (!type) {
                throw new verror.VError('no type for "%s"', name);
            }

            if (!this.types[type]) {
                throw new verror.VError('unknown type "%s"', type);
            }

            if (typeof (this.types[type][op]) !== 'function') {
                throw new verror.VError('unsupported operation ' +
                    '"%s" on type "%s"', op, type);
            }

            try {
                this.types[type].validate(value);
            } catch (e) {
                throw new verror.VError(e, 'unable to validate value ' +
                    '"%s" as type "%s"', value, type);
            }

            return (true);
        };
    }

};

Parser.prototype.parse = function (input) {
    try {
        return (this.parser.parse(input));
    } catch (e) {
        throw new verror.VError(e, 'parse error');
    }
};

module.exports = Parser;
