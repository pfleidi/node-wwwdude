test:
	@find test/wwwdude-*.js | xargs -n 1 -t nodeunit

.PHONY: test
