.DEFAULT_GOAL := help
.PHONY: help check fmt lint test build clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

check: fmt lint test ## Everything CI runs. Run this before you push.
	@echo "All checks passed."

fmt: ## Format everything in place
	@if [ -f api/go.mod ]; then (cd api && gofmt -w .); fi
	@for d in app web; do \
		if [ -f $$d/package.json ]; then (cd $$d && npm run format --if-present); fi; \
	done

lint: ## Static checks
	@if [ -f api/go.mod ]; then \
		(cd api && test -z "$$(gofmt -l .)" || { echo "gofmt: unformatted files, run make fmt"; exit 1; }) && \
		(cd api && go vet ./...); \
	fi
	@for d in app web; do \
		if [ -f $$d/package.json ]; then (cd $$d && npm run lint --if-present); fi; \
	done

test: ## Run the test suites
	@if [ -f api/go.mod ]; then (cd api && go test -race ./...); fi
	@for d in app web; do \
		if [ -f $$d/package.json ]; then (cd $$d && npm test --if-present); fi; \
	done

build: ## Build what can be built
	@if [ -f api/go.mod ]; then (cd api && go build -o bin/ ./...); fi
	@if [ -f web/package.json ]; then (cd web && npm run build); fi

clean: ## Remove build output
	rm -rf api/bin web/.next web/dist app/dist
