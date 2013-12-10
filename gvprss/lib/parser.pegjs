
//////////////////////////////////////////////////////////////////////
// ROOT
//////////////////////////////////////////////////////////////////////

start
  = selector_action+

//////////////////////////////////////////////////////////////////////
// CHARACTER PRIMITIVES
//////////////////////////////////////////////////////////////////////
letter "letter"         = [a-z]i
digit "digit"           = [0-9]
whitespace "whitespace" = [ \t\n\r\f\l]
decimal_point "."       = "."
underscore "_"          = "_"
hyphen "-"              = "-"
hash "#"                = "#"
dot "."                 = "."
caret "^"               = "^"
star "*"                = "*"
tilde "~"               = "~"
dollar "$"              = "$"
eq "="                  = "="
bang "!"                = "!"

//////////////////////////////////////////////////////////////////////
// CHARACTER GROUPS
//////////////////////////////////////////////////////////////////////
operator
  = eq eq     { return "==" }
  / caret eq  { return "^=" }
  / star eq   { return "*=" }
  / tilde eq  { return "~=" }
  / dollar eq { return "$=" }
  / bang eq   { return "!=" }
  / eq        { return "=" }

not_quote_or_slash "neither quote nor slash"
  = [^\"\\]

escaped_char "escaped char"
  = "\\" c:[^tnrfl] { return c; }
  / "\\n" { return "\n" }
  / "\\t" { return "\t" }
  / "\\f" { return "\f" }
  / "\\r" { return "\r" }
  / "\\l" { return "\l" }

alphanumeric_char "alphanumeric character"
  = letter
  / digit
  / underscore

word_char "word character"
  = alphanumeric_char
  / hyphen

string_char "string character"
  = not_quote_or_slash
  / escaped_char

//////////////////////////////////////////////////////////////////////
// DATA TYPES
//////////////////////////////////////////////////////////////////////

string "string"
  = "\"" str:string_char* "\"" { return str.join(""); }

integer "integer"
  = digits:digit+ { return parseInt(digits.join("")); }

float "float"
  = before:digit* decimal_point after:digit*  { return parseFloat(before.join("")+"."+after.join("")); }

//////////////////////////////////////////////////////////////////////
// IDENTIFIERS
//////////////////////////////////////////////////////////////////////

word "word"
  = w:word_char+ { return w.join(""); }

alphanumeric_id "alphanumeric identifier"
  = first:letter rest:alphanumeric_char* { return first+rest.join("") }

numeric_id "numeric identifier"
  = digits:digit+  { return digits.join("") }
  / before:digit* decimal_point after:digit*  { return before.join("")+"."+after.join("") }

quoted_id "quoted identifier" = str:string { return str }

identifier "identifier"
  = alphanumeric_id
  / numeric_id
  / quoted_id

//////////////////////////////////////////////////////////////////////
// SELECTORS
//////////////////////////////////////////////////////////////////////

node_selector  "N" = "N" { return "node"  }
edge_selector  "E" = "E" { return "edge"  }
graph_selector "G" = "G" { return "graph" }

id_selector "id selector"
  = hash id:identifier { return {left:"name",operator:"nonattr-equals",right:id } }

class_selector "class selector"
  = dot name:identifier { return {left:"class",operator:"~=",right:name } }

rval
  = word
  / string
  / integer
  / float

attr_selector "attribute selector"
  = "[" name:word "]" { return {left:name,operator:"exists"} }
  / "[" left:word op:operator right:rval "]" { return {left:left,operator:op,right:right } }

type_selector
  = node_selector
  / edge_selector
  / graph_selector

other_selector
  = id_selector
  / class_selector
  / attr_selector

selector_list
 = whitespace* type:type_selector? whitespace* selectors:other_selector_space* {
     if(type == '') { type = null; }
     if(selectors.length == 0) { selectors = null; }
     return {type:type,conditions:selectors};
   }

other_selector_space
  = whitespace* sel:other_selector whitespace* { return sel; }

//////////////////////////////////////////////////////////////////////
// ACTIONS
//////////////////////////////////////////////////////////////////////

action
  = "{" body:action_body_text* "}" { return "{"+body.join("")+"}" }

action_body_text
  = "{" t:action_body_text* "}" { return "{"+t.join("")+"}" } // a matched-curly-braced expression
  / s:string { return "\""+s+"\"" }  // or a quoted string (which might include mis-matched curly braces
  / t:[^{}\"]+ { return t.join("") }                            // or any other sequence of non-curly-brace characters

//////////////////////////////////////////////////////////////////////
// SELECTOR+ACTIONS
//////////////////////////////////////////////////////////////////////

selector_action
  = s:selector_list a:action whitespace* { s.action = a; return s }
