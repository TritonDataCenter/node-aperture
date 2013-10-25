// Copyright 2013 Joyent, Inc.  All rights reserved.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

var util = require('util');

var assert = require('assert-plus');
var WError = require('verror').WError;

function ApertureError(cause, message) {
    var off = 0;
    if (cause instanceof Error) {
        off = 1;
    }

    var args = Array.prototype.slice.call(arguments, off);
    args.unshift({
        cause: off ? cause : undefined,
        constructorOpt: ApertureError
    });
    WError.apply(this, args);
}
util.inherits(ApertureError, WError);
ApertureError.prototype.name = 'ApertureError';


function MissingTypeError(cause, message) {
    ApertureError.apply(this, arguments);
}
util.inherits(MissingTypeError, ApertureError);
MissingTypeError.prototype.name = 'MissingTypeError';


function UnknownTypeError(cause, message) {
    ApertureError.apply(this, arguments);
}
util.inherits(UnknownTypeError, ApertureError);
UnknownTypeError.prototype.name = 'UnknownTypeError';


function UnsupportedOperationError(cause, message) {
    ApertureError.apply(this, arguments);
}
util.inherits(UnsupportedOperationError, ApertureError);
UnsupportedOperationError.prototype.name = 'UnsupportedOperationError';


function ValidationError(cause, message) {
    ApertureError.apply(this, arguments);
}
util.inherits(ValidationError, ApertureError);
ValidationError.prototype.name = 'ValidationError';


function MissingConditionError(cause, message) {
    ApertureError.apply(this, arguments);
}
util.inherits(MissingConditionError, ApertureError);
MissingConditionError.prototype.name = 'MissingConditionError';


module.exports = {
    ApertureError: ApertureError,
    MissingTypeError: MissingTypeError,
    UnknownTypeError: UnknownTypeError,
    UnsupportedOperationError: UnsupportedOperationError,
    ValidationError: ValidationError,
    MissingConditionError: MissingConditionError
};
