# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WordPress plugin called "SureFeedback Client Site" that creates a secure bridge between client WordPress websites and a centralized SureFeedback parent dashboard. The plugin enables sticky note-style feedback collection on web designs and projects.

### Key Architecture

- **Main Plugin Class**: `PH_Child` in `ph-child.php` - singleton pattern with core functionality
- **REST API**: `PH_Child_REST_API` in `ph-child-rest-api.php` - handles secure API endpoints
- **Helper Functions**: `ph-child-functions.php` - utility functions and compatibility checks
- **Security Model**: Multi-layered authentication using WordPress roles, access tokens, and HMAC signatures

## Development Commands

### PHP Development
```bash
# Install PHP dependencies
composer install

# Code formatting (auto-fix)
composer format
# or: vendor/bin/phpcbf --standard=phpcs.xml.dist

# Lint code (check standards)
composer lint
# or: vendor/bin/phpcs --standard=phpcs.xml.dist

# Static analysis
composer phpstan
# or: vendor/bin/phpstan --memory-limit=2048M analyse

# Generate stubs for PHPStan
composer gen-stubs
```

### Build & Asset Management
```bash
# Install Node dependencies
npm install

# Development server (Vue.js)
npm run dev

# Build Vue.js assets for production
npm run build

# Type checking only
npm run type-check

# Build everything (Vue.js + translations)
grunt build

# Create distribution package
grunt release

# Generate translation files
grunt i18n

# Convert readme.txt to README.md
grunt readme

# Deploy to WordPress.org (requires SVN credentials)
npm run release
```

## Core Plugin Structure

### Main Files
- `ph-child.php` - Main plugin file with PH_Child class
- `ph-child-rest-api.php` - REST API endpoints (/surefeedback/v1/)
- `ph-child-admin-api.php` - Admin REST API for Vue.js frontend
- `ph-child-functions.php` - Utility functions and compatibility
- `uninstall.php` - Clean uninstall process

### Frontend Architecture (Vue.js + TypeScript)
- `src/main.ts` - Vue.js application entry point
- `src/App.vue` - Main application component
- `src/stores/settings.ts` - Pinia store for settings management
- `src/api/settings.ts` - API client for REST endpoints
- `src/types/index.ts` - TypeScript type definitions
- `src/views/` - Vue.js page components (General, Connection, WhiteLabel)
- `src/components/` - Reusable Vue.js components
- `assets/dist/` - Built Vue.js assets (JS/CSS)

### Security Implementation
- **Token Authentication**: Uses X-SureFeedback-Token header for API access
- **HMAC Signatures**: Email-based HMAC SHA256 signatures for identity verification
- **Role-Based Access**: Configurable WordPress role permissions
- **CORS Policies**: Selective CORS only for SureFeedback endpoints
- **Nonce Verification**: WordPress nonces for state-changing operations

### Page Builder Compatibility
The plugin automatically disables on page builder interfaces:
- Elementor (`elementor-preview`)
- Divi (`et_fb`)
- Beaver Builder (`fl_builder*`)
- Fusion Builder (`builder`, `fb-edit`)
- Oxygen Builder (`ct_builder` with special handling)

## Configuration Options

Key WordPress options stored:
- `ph_child_id` - Website project ID
- `ph_child_api_key` - Public API key for script loader
- `ph_child_access_token` - REST API access token
- `ph_child_parent_url` - Parent SureFeedback site URL
- `ph_child_signature` - Secret signature for HMAC verification

## Development Guidelines

### Code Standards
- Follows WordPress Coding Standards (WPCS)
- Uses PHPStan level 9 static analysis
- PSR-12 compatible formatting
- All functions and methods properly documented

### Security Practices
- Always sanitize input data using WordPress functions
- Use `hash_equals()` for token comparisons to prevent timing attacks
- Implement proper nonce verification for admin actions
- Escape all output data appropriately

### Testing
- PHPUnit for unit testing
- PHPStan stubs in `tests/php/stubs/`
- Static analysis baseline in `phpstan-baseline.neon`

## Deployment Process

1. Version updates in `ph-child.php` and `readme.txt`
2. Run quality checks: `composer lint && composer phpstan`
3. Create release package: `grunt release`
4. Deploy to WordPress.org: `npm run release` (uses `sync.sh`)

## Common Tasks

### Adding New Settings
1. Add to `$whitelist_option_names` array in `PH_Child::__construct()`
2. Include sanitization callback and description
3. Update admin interface in options page method

### Extending REST API
1. Add new route in `PH_Child_REST_API::register_routes()`
2. Implement permission callback with `verify_access()`
3. Add CORS headers for cross-origin requests

### Page Builder Compatibility
- Add new builder detection in `compatiblity_blacklist()` method
- Check for specific query parameters or admin contexts
- Ensure script doesn't load during builder editing modes