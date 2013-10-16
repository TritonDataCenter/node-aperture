#
# Copyright (c) 2012, Joyent, Inc. All rights reserved.
#
# Makefile: basic Makefile for template API service
#
# This Makefile is a template for new repos. It contains only repo-specific
# logic and uses included makefiles to supply common targets (javascriptlint,
# jsstyle, restdown, etc.), which are used by other repos as well. You may well
# need to rewrite most of this file, but you shouldn't need to touch the
# included makefiles.
#
# If you find yourself adding support for new targets that could be useful for
# other projects too, you should add these to the original versions of the
# included Makefiles (in eng.git) so that other teams can use them too.
#

#
# Tools
#
NODEUNIT	:= ./node_modules/.bin/nodeunit
BUNYAN		:= ./node_modules/.bin/bunyan
NPM		:= npm

#
# Files
#
JISON	:= ./node_modules/.bin/jison
DOC_FILES	 = index.restdown
JS_FILES	:= $(shell find lib test -name '*.js')
JSL_CONF_NODE	 = tools/jsl.node.conf
JSL_FILES_NODE   = $(JS_FILES)
JSSTYLE_FILES	 = $(JS_FILES)
JSSTYLE_FLAGS    = -f tools/jsstyle.conf

CLEAN_FILES	+= node_modules lib/language.js
#
# Repo-specific targets
#
.PHONY: all
all: lib/parser.js
	$(NPM) install

$(JISON):
	$(NPM) install

$(NODEUNIT):
	$(NPM) install

gen/language.js: lib/language.jison $(JISON)
	$(JISON) -o $@ $<

.PHONY: test
test: $(NODEUNIT) gen/language.js
	find test -name '*.test.js' | xargs -n 1 $(NODEUNIT)

include ./tools/mk/Makefile.deps
include ./tools/mk/Makefile.targ
