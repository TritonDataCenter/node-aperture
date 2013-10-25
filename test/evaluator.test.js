// Copyright (c) 2013, Joyent, Inc. All rights reserved.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

var Evaluator = require('../lib/evaluator.js').Evaluator;
var errors = require('../lib/errors.js');
var test = require('tap').test;



test('basic allow', function (t) {
    var e = new Evaluator({
        types: {
            ip: {
                '=': function () {}
            }
        }
    });
    var policy = {
        principals: {
            regex: [],
            exact: {
                'Fred': true
            }
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true
            }
        }
    };
    var context = {
        principal: 'Fred',
        action: 'read',
        resource: 'foo'
    };
    t.ok(e.evaluate(policy, context));
    t.end();
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
        principals: {
            regex: [],
            exact: {
                'Fred': true
            }
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true
            }
        }
    };
    var context = {
        principal: 'Bob',
        action: 'read',
        resource: 'foo'
    };
    t.notOk(e.evaluate(policy, context));
    t.end();
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
        principals: {
            regex: [],
            exact: {
                'Fred': true
            }
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true
            }
        }
    };
    var context = {
        principal: 'Fred',
        action: 'write',
        resource: 'foo'
    };
    t.notOk(e.evaluate(policy, context));
    t.end();
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
        principals: {
            regex: [],
            exact: {
                'Fred': true
            }
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true
            }
        }
    };
    var context = {
        principal: 'Fred',
        action: 'read',
        resource: 'bar'
    };
    t.notOk(e.evaluate(policy, context));
    t.end();
});


test('missing action', function (t) {
    var e = new Evaluator({
        types: {
            ip: {
                '=': function () {}
            }
        }
    });
    var policy = {
        principals: {
            regex: [],
            exact: {
                'Fred': true
            }
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true
            }
        }
    };
    var context = {
        principal: 'Fred',
        resource: 'bar'
    };
    t.notOk(e.evaluate(policy, context));
    t.end();

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
        principals: {
            regex: [],
            exact: {
                'Fred': true
            }
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true
            }
        },
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
    t.ok(e.evaluate(policy, context));
    t.end();
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
        principals: {
            regex: [],
            exact: {
                'Fred': true
            }
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true
            }
        },
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
    t.notOk(e.evaluate(policy, context));
    t.end();
});

test('missing condition', function (t) {
    var e = new Evaluator({
        types: {
            ip: {
                '=': function (l, r) {return (l === r); }
            }
        }
    });
    var policy = {
        principals: {
            regex: [],
            exact: {
                'Fred': true
            }
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true
            }
        },
        conditions: [ '=', {name: 'sourceip', type: 'ip'}, '0.0.0.0' ]
    };
    var context = {
        principal: 'Fred',
        action: 'read',
        resource: 'foo',
        conditions: {}
    };
    t.throws(function () {
        e.evaluate(policy, context);
    }, new errors.MissingConditionError(
        'missing condition in context: "sourceip"'));

    t.end();
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
        principals: {
            regex: [],
            exact: {
                'Fred': true
            }
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true
            }
        },
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
    t.notOk(e.evaluate(policy, context));
    t.end();
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
        principals: {
            regex: [],
            exact: {
                'Fred': true
            }
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true
            }
        },
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
    t.ok(e.evaluate(policy, context));
    t.end();
});

test('regex', function (t) {
    var e = new Evaluator({
        types: {
            ip: {
                '=': function () {}
            }
        }
    });
    var policy = {
        principals: {
            regex: ['/Fre?d/'],
            exact: {}
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true
            }
        }
    };
    var context = {
        principal: 'Fred',
        action: 'read',
        resource: 'foo'
    };
    t.ok(e.evaluate(policy, context));
    t.end();
});

test('regex fail', function (t) {
    var e = new Evaluator({
        types: {
            ip: {
                '=': function () {}
            }
        }
    });
    var policy = {
        principals: {
            regex: ['/Fre?d/'],
            exact: {}
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true
            }
        }
    };
    var context = {
        principal: 'Bob',
        action: 'read',
        resource: 'foo'
    };
    t.notOk(e.evaluate(policy, context));
    t.end();
});

test('many regexes', function (t) {
    var e = new Evaluator({
        types: {
            ip: {
                '=': function () {}
            }
        }
    });
    var policy = {
        principals: {
            regex: ['/Fre?d/', '/asdf.*/', '/Bob/i'],
            exact: {}
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true
            }
        }
    };
    var context = {
        principal: 'bob',
        action: 'read',
        resource: 'foo'
    };
    t.ok(e.evaluate(policy, context));
    t.end();
});

test('many regexes fail', function (t) {
    var e = new Evaluator({
        types: {
            ip: {
                '=': function () {}
            }
        }
    });
    var policy = {
        principals: {
            regex: ['/Fre?d/', '/asdf.*/', '/Bill/i'],
            exact: {}
        },
        effect: true,
        actions: {
            regex: [],
            exact: {
                'read': true
            }
        },
        resources: {
            regex: [],
            exact: {
                'foo': true
            }
        }
    };
    var context = {
        principal: 'Bob',
        action: 'read',
        resource: 'foo'
    };
    t.notOk(e.evaluate(policy, context));
    t.end();
});
