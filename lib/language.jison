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
    : list effect list list if conditions EOF
        {
            return {
                principals: $1,
                effect: $2,
                actions: $3,
                resources: $4,
                conditions: $6
            };
        }
    | list effect list list EOF
        {
            return {
                principals: $1,
                effect: $2,
                actions: $3,
                resources: $4
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
        { $3[$1] = true; $$ = $3; }
    ;



effect
    : CAN
        { $$ = true; }
    | CAN NOT
        { $$ = false; }
    ;



conditions
    : or_con
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
    : string '::' string string string
        {
            var name = $1;
            var type = $3;
            var op = $4;
            var value = $5;

            yy.validate(op, name, value, type);
            $$ = [ op, { name: name, type: type }, value ];
        }
    | string string string
        {
            var name = $1;
            var op = $2;
            var value = $3;

            yy.validate(op, name, value);
            $$ = [ op, { name: name }, value ];
        }
    | '(' conditions ')'
        { $$ = $2 }
    ;
