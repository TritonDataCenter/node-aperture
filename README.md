# Aperture

Aperture is an access control system with a flexible, human-readable policy
language, a parser that translates the language into serializable JSON format,
and an evaluator that evaluates policies and a request's context to determine
whether to allow or deny.

    var aperture = require('aperture');
    var parser = aperture.createParser({
        types: aperture.types,
        typeTable: {
            sourceip: 'ip',
        }
    });

    var policy = parser.parse('Fred can read *.js when sourceip = 10.0.0.0/8');

    var evaluator = aperture.createEvaluator({
        types: aperture.types,
        typeTable: {
            sourceip: 'ip',
        }
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

    var result = evaluator.evaluate(policy, context); // true

## Usage

### Parser


### Evaluator


## Policy Language

Write policies in subject-verb-object sentences, where subjects = principals,
actions = verbs, object = resources and other conditions follow as a phrase.
Language keywords (`if`, `CAN`, All``, etc.) and condition operators (`AND`,
`=`, `Like`, etc.) are case-insensitive. Identifiers, including condition names,
type names, principals, actions, and resources are case-sensitive.

The basic format is <principals> CAN <actions> <resources> WHEN <conditions>.
Conditions are optional. For policies with implied principals or resources,
leave off those parts. The word starting the conditions clause can be `when`,
`if` , or `where`.

* `Fred can read`
* `Fred can read /foo/bar when someCondition = 3`
* `Fred can read where someCondition = 3`
* `Can read if someCondition = 3`

### Principals, actions and resources

Principals, actions and resources can all be a single identifier or a list:

* `Fred`
* `Fred and Bob`
* `Fred, George and Bob`
* `Fred, George, and Bob`

The language supports exact strings, fuzzy strings, and regular expressions for
principal, action, and resource identifiers.

Exact strings need to be surrounded by double quotes only if they contain a
`::`, `(`, `)`, `,`, or whitespace, or match a reserved word (in a
case-insensitive match).

You can use the `*` operator to create fuzzy matches. This is equivalent to a
`.*` in a regular expression. Escape asterisks with `\*`.

* `ops_*`
* `*.js`
* `Ra*chel`
* `\*Nsync`

To specify a regular expression, append `::regex` or `::regexp` to a Javascript
regular expression literal.

* `/2013-0[1-6]-[0-3][0-9].log/::regex`
* `/fred(dy)?/i::regex`
* `/Ashl(y|ey|i|ie|ee|iy|eigh)/::regexp`

### Conditions

The conditions clause consists of a single expressions that will evaluate to
either true or false based on the context of a request. A basic condition has a
condition name, a type name, an operator, and a value. The condition name
should match the condition name as passed in as context when evaluating. The
type name is used to determine what logic should be used to compare values. 

* `sourceip::ip = 10.0.0.1`
* `statuscode::number > 200`

Operators can be any string but must be an operator that the type supports (and
are case-insensitive).

* `dirname::string like /ops_.*/i`

You can choose to leave off the type if you plan to use a type lookup table.
However, an explicit type will preempt any type lookups.

* `sourceip = 10.0.0.1`
* `statuscode > 200`

Join conditions together with `and` or `or`. Negate conditions with `not`.
Group conditions with parentheses.

* `sourceip = 10.0.0.1 OR sourceip = 192.168.1.1`
* `time > 09:00:00 OR (day > Monday AND day < Friday)`
* `NOT geoip from "North Korea"`

### Quoting

Principal, action, and resource identifiers, condition names, type names,
operators and values all do not need to be quoted unless they contain a `::`,
`(`, `)`, `,`, or whitespace, or match a reserved word (in a case-insensitive
match).

* `"Can" can read`
* `"spid::::er-eyes" can see`
* `"Sir Patrick" can act`
* `sourceip::ip = "2001:db8::ff00:42:8329"`

Identifiers with `::regex` never need to be quoted.

* `/double::colons/::regex`
