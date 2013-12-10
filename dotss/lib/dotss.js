var path            = require('path');
var fs              = require('fs');
var HOMEDIR         = path.join(__dirname,'..');
var IS_INSTRUMENTED = fs.existsSync(path.join(HOMEDIR,'lib-cov'));
var LIB_DIR         = (IS_INSTRUMENTED) ? path.join(HOMEDIR,'lib-cov') : path.join(HOMEDIR,'lib');
var parser          = require(path.join(LIB_DIR,'/parser'));

function trim(str) {
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function escape(str) {
  if(typeof str != 'string') {
    str = ""+str;
  }
  return JSON.stringify(str);
}

function ss2gvpr(rules) {
  var buffer = "";
  rules.forEach(function(rule) {
    var conditions = []
    rule.conditions.forEach(function(condition) {
      switch(condition.operator) {
        case "==":
        case "=":
          conditions.push("attr_equals($,"+escape(condition.left)+","+escape(condition.right)+")");
          break;
        case "~=":
          conditions.push("attrlist_includes($,"+escape(condition.left)+","+escape(condition.right)+")");
          break;
        case "*=":
          conditions.push("attr_contains($,"+escape(condition.left)+","+escape(condition.right)+")");
          break;
        case "^=":
          conditions.push("attr_starts_with($,"+escape(condition.left)+","+escape(condition.right)+")");
          break;
        case "$=":
          conditions.push("attr_starts_ends($,"+escape(condition.left)+","+escape(condition.right)+")");
          break;
        case "exists":
          conditions.push("has_attr($,"+escape(condition.left)+")");
          break;
      }
    });
    var code = ""
    if(conditions.length > 0) {
      code += "{";
      code += "if(" + conditions.join(" && ") + ") ";
      code += rule.action;
      code += "}";
    } else {
      code = rule.action;
    }
    switch(rule.type) {
      case "node":
        buffer += "N ";
        buffer += code;
        buffer += "\n";
        break;
      case "edge":
        buffer += "E ";
        buffer += code;
        buffer += "\n";
        break;
      case "graph":
        buffer += "G ";
        buffer += code;
        buffer += "\n";
        break;
      default:
        buffer += "N ";
        buffer += code;
        buffer += "\n";
        buffer += "E ";
        buffer += code;
        buffer += "\n";
        buffer += "G ";
        buffer += code;
        buffer += "\n";
        break;
    }
  });
  return buffer;
}

function parse(str) {
  return parser.parse(trim(str));
}

function main() {
  var buffer = "";
  process.stdin.on('data', function(chunk) {
    buffer = buffer + chunk;
  });

  process.stdin.on('end', function() {
    console.log(ss2gvpr(parse(buffer.toString())));
  });
  process.stdin.setEncoding('utf8');
  process.stdin.resume();
}

if(require.main === module) {
  main();
} else {
  exports = (exports ? exports : this);
  exports.main = main;
  exports.parse = parse;
  exports.to_gvpr = ss2gvpr;
}
