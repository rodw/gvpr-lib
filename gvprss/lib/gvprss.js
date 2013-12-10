var path             = require('path');
var fs               = require('fs');
var os               = require('os');
var HOMEDIR          = path.join(__dirname,'..');
var IS_INSTRUMENTED  = fs.existsSync(path.join(HOMEDIR,'lib-cov'));
var LIB_DIR          = (IS_INSTRUMENTED) ? path.join(HOMEDIR,'lib-cov') : path.join(HOMEDIR,'lib');
var parser           = require(path.join(LIB_DIR,'parser'));
var common_gvpr_file = path.join(LIB_DIR,'common.gvpr');

function trim(str) {
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function escape(str) {
  if(typeof str != 'string') {
    str = ""+str;
  }
  return JSON.stringify(str);
}

function read_file(filename) {
  if(filename == "-") {
    filename = '/dev/stdin';
  }
  return fs.readFileSync(filename,{encoding:"utf8"});
}

var common_gvpr_contents = null;
function common_gvpr() {
  if(common_gvpr_contents === null) {
    common_gvpr_contents = read_file(common_gvpr_file);
  }
  return common_gvpr_contents;
}

function rule_to_gvpr(rule) {
  var buffer = "";
  var conditions = []
  if(rule.conditions) {
    rule.conditions.forEach(function(condition) {
      switch(condition.operator) {
        case "==":
        case "=":
          conditions.push("attr_equals($,"+escape(condition.left)+","+escape(condition.right)+")");
          break;
        case "nonattr-equals":
          conditions.push("str_equals($."+condition.left+","+escape(condition.right)+")");
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
          conditions.push("attr_ends_with($,"+escape(condition.left)+","+escape(condition.right)+")");
          break;
        case "exists":
          conditions.push("has_attr($,"+escape(condition.left)+")");
          break;
      }
    });
  }
  var code = "";
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
      buffer += "BEG_G ";
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
      buffer += "BEG_G ";
      buffer += code;
      buffer += "\n";
      break;
  }
  return buffer;
}

function rules_to_gvpr(rules) {
  var buffer = "";
  rules.forEach(function(rule) {
    buffer += rule_to_gvpr(rule);
  });
  return buffer;
}

function files_to_strings(files) {
  if(Array.isArray(files)) {
    var strings = []
    files.forEach(function(filename) {
      strings.push(read_file(filename));
    });
    return strings;
  } else if(files) {
    return read_file(files)
  } else {
    return null;
  }
}

function to_gvpr(stylesheets,begins,others) {
  var buffer = "";
  // BEGIN
  buffer += common_gvpr();
  if(begins) {
    begins.forEach(function(str) {
      buffer += str;
      buffer += "\n";
    });
  }
  buffer += "\n}\n";
  // STYLE RULES
  if(stylesheets) {
    stylesheets.forEach(function(str) {
      var parsed = parse(str);
      var script = rules_to_gvpr(parsed);
      buffer += script;
      buffer += "\n";
    });
  }
  // OTHER SCRIPTS
  if(others) {
    others.forEach(function(str) {
      buffer += str;
      buffer += "\n";
    });
  }
  // DONE
  return buffer;
}

function parse(str) {
  return parser.parse(trim(str));
}

function main() {
  var stylesheets = [];
  var before_scripts = [];
  var scripts = [];
  var gvpr_args = [];
  var output = null;

  for(var i=2;i<process.argv.length;) {
    if(process.argv[i] == "-S") {
      stylesheets.push(process.argv[i+1]);
      i += 2;
    } else if(process.argv[i] == "-B") {
      before_scripts.push(process.argv[i+1]);
      i += 2;
    } else if(process.argv[i] == "-G") {
      scripts.push(process.argv[i+1]);
      i += 2;
    } else if(process.argv[i] == "-O") {
      output = process.argv[i+1];
      i += 2;
    } else {
      gvpr_args.push(process.argv[i]);
      i += 1;
    }
  }
  stylesheets = files_to_strings(stylesheets);
  before_scripts = files_to_strings(before_scripts);
  scripts = files_to_strings(scripts);
  var gvpr = to_gvpr(stylesheets,before_scripts,scripts);

  if(output) {
    if(output == "-") {
      console.log(gvpr);
    } else {
      fs.writeFileSync(output,gvpr);
    }
  } else {
    var sys = require('sys')
    var exec = require('child_process').exec;
    var temp = require('temp');
    // temp.track();
    temp.open({dir:os.tmpDir(),prefix:"gvprss",suffix:".gvpr"},function(err,info){
      if(err) { throw err; }
      fs.write(info.fd,gvpr);
      fs.close(info.fd,function(err){
        if(err) { throw err; }
          var command = "gvpr ";
          command += " -f " + info.path + " ";
          gvpr_args.forEach(function(arg){
            command += escape(arg) + " ";
          });
          function puts(error, stdout, stderr) { sys.puts(stdout); sys.puts(stderr); }
          // console.log(command);
          exec(command, puts);
      });
    });
  }
}

if(require.main === module) {
  main();
} else {
  exports = (exports ? exports : this);
  exports.main = main;
  exports.parse = parse;
  exports.rules_to_gvpr = rules_to_gvpr;
  exports.rule_to_gvpr = rule_to_gvpr;
}
