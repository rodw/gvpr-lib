################################################################################
# CONFIGURATION ################################################################
################################################################################

### NPM ########################################################################
NPM_EXE ?= npm
PACKAGE_JSON ?= package.json
NODE_MODULES ?= node_modules

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

################################################################################
# TARGETS ######################################################################
################################################################################

.PHONY: all clean really-clean npm install clean-node-modules really-clean-node-modules pegjs clean-pegjs test clean-gvpr-common

### ALL ########################################################################
all: $(NODE_MODULES) pegjs;
clean: clean-pegjs clean-node-modules;
really-clean: clean reall-clean-node-modules;

### NPM ########################################################################
$(NODE_MODULES): $(PACKAGE_JSON)
	$(NPM_EXE) prune
	$(NPM_EXE) --silent install
	touch $(NODE_MODULES) # touch the module dir so it looks younger than `package.json`
npm: $(NODE_MODULES) # an alias
install: $(NODE_MODULES) # an alias
clean-node-modules:; $(NPM_EXE) prune
really-clean-node-modules:; rm -rf $(NODE_MODULES)

### PEGJS ######################################################################
%.js: %.pegjs; $(PEGJS_EXE) $<
pegjs: $(PEGJS_JS)
clean-pegjs:; rm -rf $(PEGJS_JS)

### MOCHA ######################################################################
test: $(NODE_MODULES) $(GVPR_COMMON_DST) $(PEGJS_JS) $(MOCHA_TESTS)
	$(MOCHA_EXE) $(MOCHA_TEST_ARGS) $(MOCHA_TESTS)

### GVPR #######################################################################
$(GVPR_COMMON_DST): $(GVPR_COMMON_SRC)
	head -n -1 $(GVPR_COMMON_SRC) > $(GVPR_COMMON_DST)

clean-gvpr-common:; rm -rf $(GVPR_COMMON_DST)

################################################################################
# EOF ##########################################################################
################################################################################
