var path             = require('path');
var fs               = require('fs');
var util             = require('util');
var HOMEDIR          = path.join(__dirname,'..');
var IS_INSTRUMENTED  = fs.existsSync(path.join(HOMEDIR,'lib-cov'));
var LIB_DIR          = (IS_INSTRUMENTED) ? path.join(HOMEDIR,'lib-cov') : path.join(HOMEDIR,'lib');
var parser           = require(path.join(LIB_DIR,'parser'));
var common_gvpr_file = path.join(LIB_DIR,'common.gvpr');

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
  return parser.parse(str.trim());
}

function main(argv) {
  var stylesheets = [];
  var before_scripts = [];
  var scripts = [];
  var gvpr_args = [];
  var output = null;

  if(argv.length == 2) {
    stylesheets.push("-");
  }
  for(var i=2;i<argv.length;) {
    if(argv[i] == "-S") {
      stylesheets.push(argv[i+1]);
      i += 2;
    } else if(argv[i] == "-B") {
      before_scripts.push(argv[i+1]);
      i += 2;
    } else if(argv[i] == "-G") {
      scripts.push(argv[i+1]);
      i += 2;
    } else if(argv[i] == "-O") {
      output = argv[i+1];
      i += 2;
    } else {
      gvpr_args.push(argv[i]);
      i += 1;
    }
  }


  stylesheets = files_to_strings(stylesheets);
  before_scripts = files_to_strings(before_scripts);
  scripts = files_to_strings(scripts);
  var gvpr = to_gvpr(stylesheets,before_scripts,scripts);

  if(gvpr_args.length == 0 && output == null) {
    output = "-";
  }
  if(output) {
    if(output == "-") {
      console.log(gvpr);
    } else {
      fs.writeFileSync(output,gvpr);
    }
  } else {
    var child_process = require('child_process');
    var temp = require('temp');
    var os   = require('os');
    temp.track();
    temp.open({dir:os.tmpDir(),prefix:"gvprss",suffix:".gvpr"},function(err,info){
      if(err) { throw err; }
      fs.write(info.fd,gvpr);
      fs.close(info.fd,function(err){
        if(err) { throw err; }
          var args = [];
          args.push("-f");
          args.push(info.path);
          gvpr_args.forEach(function(arg){ args.push(arg); });
          var child = child_process.spawn("gvpr", args,{stdio:'inherit',detached:true});
          child.on('close',function(code){process.exit(code);});
          child.on('error',function(err){console.error(err);});
      });
    });
  }
}

if(require.main === module) {
  main(process.argv);
} else {
  exports = (exports ? exports : this);
  exports.main = main;
  exports.parse = parse;
  exports.rules_to_gvpr = rules_to_gvpr;
  exports.rule_to_gvpr = rule_to_gvpr;
}
