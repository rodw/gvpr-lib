var should          = require('should');
var path            = require('path');
var fs              = require('fs');
var HOMEDIR         = path.join(__dirname,'..');
var IS_INSTRUMENTED = fs.existsSync(path.join(HOMEDIR,'lib-cov'));
var LIB_DIR         = (IS_INSTRUMENTED) ? path.join(HOMEDIR,'lib-cov') : path.join(HOMEDIR,'lib');
var gvprss           = require(path.join(LIB_DIR,'/gvprss'));

describe('gvprss',function(){

  it("exposes the parse function",function(done){
    should.exist(gvprss.parse)
    done();
  });

  it(".parse can parse multiple statements",function(done){
    var parsed = gvprss.parse("N {}\nG#foo { penwidth = 5; }\n[x=\"y\"] { y = $.x }\n")
    parsed.length.should.equal(3)
    parsed[0].type.should.equal("node");
    should.not.exist(parsed[0].conditions)
    parsed[0].action.should.equal("{}");
    parsed[1].type.should.equal("graph");
    parsed[1].conditions.length.should.equal(1);
    parsed[1].conditions[0].left.should.equal("name");
    parsed[1].conditions[0].operator.should.equal("nonattr-equals");
    parsed[1].conditions[0].right.should.equal("foo");
    parsed[1].action.should.equal("{ penwidth = 5; }");
    should.not.exist(parsed[2].type);
    parsed[2].conditions.length.should.equal(1);
    parsed[2].conditions[0].left.should.equal("x");
    parsed[2].conditions[0].operator.should.equal("=");
    parsed[2].conditions[0].right.should.equal("y");
    parsed[2].action.should.equal("{ y = $.x }");
    done();
  });

  it("can transform a single rule into gvpr script fragment",function(done){
    var gss = "N #foo .bar [attr=\"xyz\"] { color = \"green\"; style = \"filled\"; }";
    var expected = "N {if(str_equals($.name,\"foo\") && attrlist_includes($,\"class\",\"bar\") && attr_equals($,\"attr\",\"xyz\")) { color = \"green\"; style = \"filled\"; }}\n"
    var parsed = gvprss.parse(gss);
    var gvpr = gvprss.rule_to_gvpr(parsed[0]);
    gvpr.should.equal(expected)
    done();
  });

  it("transforms a typeless gvpr style rule into multiple gvpr rules",function(done){
    var gss = "#foo .bar [attr=\"xyz\"] { color = \"green\"; style = \"filled\"; }";
    var body = "{if(str_equals($.name,\"foo\") && attrlist_includes($,\"class\",\"bar\") && attr_equals($,\"attr\",\"xyz\")) { color = \"green\"; style = \"filled\"; }}\n"
    var expected = "N " + body + "E " + body + "BEG_G " + body;
    var parsed = gvprss.parse(gss);
    var gvpr = gvprss.rule_to_gvpr(parsed[0]);
    gvpr.should.equal(expected)
    done();
  });

  it("can transform multiple rules into a multiple rule gvpr script fragment",function(done){
    var gss = "N #foo .bar [attr=\"xyz\"] { color = \"green\"; style = \"filled\"; }";
    gss += "\nE [abcd] { style=\"dotted\"; }";
    gss += "\n[name^=\"cluster\"] { style=\"filled\"; }";
    var expected = "N {if(str_equals($.name,\"foo\") && attrlist_includes($,\"class\",\"bar\") && attr_equals($,\"attr\",\"xyz\")) { color = \"green\"; style = \"filled\"; }}\n"
    expected += "E {if(has_attr($,\"abcd\")) { style=\"dotted\"; }}\n"
    expected += "N {if(attr_starts_with($,\"name\",\"cluster\")) { style=\"filled\"; }}\n"
    expected += "E {if(attr_starts_with($,\"name\",\"cluster\")) { style=\"filled\"; }}\n"
    expected += "BEG_G {if(attr_starts_with($,\"name\",\"cluster\")) { style=\"filled\"; }}\n"
    var parsed = gvprss.parse(gss);
    var gvpr = gvprss.rules_to_gvpr(parsed);
    gvpr.should.equal(expected)
    done();
  });

});
