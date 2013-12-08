.SUFFIXES:
.PHONY: test
.PRECIOUS: %.found
all: test
clean: clean-test

COMMON_GVPR = lib/common.gvpr

TEST_EXPECTED ?= $(wildcard test/*.expected)
TEST_FOUND = ${TEST_EXPECTED:.expected=.found}
TEST_TESTED = ${TEST_EXPECTED:.expected=.tested}

%.found: %.gv %.gvpr $(COMMON_GVPR)
	@(gvpr "`cat $(COMMON_GVPR) $(subst .found,.gvpr,$@)`" $(subst .found,.gv,$@) > $@)

%.tested: %.found %.expected
	@(\
	  (\
	    (diff $(subst .tested,.found,$@) $(subst .tested,.expected,$@)) && \
			echo "[PASS] $(subst .tested,,$@)" && \
			echo "SUCCESS" > $@ \
		) || ( \
			echo "[FAIL] $(subst .tested,,$@)" && \
			echo "       Please compare the files \"$(subst .tested,.expected,$@)\" and \"$(subst .tested,.found,$@)\"." && \
			false \
		) \
	)

test: $(TEST_TESTED)

clean-test:; @(rm -rf $(TEST_TESTED) $(TEST_FOUND))

re-test: clean-test test
