// Copyright (c) 2013, Joyent, Inc. All rights reserved.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

var Evaluator = require('../lib/evaluator.js').Evaluator;
var helper = require('./helper.js');

var test = helper.test;



test('basic allow', function (t) {
    var e = new Evaluator({
        types: {
            ip: {
                '=': function () {}
            }
        }
    });
    var policy = {
        principals: {'Fred': true},
        effect: true,
        actions: {'read': true },
        resources: {'foo': true }
    };
    var context = {
        principal: 'Fred',
        action: 'read',
        resource: 'foo'
    };
    var result = e.evaluate(policy, context);
    t.ok(result.effect === true);
    t.ok(result.audit.principal === true);
    t.ok(result.audit.action === true);
    t.ok(result.audit.resource === true);
    t.ok(result.audit.conditions === true);
    t.done();
});


test('principal mismatch', function (t) {
    var e = new Evaluator({
        types: {
            ip: {
                '=': function () {}
            }
        }
    });
    var policy = {
        principals: {'Fred': true},
        effect: true,
        actions: {'read': true },
        resources: {'foo': true }
    };
    var context = {
        principal: 'Bob',
        action: 'read',
        resource: 'foo'
    };
    var result = e.evaluate(policy, context);
    t.ok(result.effect === false);
    t.ok(result.audit.principal === false);
    t.equal(typeof (result.audit.action), 'undefined');
    t.equal(typeof (result.audit.resource), 'undefined');
    t.equal(typeof (result.audit.condition), 'undefined');
    t.done();
});


test('action mismatch', function (t) {
    var e = new Evaluator({
        types: {
            ip: {
                '=': function () {}
            }
        }
    });
    var policy = {
        principals: {'Fred': true},
        effect: true,
        actions: {'read': true },
        resources: {'foo': true }
    };
    var context = {
        principal: 'Fred',
        action: 'write',
        resource: 'foo'
    };
    var result = e.evaluate(policy, context);
    t.ok(result.effect === false);
    t.ok(result.audit.principal === true);
    t.ok(result.audit.action === false);
    t.equal(typeof (result.audit.resource), 'undefined');
    t.equal(typeof (result.audit.condition), 'undefined');
    t.done();
});


test('resource mismatch', function (t) {
    var e = new Evaluator({
        types: {
            ip: {
                '=': function () {}
            }
        }
    });
    var policy = {
        principals: {'Fred': true},
        effect: true,
        actions: {'read': true },
        resources: {'foo': true }
    };
    var context = {
        principal: 'Fred',
        action: 'read',
        resource: 'bar'
    };
    var result = e.evaluate(policy, context);
    t.ok(result.effect === false);
    t.ok(result.audit.principal === true);
    t.ok(result.audit.action === true);
    t.ok(result.audit.resource === false);
    t.equal(typeof (result.audit.condition), 'undefined');
    t.done();
});


test('conditions met', function (t) {
    var e = new Evaluator({
        types: {
            ip: {
                '=': function (l, r) { return (l === r); }
            }
        }
    });
    var policy = {
        principals: {'Fred': true},
        effect: true,
        actions: {'read': true },
        resources: {'foo': true },
        conditions: [ '=', {name: 'sourceip', type: 'ip'}, '0.0.0.0' ]
    };
    var context = {
        principal: 'Fred',
        action: 'read',
        resource: 'foo',
        conditions: {
            'sourceip': '0.0.0.0'
        }
    };
    var result = e.evaluate(policy, context);
    t.ok(result.effect === true);
    t.ok(result.audit.principal === true);
    t.ok(result.audit.action === true);
    t.ok(result.audit.resource === true);
    t.deepEqual(result.audit.conditions, {'sourceip': true});

    t.done();
});


test('conditions not met', function (t) {
    var e = new Evaluator({
        types: {
            ip: {
                '=': function (l, r) {return (l === r); }
            }
        }
    });
    var policy = {
        principals: {'Fred': true},
        effect: true,
        actions: {'read': true },
        resources: {'foo': true },
        conditions: [ '=', {name: 'sourceip', type: 'ip'}, '0.0.0.0' ]
    };
    var context = {
        principal: 'Fred',
        action: 'read',
        resource: 'foo',
        conditions: {
            'sourceip': '2.2.2.2'
        }
    };
    var result = e.evaluate(policy, context);
    t.ok(result.effect === false);
    t.ok(result.audit.principal === true);
    t.ok(result.audit.action === true);
    t.ok(result.audit.resource === true);
    t.deepEqual(result.audit.conditions, {'sourceip': false});

    t.done();
});


test('list', function (t) {
    var e = new Evaluator({
        types: {
            ip: {
                '=': function (l, r) {return (l === r); }
            }
        }
    });
    var policy = {
        principals: {'Fred': true},
        effect: true,
        actions: {'read': true },
        resources: {'foo': true },
        conditions: [ '=', {name: 'sourceip', type: 'ip'},
            ['0.0.0.0', '1.1.1.1']]
    };
    var context = {
        principal: 'Fred',
        action: 'read',
        resource: 'foo',
        conditions: {
            'sourceip': '2.2.2.2'
        }
    };
    var result = e.evaluate(policy, context);
    t.ok(result.effect === false);
    t.ok(result.audit.principal === true);
    t.ok(result.audit.action === true);
    t.ok(result.audit.resource === true);
    t.deepEqual(result.audit.conditions, {'sourceip': false});

    t.done();
});


test('list pass', function (t) {
    var e = new Evaluator({
        types: {
            ip: {
                '=': function (l, r) {return (l === r); }
            }
        }
    });
    var policy = {
        principals: {'Fred': true},
        effect: true,
        actions: {'read': true },
        resources: {'foo': true },
        conditions: [ 'in', {name: 'sourceip', type: 'ip'},
            ['0.0.0.0', '1.1.1.1']]
    };
    var context = {
        principal: 'Fred',
        action: 'read',
        resource: 'foo',
        conditions: {
            'sourceip': '1.1.1.1'
        }
    };
    var result = e.evaluate(policy, context);
    t.ok(result.effect === true);
    t.ok(result.audit.principal === true);
    t.ok(result.audit.action === true);
    t.ok(result.audit.resource === true);
    t.deepEqual(result.audit.conditions, {'sourceip': true});

    t.done();
});
