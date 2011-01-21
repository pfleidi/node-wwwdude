test:
	@find test/wwwdude-*.js | xargs -n 1 -t nodeunit

lint:
	@find lib/*.js | xargs -n 1 -t nodelint --config nodelintconfig.js

doc:
	dox --title 'wwwdude' \
		--ribbon https://github.com/pfleidi/node-wwwdude \
		--desc "wwwdude is a small and flexible http client library on top of node\'s http client" \
		$(shell find lib/ -type f) > docs/index.html

.PHONY: test lint
