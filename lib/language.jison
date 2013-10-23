// Copyright (c) 2013, Joyent, Inc. All rights reserved.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

%lex

// define regular expressions to be referenced in the next section
esc          "\\"

// https://github.com/cjihrig/jsparser
RegularExpressionNonTerminator [^\n\r]
RegularExpressionBackslashSequence \\{RegularExpressionNonTerminator}
RegularExpressionClassChar [^\n\r\]\\]|{RegularExpressionBackslashSequence}
RegularExpressionClass \[{RegularExpressionClassChar}*\]
RegularExpressionFlags [a-z]*
RegularExpressionFirstChar ([^\n\r\*\\\/\[])|{RegularExpressionBackslashSequence}|{RegularExpressionClass}
RegularExpressionChar ([^\n\r\\\/\[])|{RegularExpressionBackslashSequence}|{RegularExpressionClass}
RegularExpressionBody {RegularExpressionFirstChar}{RegularExpressionChar}*
RegularExpressionLiteral \/{RegularExpressionBody}\/{RegularExpressionFlags}

%options case-insensitive

%%

\s+             /* skip whritespace */
<<EOF>>         return 'EOF';

"AND"           return 'AND';
"OR"            return 'OR';
"NOT"           return 'NOT';

"CAN"           return 'CAN';
"ON"            return 'ON';
"TO"            return 'TO';

"IF"            return 'IF';
"WHEN"          return 'WHEN';
"WHERE"         return 'WHERE';

"DO"            return 'DO';
"ALL"           return 'ALL';
"EVERYTHING"    return 'EVERYTHING';
"ANYTHING"      return 'ANYTHING';

"IN"            return 'IN';

"::"            return '::';
","             return ',';
"("             return '(';
")"             return ')';


// /RegexBody/flags::regex
{RegularExpressionLiteral}"::regex"p?
    {
        yytext = yytext.substr(0, yytext.lastIndexOf('::'));
        return "REGEX_LITERAL";
    }


// string enclosed in quotes
\"(?:{esc}["bfnrt/{esc}]|{esc}"u"[a-fA-F0-9]{4}|[^"{esc}])*\"
    {
        yytext = yytext.substr(1,yyleng-2);
        return 'STRING_LITERAL';
    }


// any string without parens or commas or double colon ('::')
([^\s,():](\:(?!\:))?)+
    {
        if (yytext === '*') {
            return '*';
        } else if (yytext.match(/[*]/)) {
            return 'FUZZY_STRING';
        } else {
            return 'STRING';
        }
    }

/lex


%start Rule

%%

Rule
    : List Effect List List Conditions EOF
        {
            return {
                principals: $1,
                effect: $2,
                actions: $3,
                resources: $4,
                conditions: $5
            };
        }
    | List Effect List Conditions EOF // implied resources
        {
            return {
                principals: $1,
                effect: $2,
                actions: $3,
                resources: undefined,
                conditions: $4
            };
        }
    | Effect List List Conditions EOF // implied principals
        {
            return {
                principals: undefined,
                effect: $1,
                actions: $2,
                resources: $3,
                conditions: $4
            };
        }
    | Effect List Conditions EOF // implied principals and resources
        {
            return {
                principals: undefined,
                effect: $1,
                actions: $2,
                resources: undefined,
                conditions: $3
            };
        }
    ;


// English lists:
// foo
// foo and bar
// foo, bar, and baz <-- serial or "Oxford" comma
// foo, bar and baz <-- no serial comma
List
    : Identifier
        {
            $$ = {
                exact: {},
                regex: []
            };

            if ($1 instanceof RegExp) {
                $$.regex.push($1.toString());
            } else {
                $$.exact[$1] = true;
            }
        }
    | Identifier AND Identifier
        {
            $$ = {
                exact: {},
                regex: []
            };

            if ($1 instanceof RegExp) {
                $$.regex.push($1.toString());
            } else {
                $$.exact[$1] = true;
            }

            if ($3 instanceof RegExp) {
                $$.regex.push($3.toString());
            } else {
                $$.exact[$3] = true;
            }
        }
    | LongList
    ;

LongList
    : Identifier ',' Identifier ',' AND Identifier // serial comma
        {
            $$ = {
                exact: {},
                regex: []
            };

            if ($1 instanceof RegExp) {
                $$.regex.push($1.toString());
            } else {
                $$.exact[$1] = true;
            }

            if ($3 instanceof RegExp) {
                $$.regex.push($3.toString());
            } else {
                $$.exact[$3] = true;
            }

            if ($6 instanceof RegExp) {
                $$.regex.push($6.toString());
            } else {
                $$.exact[$6] = true;
            }
        }
    | Identifier ',' Identifier AND Identifier // no serial comma
        {
            $$ = {
                exact: {},
                regex: []
            };

            if ($1 instanceof RegExp) {
                $$.regex.push($1.toString());
            } else {
                $$.exact[$1] = true;
            }

            if ($3 instanceof RegExp) {
                $$.regex.push($3.toString());
            } else {
                $$.exact[$3] = true;
            }

            if ($5 instanceof RegExp) {
                $$.regex.push($5.toString());
            } else {
                $$.exact[$5] = true;
            }
        }
    | Identifier ',' LongList
        {
            if ($1 instanceof RegExp) {
                $3.regex.push($1.toString());
            } else {
                $3.exact[$1] = true;
            }
            $$ = $3;
        }
    ;


Effect
    : CAN
        {
            $$ = true;
        }
    | CAN NOT
        {
            $$ = false;
        }
    ;


Conditions
    : If OrCondition
        {
            $$ = $2;
        }
    | // conditions can be empty
    ;

If
    : IF
    | WHEN
    | WHERE
    ;

OrCondition
    : OrCondition OR AndCondition
        {
            $$ = ['or', $1, $3];
        }
    | AndCondition
    ;

AndCondition
    : AndCondition AND NotCondition
        {
            $$ = ['and', $1, $3];
        }
    | NotCondition
    ;

NotCondition
    : NOT NotCondition
        {
            $$ = ['not', $2];
        }
    | Condition
    ;

Condition
    : Lhs String String
        {
            var lhs = $1;
            var op = $2;
            var rhs = $3;
            yy.validate(op, lhs.name, rhs, lhs.type);
            $$ = [ op, lhs, rhs ];
        }
    | Lhs IN '(' CommaSeparatedList ')'
        {
            var lhs = $1;
            var op = $2;
            var rhs = $4;
            rhs.forEach(function (i) {
                yy.validate(op, lhs.name, i, lhs.type);
            });
            $$ = [ op, lhs, rhs ];
        }
    | '(' OrCondition ')'
        {
            $$ = $2;
        }
    ;

Lhs
    : String '::' String // with type
        {
            $$ = {name: $1, type: $3};
        }
    | String // no type
        {
            $$ = {name: $1};
        }
    ;

// Simple list
// foo
// foo, bar
// foo, bar, baz
CommaSeparatedList
    : String
        {
            $$ = [ $1 ];
        }
    | CommaSeparatedList ',' String
        {
            $1.push($3);
            $$ = $1;
        }
    ;

// Identifiers used for principals, actions, or resources
Identifier
    : STRING
    | STRING_LITERAL
    | FUZZY_STRING
        {
            $$ = new RegExp($1.replace('*', '.*'));
        }
    | REGEX_LITERAL
        {
            var literal = $1;
            var last = literal.lastIndexOf("/");
            var body = literal.substring(1, last);
            var flags = literal.substring(last + 1);
            $$ = new RegExp(body, flags);
        }
    | All
        {
            $$ = 1;
        }
    ;


All
    : ALL
    | EVERYTHING
    | ANYTHING
    | '*'
    ;

String
    : STRING
    | STRING_LITERAL
    ;
