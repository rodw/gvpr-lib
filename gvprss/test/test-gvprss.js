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
    parsed[1].conditions[0].operator.should.equal("==");
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
