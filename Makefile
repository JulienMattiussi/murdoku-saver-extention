.PHONY: help install build watch package test test-watch typecheck format format-check icons check clean

default: help

help: ## Display available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk -F ':.*?## ' '{printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# Installation & build

install: ## Install all dependencies
	npm install

build: ## Build extension to dist/
	npm run build

watch: ## Dev mode with rebuild on change
	npm run watch

package: ## Build and zip dist/ to murdoku-save-bank.zip
	npm run package

clean: ## Clean dist/ and rebuild
	rm -rf dist
	npm run build

icons: ## Regenerate extension icons (requires ImageMagick)
	npm run icons:generate

# Code quality

typecheck: ## Type-check with tsc (no emit)
	npm run typecheck

format: ## Format code with prettier
	npm run format

format-check: ## Check formatting (CI)
	npm run format:check

check: typecheck format-check test ## Run all checks (typecheck + format + tests)

# Tests

test: ## Run all tests (jsdom)
	npm test

test-watch: ## Run tests in watch mode
	npm run test:watch
