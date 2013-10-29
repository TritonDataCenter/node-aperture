var aperture = require('../');
var assert = require('assert-plus');

var apertureOpts = {
    types: aperture.types,
    typeTable: {
        dirname: 'string',
        sourceip: 'ip'
    }
};
var parser = aperture.createParser(apertureOpts);
var evaluator = aperture.createEvaluator(apertureOpts);

var text = [
    'Fred can read *.js when dirname = examples and sourceip = 10.0.0.0/8',
    'Bob can read and write timesheet if requesttime::time > 07:30:00 and ' +
        'requesttime::time < 18:30:00 and ' +
        'requesttime::day in (Mon, Tue, Wed, THu, Fri)',
    'John, Jack and Jane can ops_* *'
];

var policies = text.map(function (t) {
    return (parser.parse(t));
});

var context = {
    principal: 'Fred',
    action: 'read',
    resource: 'parser.example.js',
    conditions: {
        dirname: 'examples',
        sourceip: '10.0.0.1'
    }
};

assert.ok(evaluator.evaluate(policies, context));


context = {
    principal: 'Bob',
    action: 'read',
    resource: 'timesheet',
    conditions: {
        requesttime: new Date('2013-10-29T09:05:00'),
    }
};

assert.ok(evaluator.evaluate(policies, context));

context.conditions.requesttime = new Date('2013-10-27T08:00:00');

assert.ok(!evaluator.evaluate(policies, context));

context = {
    principal: 'Jack',
    action: 'ops_createVM',
    resource: '/some/machine/somewhere',
    conditions: {
        requesttime: new Date('2013-10-29T09:05:00'),
    }
};

assert.ok(evaluator.evaluate(policies, context));
