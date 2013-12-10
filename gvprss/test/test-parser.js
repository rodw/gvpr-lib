var should          = require('should');
var path            = require('path');
var fs              = require('fs');
var HOMEDIR         = path.join(__dirname,'..');
var IS_INSTRUMENTED = fs.existsSync(path.join(HOMEDIR,'lib-cov'));
var LIB_DIR         = (IS_INSTRUMENTED) ? path.join(HOMEDIR,'lib-cov') : path.join(HOMEDIR,'lib');
var parser           = require(path.join(LIB_DIR,'/parser'));

describe('parser',function(){

  it("can parse a no-op node match",function(done){
    var parsed = parser.parse("N {}")
    parsed.length.should.equal(1)
    parsed[0].type.should.equal("node");
    should.not.exist(parsed[0].conditions)
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a no-op edge match",function(done){
    var parsed = parser.parse("E {}")
    parsed.length.should.equal(1)
    parsed[0].type.should.equal("edge");
    should.not.exist(parsed[0].conditions)
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a no-op graph match",function(done){
    var parsed = parser.parse("G {}")
    parsed.length.should.equal(1)
    parsed[0].type.should.equal("graph");
    should.not.exist(parsed[0].conditions)
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a no-op ID (name) match",function(done){
    var parsed = parser.parse("#foo {}")
    parsed.length.should.equal(1)
    should.not.exist(parsed[0].type)
    parsed[0].conditions.length.should.equal(1);
    parsed[0].conditions[0].left.should.equal("name");
    parsed[0].conditions[0].operator.should.equal("nonattr-equals");
    parsed[0].conditions[0].right.should.equal("foo");
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a no-op class match",function(done){
    var parsed = parser.parse(".bar {}")
    parsed.length.should.equal(1)
    should.not.exist(parsed[0].type)
    parsed[0].conditions.length.should.equal(1);
    parsed[0].conditions[0].left.should.equal("class");
    parsed[0].conditions[0].operator.should.equal("~=");
    parsed[0].conditions[0].right.should.equal("bar");
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a no-op attribute-exists match",function(done){
    var parsed = parser.parse("[foo] {}")
    parsed.length.should.equal(1)
    should.not.exist(parsed[0].type)
    parsed[0].conditions.length.should.equal(1);
    parsed[0].conditions[0].left.should.equal("foo");
    parsed[0].conditions[0].operator.should.equal("exists");
    should.not.exist(parsed[0].conditions[0].right);
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a no-op attribute-equals match (==)",function(done){
    var parsed = parser.parse("[foo==bar] {}")
    parsed.length.should.equal(1)
    should.not.exist(parsed[0].type)
    parsed[0].conditions.length.should.equal(1);
    parsed[0].conditions[0].left.should.equal("foo");
    parsed[0].conditions[0].operator.should.equal("==");
    parsed[0].conditions[0].right.should.equal("bar");
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a no-op attribute-equals match (=)",function(done){
    var parsed = parser.parse("[foo=bar] {}")
    parsed.length.should.equal(1)
    should.not.exist(parsed[0].type)
    parsed[0].conditions.length.should.equal(1);
    parsed[0].conditions[0].left.should.equal("foo");
    parsed[0].conditions[0].operator.should.equal("=");
    parsed[0].conditions[0].right.should.equal("bar");
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a no-op attribute-starts-with match (^=)",function(done){
    var parsed = parser.parse("[foo^=bar] {}")
    parsed.length.should.equal(1)
    should.not.exist(parsed[0].type)
    parsed[0].conditions.length.should.equal(1);
    parsed[0].conditions[0].left.should.equal("foo");
    parsed[0].conditions[0].operator.should.equal("^=");
    parsed[0].conditions[0].right.should.equal("bar");
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a no-op attribute-ends-with match ($=)",function(done){
    var parsed = parser.parse("[foo$=bar] {}")
    parsed.length.should.equal(1)
    should.not.exist(parsed[0].type)
    parsed[0].conditions.length.should.equal(1);
    parsed[0].conditions[0].left.should.equal("foo");
    parsed[0].conditions[0].operator.should.equal("$=");
    parsed[0].conditions[0].right.should.equal("bar");
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a no-op attribute-contains match (*=)",function(done){
    var parsed = parser.parse("[foo*=bar] {}")
    parsed.length.should.equal(1)
    should.not.exist(parsed[0].type)
    parsed[0].conditions.length.should.equal(1);
    parsed[0].conditions[0].left.should.equal("foo");
    parsed[0].conditions[0].operator.should.equal("*=");
    parsed[0].conditions[0].right.should.equal("bar");
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a no-op attribute-list-includes match (~=)",function(done){
    var parsed = parser.parse("[foo~=bar] {}")
    parsed.length.should.equal(1)
    should.not.exist(parsed[0].type)
    parsed[0].conditions.length.should.equal(1);
    parsed[0].conditions[0].left.should.equal("foo");
    parsed[0].conditions[0].operator.should.equal("~=");
    parsed[0].conditions[0].right.should.equal("bar");
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a no-op multi-party match (case 1)",function(done){
    var parsed = parser.parse("N #theid .theclass .anotherclass [attrname==attrvalue] [anotherattr~=anothervalue] {}")
    parsed.length.should.equal(1)
    parsed[0].type.should.equal("node");
    parsed[0].conditions.length.should.equal(5);
    parsed[0].conditions[0].left.should.equal("name");
    parsed[0].conditions[0].operator.should.equal("nonattr-equals");
    parsed[0].conditions[0].right.should.equal("theid");
    parsed[0].conditions[1].left.should.equal("class");
    parsed[0].conditions[1].operator.should.equal("~=");
    parsed[0].conditions[1].right.should.equal("theclass");
    parsed[0].conditions[2].left.should.equal("class");
    parsed[0].conditions[2].operator.should.equal("~=");
    parsed[0].conditions[2].right.should.equal("anotherclass");
    parsed[0].conditions[3].left.should.equal("attrname");
    parsed[0].conditions[3].operator.should.equal("==");
    parsed[0].conditions[3].right.should.equal("attrvalue");
    parsed[0].conditions[4].left.should.equal("anotherattr");
    parsed[0].conditions[4].operator.should.equal("~=");
    parsed[0].conditions[4].right.should.equal("anothervalue");
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a no-op multi-party match (case 2: no spaces)",function(done){
    var parsed = parser.parse("N#theid.theclass.anotherclass[attrname==attrvalue][anotherattr~=anothervalue]{}")
    parsed.length.should.equal(1)
    parsed[0].type.should.equal("node");
    parsed[0].conditions.length.should.equal(5);
    parsed[0].conditions[0].left.should.equal("name");
    parsed[0].conditions[0].operator.should.equal("nonattr-equals");
    parsed[0].conditions[0].right.should.equal("theid");
    parsed[0].conditions[1].left.should.equal("class");
    parsed[0].conditions[1].operator.should.equal("~=");
    parsed[0].conditions[1].right.should.equal("theclass");
    parsed[0].conditions[2].left.should.equal("class");
    parsed[0].conditions[2].operator.should.equal("~=");
    parsed[0].conditions[2].right.should.equal("anotherclass");
    parsed[0].conditions[3].left.should.equal("attrname");
    parsed[0].conditions[3].operator.should.equal("==");
    parsed[0].conditions[3].right.should.equal("attrvalue");
    parsed[0].conditions[4].left.should.equal("anotherattr");
    parsed[0].conditions[4].operator.should.equal("~=");
    parsed[0].conditions[4].right.should.equal("anothervalue");
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a no-op multi-party match (case 3: quoted attribute values)",function(done){
    var parsed = parser.parse("N#theid.theclass.anotherclass[attrname==\"attrvalue\"][anotherattr~=\"anothervalue\"]{}")
    parsed.length.should.equal(1)
    parsed[0].type.should.equal("node");
    parsed[0].conditions.length.should.equal(5);
    parsed[0].conditions[0].left.should.equal("name");
    parsed[0].conditions[0].operator.should.equal("nonattr-equals");
    parsed[0].conditions[0].right.should.equal("theid");
    parsed[0].conditions[1].left.should.equal("class");
    parsed[0].conditions[1].operator.should.equal("~=");
    parsed[0].conditions[1].right.should.equal("theclass");
    parsed[0].conditions[2].left.should.equal("class");
    parsed[0].conditions[2].operator.should.equal("~=");
    parsed[0].conditions[2].right.should.equal("anotherclass");
    parsed[0].conditions[3].left.should.equal("attrname");
    parsed[0].conditions[3].operator.should.equal("==");
    parsed[0].conditions[3].right.should.equal("attrvalue");
    parsed[0].conditions[4].left.should.equal("anotherattr");
    parsed[0].conditions[4].operator.should.equal("~=");
    parsed[0].conditions[4].right.should.equal("anothervalue");
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a no-op multi-party match (case 4: numeric attribute values)",function(done){
    var parsed = parser.parse("N#theid.theclass.anotherclass[attrname==17][anotherattr~=9]{}")
    parsed.length.should.equal(1)
    parsed[0].type.should.equal("node");
    parsed[0].conditions.length.should.equal(5);
    parsed[0].conditions[0].left.should.equal("name");
    parsed[0].conditions[0].operator.should.equal("nonattr-equals");
    parsed[0].conditions[0].right.should.equal("theid");
    parsed[0].conditions[1].left.should.equal("class");
    parsed[0].conditions[1].operator.should.equal("~=");
    parsed[0].conditions[1].right.should.equal("theclass");
    parsed[0].conditions[2].left.should.equal("class");
    parsed[0].conditions[2].operator.should.equal("~=");
    parsed[0].conditions[2].right.should.equal("anotherclass");
    parsed[0].conditions[3].left.should.equal("attrname");
    parsed[0].conditions[3].operator.should.equal("==");
    parsed[0].conditions[3].right.should.equal("17");
    parsed[0].conditions[4].left.should.equal("anotherattr");
    parsed[0].conditions[4].operator.should.equal("~=");
    parsed[0].conditions[4].right.should.equal("9");
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a no-op multi-party match (case 5: quoted id)",function(done){
    var parsed = parser.parse("N #\"the id\" .theclass .anotherclass [attrname==attrvalue] [anotherattr~=anothervalue] {}")
    parsed.length.should.equal(1)
    parsed[0].type.should.equal("node");
    parsed[0].conditions.length.should.equal(5);
    parsed[0].conditions[0].left.should.equal("name");
    parsed[0].conditions[0].operator.should.equal("nonattr-equals");
    parsed[0].conditions[0].right.should.equal("the id");
    parsed[0].conditions[1].left.should.equal("class");
    parsed[0].conditions[1].operator.should.equal("~=");
    parsed[0].conditions[1].right.should.equal("theclass");
    parsed[0].conditions[2].left.should.equal("class");
    parsed[0].conditions[2].operator.should.equal("~=");
    parsed[0].conditions[2].right.should.equal("anotherclass");
    parsed[0].conditions[3].left.should.equal("attrname");
    parsed[0].conditions[3].operator.should.equal("==");
    parsed[0].conditions[3].right.should.equal("attrvalue");
    parsed[0].conditions[4].left.should.equal("anotherattr");
    parsed[0].conditions[4].operator.should.equal("~=");
    parsed[0].conditions[4].right.should.equal("anothervalue");
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a no-op multi-party match (case 6: quoted class names)",function(done){
    var parsed = parser.parse("N #\"the id\" .\"the class\" .\"another class\" [attrname==attrvalue] [anotherattr~=anothervalue] {}")
    parsed.length.should.equal(1)
    parsed[0].type.should.equal("node");
    parsed[0].conditions.length.should.equal(5);
    parsed[0].conditions[0].left.should.equal("name");
    parsed[0].conditions[0].operator.should.equal("nonattr-equals");
    parsed[0].conditions[0].right.should.equal("the id");
    parsed[0].conditions[1].left.should.equal("class");
    parsed[0].conditions[1].operator.should.equal("~=");
    parsed[0].conditions[1].right.should.equal("the class");
    parsed[0].conditions[2].left.should.equal("class");
    parsed[0].conditions[2].operator.should.equal("~=");
    parsed[0].conditions[2].right.should.equal("another class");
    parsed[0].conditions[3].left.should.equal("attrname");
    parsed[0].conditions[3].operator.should.equal("==");
    parsed[0].conditions[3].right.should.equal("attrvalue");
    parsed[0].conditions[4].left.should.equal("anotherattr");
    parsed[0].conditions[4].operator.should.equal("~=");
    parsed[0].conditions[4].right.should.equal("anothervalue");
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a no-op multi-party match (case 7: quotes without whitespace)",function(done){
    var parsed = parser.parse("N#\"the id\".\"the class\".\"another class\"[attrname==\"attr value\"][anotherattr~=\"another value\"]{}")
    parsed.length.should.equal(1)
    parsed[0].type.should.equal("node");
    parsed[0].conditions.length.should.equal(5);
    parsed[0].conditions[0].left.should.equal("name");
    parsed[0].conditions[0].operator.should.equal("nonattr-equals");
    parsed[0].conditions[0].right.should.equal("the id");
    parsed[0].conditions[1].left.should.equal("class");
    parsed[0].conditions[1].operator.should.equal("~=");
    parsed[0].conditions[1].right.should.equal("the class");
    parsed[0].conditions[2].left.should.equal("class");
    parsed[0].conditions[2].operator.should.equal("~=");
    parsed[0].conditions[2].right.should.equal("another class");
    parsed[0].conditions[3].left.should.equal("attrname");
    parsed[0].conditions[3].operator.should.equal("==");
    parsed[0].conditions[3].right.should.equal("attr value");
    parsed[0].conditions[4].left.should.equal("anotherattr");
    parsed[0].conditions[4].operator.should.equal("~=");
    parsed[0].conditions[4].right.should.equal("another value");
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a no-op multi-party match (case 8: no type selector)",function(done){
    var parsed = parser.parse("#\"the id\".\"the class\".\"another class\"[attrname==\"attr value\"][anotherattr~=\"another value\"]{}")
    parsed.length.should.equal(1)
    should.not.exist(parsed[0].type)
    parsed[0].conditions.length.should.equal(5);
    parsed[0].conditions[0].left.should.equal("name");
    parsed[0].conditions[0].operator.should.equal("nonattr-equals");
    parsed[0].conditions[0].right.should.equal("the id");
    parsed[0].conditions[1].left.should.equal("class");
    parsed[0].conditions[1].operator.should.equal("~=");
    parsed[0].conditions[1].right.should.equal("the class");
    parsed[0].conditions[2].left.should.equal("class");
    parsed[0].conditions[2].operator.should.equal("~=");
    parsed[0].conditions[2].right.should.equal("another class");
    parsed[0].conditions[3].left.should.equal("attrname");
    parsed[0].conditions[3].operator.should.equal("==");
    parsed[0].conditions[3].right.should.equal("attr value");
    parsed[0].conditions[4].left.should.equal("anotherattr");
    parsed[0].conditions[4].operator.should.equal("~=");
    parsed[0].conditions[4].right.should.equal("another value");
    parsed[0].action.should.equal("{}");
    done();
  });


  it("can parse a no-op multi-party match (case 9: order shuffled up a bit)",function(done){
    var parsed = parser.parse("N.\"the class\"[attrname==\"attr value\"]#\"the id\"[anotherattr~=\"another value\"].\"another class\"{}")
    parsed.length.should.equal(1)
    parsed[0].type.should.equal("node");
    parsed[0].conditions.length.should.equal(5);
    parsed[0].conditions[0].left.should.equal("class");
    parsed[0].conditions[0].operator.should.equal("~=");
    parsed[0].conditions[0].right.should.equal("the class");
    parsed[0].conditions[1].left.should.equal("attrname");
    parsed[0].conditions[1].operator.should.equal("==");
    parsed[0].conditions[1].right.should.equal("attr value");
    parsed[0].conditions[2].left.should.equal("name");
    parsed[0].conditions[2].operator.should.equal("nonattr-equals");
    parsed[0].conditions[2].right.should.equal("the id");
    parsed[0].conditions[3].left.should.equal("anotherattr");
    parsed[0].conditions[3].operator.should.equal("~=");
    parsed[0].conditions[3].right.should.equal("another value");
    parsed[0].conditions[4].left.should.equal("class");
    parsed[0].conditions[4].operator.should.equal("~=");
    parsed[0].conditions[4].right.should.equal("another class");
    parsed[0].action.should.equal("{}");
    done();
  });

  it("can parse a node match with a simple action",function(done){
    var parsed = parser.parse("N { color=\"red\"; }")
    parsed.length.should.equal(1)
    parsed[0].type.should.equal("node");
    should.not.exist(parsed[0].conditions)
    parsed[0].action.should.equal("{ color=\"red\"; }");
    done();
  });

  it("can parse a node match with a simple action that contains curly brackets",function(done){
    var parsed = parser.parse("N {\nif(1!=2) {\ncolor=\"red\";\n}\n}")
    parsed.length.should.equal(1)
    parsed[0].type.should.equal("node");
    should.not.exist(parsed[0].conditions)
    parsed[0].action.should.equal("{\nif(1!=2) {\ncolor=\"red\";\n}\n}");
    done();
  });

  it("can parse a node match with a simple action that contains quoted brackets",function(done){
    var parsed = parser.parse("N {\nif(1!=2) {\nxlabel=\"{foo}\";\n}\n}")
    parsed.length.should.equal(1)
    parsed[0].type.should.equal("node");
    should.not.exist(parsed[0].conditions)
    parsed[0].action.should.equal("{\nif(1!=2) {\nxlabel=\"{foo}\";\n}\n}");
    done();
  });

  it("can parse a node match with a simple action that contains mis-matched quoted brackets",function(done){
    var parsed = parser.parse("N {\n  if(1!=2) {\n    xlabel=\"}f}o}{o}?\";\n  }\n}")
    parsed.length.should.equal(1)
    parsed[0].type.should.equal("node");
    should.not.exist(parsed[0].conditions)
    parsed[0].action.should.equal("{\n  if(1!=2) {\n    xlabel=\"}f}o}{o}?\";\n  }\n}");
    done();
  });

  it("can parse multiple statements",function(done){
    var parsed = parser.parse("N {}\nG#foo { penwidth = 5; }\n[x=\"y\"] { y = $.x }\n")
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

});
