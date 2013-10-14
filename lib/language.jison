// Copyright (c) 2013, Joyent, Inc. All rights reserved.
 %lex

digit           [0-9]
stresc          "\\"

%options case-insensitive

%%

\s+             /* skip whitespace */
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
"*"             return '*';

"IN"            return 'IN';

"::"            return '::';
","             return ',';
"("             return '(';
")"             return ')';

\"(?:{stresc}["bfnrt/{stresc}]|{stresc}"u"[a-fA-F0-9]{4}|[^"{stresc}])*\"
    {
        yytext = yytext.substr(1,yyleng-2);
        return 'STRING_LITERAL';
    }

([^\s,():](\:(?!\:))?)+ return 'STRING';

/lex


%start rule

%%

all
    : ALL
    | EVERYTHING
    | ANYTHING
    | '*'
    ;

if
    : IF
    | WHEN
    | WHERE
    ;

string
    : STRING
    | STRING_LITERAL
    ;

rule
    : list effect list list conditions EOF
        {
            return {
                principals: $1,
                effect: $2,
                actions: $3,
                resources: $4,
                conditions: $5
            };
        }
    | list effect list conditions EOF // implied resources
        {
            return {
                principals: $1,
                effect: $2,
                actions: $3,
                resources: undefined,
                conditions: $4
            };
        }
    | effect list list conditions EOF // implied principals
        {
            return {
                principals: undefined,
                effect: $1,
                actions: $2,
                resources: $3,
                conditions: $4
            };
        }
    | effect list conditions EOF // implied principals and resources
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



list
    : string
        {
            $$ = {};
            $$[$1] = true;
        }
    | string AND string
        {
            $$ = {};
            $$[$1] = true;
            $$[$3] = true;
        }
    | long_list
    ;

long_list
    : string ',' string ',' AND string
        {
            $$ = {};
            $$[$1] = true;
            $$[$3] = true;
            $$[$6] = true;
        }
    | string ',' long_list
        {
            $3[$1] = true;
            $$ = $3;
        }
    ;



effect
    : CAN
        {
            $$ = true;
        }
    | CAN NOT
        {
            $$ = false;
        }
    ;



conditions
    : if or_con
        {
            $$ = $2;
        }
    | // conditions can be empty
    ;

or_con
    : or_con OR and_con
        {
            $$ = ['or', $1, $3];
        }
    | and_con
    ;

and_con
    : and_con AND unary_con
        {
            $$ = ['and', $1, $3];
        }
    | unary_con
    ;

unary_con
    : NOT unary_con
        {
            $$ = ['not', $2];
        }
    | condition
    ;


condition
    : lhs op rhs
        {
            var lhs = $1;
            var op = $2;
            var rhs = $3;
            yy.validate(op, lhs.name, rhs, lhs.type);
            $$ = [ op, lhs, rhs ];
        }
    | lhs IN rhs
        {
            var lhs = $1;
            var op = '=';
            var rhs = $3;
            rhs.forEach(function (i) {
                yy.validate(op, lhs.name, i, lhs.type);
            });
            $$ = [ op, lhs, rhs ];
        }
    | '(' or_con ')'
        {
            $$ = $2;
        }
    ;

lhs
    : string '::' string
        {
            $$ = {name: $1, type: $3};
        }
    | string
        {
            $$ = {name: $1};
        }
    ;

op
    : string
    ;

rhs
    : string
    | '(' comma_separated_list ')'
        {
            $$ = $2;
        }
    ;

comma_separated_list
    : string
        {
            $$ = [ $1 ];
        }
    | comma_separated_list ',' string
        {
            $1.push($3);
            $$ = $1;
        }
    ;
