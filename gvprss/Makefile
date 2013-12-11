################################################################################
# CONFIGURATION ################################################################
################################################################################

### NPM ########################################################################
NPM_EXE ?= npm
PACKAGE_JSON ?= package.json
NODE_MODULES ?= node_modules
MODULE_DIR ?= module
TEST_MODULE_DIR ?= ../test-module-install

### PEGJS ######################################################################
PEGJS_EXE ?= ./node_modules/.bin/pegjs
PEGJS_SRCS ?= $(wildcard lib/*.pegjs)
PEGJS_JS ?= $(PEGJS_SRCS:.pegjs=.js)

### MOCHA ######################################################################
MOCHA_EXE ?= mocha
MOCHA_TESTS ?= $(wildcard test/test-*.js)
MOCHA_TEST_PATTERN ?=
MOCHA_TIMEOUT ?=-t 2000
MOCHA_TEST_ARGS ?= -R list $(MOCHA_TIMEOUT) $(MOCHA_TEST_PATTERN)

### GVPR #######################################################################
GVPR_COMMON_SRC ?= ../lib/common.gvpr
GVPR_COMMON_DST ?= lib/common.gvpr

### JSCOVERAGE #################################################################
JSCOVERAGE_EXE ?= node-jscoverage
JSCOVERAGE_REPORT ?= docs/coverage.html
JSCOVERAGE_TMP_DIR ?=  ./jscov-tmp
LIB_COV ?= lib-cov
LIB ?= lib
MOCHA_COV_ARGS ?= -R html-cov --globals "_\$$jscoverage"

### MARKDOWN ###################################################################
MARKDOWN_SRCS ?= $(shell find . -type f -name '*.md' | grep -v node_modules | grep -v module)
MARKDOWN_HTML ?= ${MARKDOWN_SRCS:.md=.html}
MARKDOWN_PROCESSOR ?= marked
MARKDOWN_PROCESSOR_ARGS ?= -gfm
MARKDOWN_PREFIX ?= "<html><body>"
MARKDOWN_SUFFIX ?= "</body></html>"

################################################################################
# TARGETS ######################################################################
################################################################################
.SUFFIXES:;
.PHONY: all clean really-clean npm install clean-node-modules really-clean-node-modules pegjs clean-pegjs test clean-gvpr-common  clean-test-module-install clean-module module test-module-install coverage clean-coverage docco markdown clean-docco clean-markdown docs clean-docs publish;

### ALL ########################################################################
all: test;
clean: clean-pegjs clean-node-modules clean-test-module-install clean-module clean-coverage clean-docs;
really-clean: clean reall-clean-node-modules;

### NPM ########################################################################
module: test coverage docs
	mkdir -p $(MODULE_DIR)
	cp README.* $(MODULE_DIR)
	cp ../license.txt $(MODULE_DIR)
	cp -r lib $(MODULE_DIR)
	cp -r test $(MODULE_DIR)
	cp -r bin $(MODULE_DIR)
	cp -r docs $(MODULE_DIR)
	cp $(PACKAGE_JSON) $(MODULE_DIR)
	cp Makefile $(MODULE_DIR)
test-module-install: clean-test-module-install module
	mkdir -p ${TEST_MODULE_DIR}
	cd ${TEST_MODULE_DIR}
	npm install "$(CURDIR)/${MODULE_DIR}"
	node -e "require('assert').ok(require('gvprss') !== null);" && echo "N { printf(\"IT WORKED\!\");}" | ./bin/gvprss | grep "IT WORKED\!" && echo "It worked!" && cd $(CURDIR) && rm -rf ${TEST_MODULE_DIR}
$(NODE_MODULES): $(PACKAGE_JSON)
	$(NPM_EXE) prune
	$(NPM_EXE) --silent install
	touch $(NODE_MODULES) # touch the module dir so it looks younger than `package.json`
npm: $(NODE_MODULES) # an alias
install: $(NODE_MODULES) # an alias
clean-node-modules:; $(NPM_EXE) prune
really-clean-node-modules:; rm -rf $(NODE_MODULES)
clean-test-module-install:; rm -rf ${TEST_MODULE_DIR}
clean-module:; rm -rf ${MODULE_DIR}
publish: module test-module-install; $(NPM_EXE) publish $(MODULE_DIR)

### PEGJS ######################################################################
%.js: %.pegjs; $(PEGJS_EXE) $<
pegjs: $(PEGJS_JS)
clean-pegjs:; rm -rf $(PEGJS_JS)

### MOCHA ######################################################################
test: $(NODE_MODULES) $(GVPR_COMMON_DST) $(PEGJS_JS) $(MOCHA_TESTS)
	$(MOCHA_EXE) $(MOCHA_TEST_ARGS) $(MOCHA_TESTS)
coverage:  $(NODE_MODULES) $(GVPR_COMMON_DST) $(PEGJS_JS) $(MOCHA_TESTS)
	rm -rf $(JSCOVERAGE_TMP_DIR)
	rm -rf $(LIB_COV)
	mkdir -p $(JSCOVERAGE_TMP_DIR)
	cp -r $(LIB)/* $(JSCOVERAGE_TMP_DIR)/.
	$(JSCOVERAGE_EXE) -v $(JSCOVERAGE_TMP_DIR) $(LIB_COV)
	mkdir -p `dirname $(JSCOVERAGE_REPORT)`
	$(MOCHA_EXE) $(MOCHA_COV_ARGS) $(MOCHA_TESTS) > $(JSCOVERAGE_REPORT)
	rm -rf $(JSCOVERAGE_TMP_DIR)
	rm -rf $(LIB_COV)
clean-coverage:; rm -rf  $(JSCOVERAGE_TMP_DIR) $(LIB_COV) $(JSCOVERAGE_REPORT)

### GVPR #######################################################################
$(GVPR_COMMON_DST): $(GVPR_COMMON_SRC)
	head -n -1 $(GVPR_COMMON_SRC) > $(GVPR_COMMON_DST)
clean-gvpr-common:; rm -rf $(GVPR_COMMON_DST)

# ### DOCS #######################################################################
docs: markdown docco
.SUFFIXES: .html .md
.md.html:
	(echo $(MARKDOWN_PREFIX) > $@) && ($(MARKDOWN_PROCESSOR) $(MARKDOWN_PROCESSOR_ARGS) $< >> $@) && (echo $(MARKDOWN_SUFFIX) >> $@)
$(MARKDOWN_HTML_OBJ): $(MARKDOWN_SRCS)
markdown: $(MARKDOWN_HTML)
docco: $(NODE_MODULES) $(PEGJS_JS)
	rm -rf docs/docco
	mkdir -p docs
	mv docs docs-temporarily-renamed-so-docco-doesnt-clobber-it
	docco lib/*.js
	mv docs docs-temporarily-renamed-so-docco-doesnt-clobber-it/docco
	mv docs-temporarily-renamed-so-docco-doesnt-clobber-it docs
clean-docs: clean-docco clean-markdown;
clean-docco:; rm -rf docs/docco
clean-markdown:; rm -rf $(MARKDOWN_HTML)

################################################################################
# EOF ##########################################################################
################################################################################
