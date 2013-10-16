// Copyright (c) 2013, Joyent, Inc. All rights reserved.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

var parser = require('../gen/language.js').parser;
var verror = require('verror');



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
        };
    }

}

Parser.prototype.parse = function parse(input) {
    try {
        return (this.parser.parse(input));
    } catch (e) {
        throw new verror.VError(e, 'parse error');
    }
};



module.exports = {
    Parser: Parser,

    createParser: function createParser(opts) {
        return (new Parser(opts));
    }
};
