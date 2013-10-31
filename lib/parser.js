// Copyright (c) 2013, Joyent, Inc. All rights reserved.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

var parser = require('../gen/language.js').parser;
var errors = require('./errors.js');



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
function Parser(opts) {
    this.parser = new parser.Parser();

    if (!opts || !opts.types) {
        this.parser.yy.validate = function () {};
    } else {
        this.parser.yy.types = opts.types;
        this.parser.yy.typeTable = opts.typeTable;
        this.parser.yy.validate = function (op, name, value, type) {

            type = type || (this.typeTable && this.typeTable[name]);

            if (!type) {
                throw new errors.MissingTypeError('no type for "%s"', name);
            }

            if (!this.types[type]) {
                throw new errors.UnknownTypeError('unknown type "%s"', type);
            }

            if (typeof (this.types[type][op]) !== 'function') {
                throw new errors.UnsupportedOperationError('unsupported '+
                    'operation "%s" on type "%s"', op, type);
            }

            try {
                this.types[type].validate(value, op);
            } catch (e) {
                throw new errors.ValidationError(e, 'unable to ' +
                    'validate value "%s" as type "%s"', value, type);
            }
        };
    }

}


Parser.prototype.parse = function parse(input) {
    return (this.parser.parse(input));
};



module.exports = {
    Parser: Parser,

    createParser: function createParser(opts) {
        return (new Parser(opts));
    }
};
