# Sigmize WordPress Plugin ↔ Laravel Backend Connection Analysis

## Executive Summary

This document provides a comprehensive analysis of how the Sigmize WordPress plugin connects to the Sigmize Laravel backend API. The connection uses an OAuth-like flow with temporary tokens that are exchanged for permanent bearer tokens.

---

## Architecture Overview

### Components

1. **WordPress Plugin** (`sigmize` plugin)
   - Location: `/wp-content/plugins/sigmize/`
   - Main entry: `sigmize.php`
   - Key classes:
     - `Auth_Manager` - Handles authentication flow
     - `SaaS_Client` - API communication client
     - `Rest_Controller` - WordPress REST API endpoints

2. **Laravel Backend** (`sigmize-laravel`)
   - Location: `/Brainstrom-force/sigmize-laravel/`
   - API Base URL: `https://api.sigmize.com`
   - Frontend Base URL: `https://app.sigmize.com`
   - Key components:
     - `ConnectionController` - Handles connection endpoints
     - `ConnectionService` - Business logic for connections
     - `ConnectionToken` model - Temporary OAuth tokens

---

## Connection Flow

### Phase 1: Connection Initiation

**Step 1: User Clicks "Connect" in WordPress Admin**
- User navigates to Sigmize plugin page in WordPress admin
- If not authenticated, sees authentication page
- Clicks connect button which redirects to SaaS platform

**Step 2: Frontend Initiates Connection**
```
Frontend (app.sigmize.com) → POST /api/v1/connections/initiate
```

**Request:**
```json
{
  "redirect_url": "https://wordpress-site.com/wp-admin/admin.php?page=sigmize-dashboard"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "oauth_token": "64-character-temporary-token",
    "redirect_url": "https://wordpress-site.com/wp-admin/admin.php?page=sigmize-dashboard?oauth_token=TOKEN",
    "expires_at": "2024-01-01T12:00:00Z"
  }
}
```

**Laravel Implementation:**
- `ConnectionController::initiate()` method
- Creates `ConnectionToken` with:
  - 64-character random token
  - Expiration (typically 10 minutes)
  - Associated user and workspace
  - Redirect URL

**Step 3: Redirect to WordPress**
- Frontend redirects user to WordPress admin with `oauth_token` in URL
- URL format: `{redirect_url}?oauth_token={token}`

---

### Phase 2: Token Exchange

**Step 4: WordPress Receives OAuth Token**
- WordPress `Auth_Manager::handle_oauth_callback()` intercepts the callback
- Extracts `oauth_token` from URL parameters
- Calls token exchange endpoint

**Step 5: Exchange Temporary Token for Bearer Token**
```
WordPress → POST https://api.sigmize.com/api/v1/connections/exchange
```

**Request:**
```json
{
  "oauth_token": "64-character-temporary-token",
  "site_url": "https://wordpress-site.com/wp-json/sigmize/v1/"
}
```

**Laravel Processing:**
1. `ConnectionController::exchange()` receives request
2. `ConnectionService::exchangeToken()` validates token:
   - Checks if token exists in `connection_tokens` table
   - Verifies token hasn't expired
   - Verifies token hasn't been used
3. Creates/updates `Connection` record:
   - Links to user and workspace
   - Stores site URL
   - Sets status to 'active'
4. Generates Laravel Sanctum token:
   - `$user->createToken('WordPress Connection', ['*'])`
   - Full permissions granted
5. Marks connection token as used
6. Returns response

**Response:**
```json
{
  "success": true,
  "data": {
    "connection_id": "uuid-of-connection",
    "access_token": "sanctum-bearer-token",
    "workspace_uuid": "workspace-uuid"
  }
}
```

**Step 6: WordPress Stores Bearer Token**
- WordPress receives access token
- Stores in two places:
  1. **Secure Cookie** (primary) - via `Secure_Cookie_Manager`
     - Encrypted cookie with 30-day expiration
  2. **Database Option** (backup) - via `Encryption::encrypt()`
     - Encrypted and stored in `wp_options` table
- Stores additional data:
  - `sigmize_connection_id` - Connection UUID
  - `sigmize_workspace_uuid` - Workspace UUID
- Redirects to remove `oauth_token` from URL

---

### Phase 3: Authenticated API Communication

**Step 7: WordPress Makes Authenticated Requests**
All subsequent API calls include bearer token in Authorization header:

```
Authorization: Bearer {access_token}
```

**Example API Call:**
```php
$saas_client = new SaaS_Client();
$experiments = $saas_client->get('experiments');
```

**Request Headers:**
```
Authorization: Bearer {sanctum-token}
Accept: application/json
Content-Type: application/json
```

**Laravel Authentication:**
- Uses Laravel Sanctum middleware
- Validates bearer token
- Associates request with user and workspace
- Enforces authorization policies

---

## Key Components Deep Dive

### WordPress Plugin

#### 1. Auth_Manager Class
**File:** `includes/class-auth-manager.php`

**Key Methods:**
- `is_authenticated()` - Checks if bearer token exists
- `get_bearer_token()` - Retrieves token from cookie or database
- `handle_oauth_callback()` - Processes OAuth callback
- `exchange_token()` - Exchanges temporary token for bearer token
- `store_bearer_token()` - Stores token securely

**Constants:**
- `SAAS_AUTH_URL` = `https://app.sigmize.com/connect`
- `TOKEN_EXCHANGE_URL` = `https://api.sigmize.com/api/v1/connections/exchange`

#### 2. SaaS_Client Class
**File:** `includes/class-saas-client.php`

**Purpose:** HTTP client for API communication

**Methods:**
- `get($endpoint)` - GET requests
- `post($endpoint, $data)` - POST requests
- `put($endpoint, $data)` - PUT requests
- `patch($endpoint, $data)` - PATCH requests
- `delete($endpoint)` - DELETE requests

**Headers:**
- Automatically includes `Authorization: Bearer {token}` header
- Falls back to basic headers if no token available

#### 3. Rest_Controller Class
**File:** `includes/api/class-rest-controller.php`

**Purpose:** WordPress REST API endpoints for webhooks

**Endpoints:**
- `/sigmize/v1/sync` - Receives sync requests from Laravel
- `/sigmize/v1/auth/disconnect` - Handles disconnection

---

### Laravel Backend

#### 1. ConnectionController
**File:** `app/Http/Controllers/Api/V1/ConnectionController.php`

**Endpoints:**

**POST `/api/v1/connections/initiate`**
- Creates temporary connection token
- Returns OAuth token and redirect URL
- Requires authenticated user
- Validates email verification
- Checks connection limits

**POST `/api/v1/connections/exchange`**
- Exchanges temporary token for permanent bearer token
- Creates/updates Connection record
- Generates Sanctum token
- Returns connection details

**PATCH `/api/v1/connections/status`**
- Updates plugin version and experiments count
- Called periodically by WordPress plugin

**DELETE `/api/v1/connections/{uuid}/revoke`**
- Revokes connection
- Deletes Sanctum token
- Sets connection status to inactive

#### 2. ConnectionService
**File:** `app/Services/ConnectionService.php`

**Key Methods:**
- `initiateConnection()` - Creates ConnectionToken
- `exchangeToken()` - Exchanges token and creates Connection
- `revokeAccessToken()` - Revokes Sanctum token

#### 3. Connection Model
**Database Table:** `connections`

**Fields:**
- `id` - Primary key
- `uuid` - Public identifier
- `user_id` - Owner user
- `workspace_id` - Associated workspace
- `integration_name` - 'WordPress'
- `site_url` - WordPress site URL
- `status` - 'active' | 'inactive'
- `config` - JSON with access_token and metadata
- `plugin_version` - WordPress plugin version
- `experiments_count` - Number of synced experiments
- `last_sync_at` - Last sync timestamp

#### 4. ConnectionToken Model
**Database Table:** `connection_tokens`

**Fields:**
- `id` - Primary key
- `token` - 64-character random token
- `user_id` - Associated user
- `workspace_id` - Associated workspace
- `redirect_url` - WordPress callback URL
- `expires_at` - Token expiration
- `used_at` - When token was used (null if unused)

**Validation:**
- Token must be exactly 64 characters
- Token must not be expired
- Token must not be used
- Token expires after 10 minutes (configurable)

---

## Security Features

### 1. Token Security
- **Temporary Tokens:**
  - 64-character random strings
  - Short expiration (10 minutes)
  - Single-use only
  - Stored in database with expiration

- **Bearer Tokens:**
  - Laravel Sanctum tokens
  - Stored encrypted in WordPress
  - Can be revoked at any time
  - Full API permissions

### 2. Encryption
- WordPress stores bearer tokens encrypted
- Uses `Encryption` class for encryption/decryption
- Secure cookie storage as primary method
- Database storage as backup

### 3. Authorization
- Laravel uses policy-based authorization
- `ConnectionPolicy` controls access
- Users can only access their workspace connections
- Admin/owner can manage all workspace connections

### 4. Email Verification
- Users must verify email before creating connections
- Prevents unauthorized connections
- Verification email sent automatically

---

## API Endpoints Reference

### WordPress Plugin → Laravel API

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|----------------|
| POST | `/api/v1/connections/exchange` | Exchange OAuth token | No (public) |
| GET | `/api/v1/experiments` | Get experiments | Yes (Bearer) |
| POST | `/api/v1/experiments` | Create experiment | Yes (Bearer) |
| PUT | `/api/v1/experiments/{uuid}` | Update experiment | Yes (Bearer) |
| DELETE | `/api/v1/experiments/{uuid}` | Delete experiment | Yes (Bearer) |
| PATCH | `/api/v1/connections/status` | Update connection status | Yes (Bearer) |

### Laravel API → WordPress Plugin

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|----------------|
| POST | `/wp-json/sigmize/v1/sync` | Trigger sync | Webhook signature |
| POST | `/wp-json/sigmize/v1/auth/disconnect` | Disconnect | WordPress nonce |

---

## Data Flow Diagrams

### Connection Establishment Flow

```
┌─────────────┐
│   User      │
│ (WordPress) │
└──────┬──────┘
       │
       │ 1. Clicks "Connect"
       ▼
┌─────────────────────┐
│ WordPress Admin     │
│ Auth_Manager        │
└──────┬──────────────┘
       │
       │ 2. Redirect to SaaS
       ▼
┌─────────────────────┐
│ app.sigmize.com     │
│ Frontend            │
└──────┬──────────────┘
       │
       │ 3. POST /connections/initiate
       ▼
┌─────────────────────┐
│ Laravel API         │
│ ConnectionController│
└──────┬──────────────┘
       │
       │ 4. Create ConnectionToken
       │ 5. Return oauth_token
       ▼
┌─────────────────────┐
│ Frontend            │
│ Redirect with token │
└──────┬──────────────┘
       │
       │ 6. Redirect to WordPress
       │    ?oauth_token=XXX
       ▼
┌─────────────────────┐
│ WordPress           │
│ handle_oauth_callback│
└──────┬──────────────┘
       │
       │ 7. POST /connections/exchange
       ▼
┌─────────────────────┐
│ Laravel API         │
│ exchangeToken()     │
└──────┬──────────────┘
       │
       │ 8. Validate token
       │ 9. Create Connection
       │ 10. Generate Sanctum token
       │ 11. Return access_token
       ▼
┌─────────────────────┐
│ WordPress           │
│ Store bearer token  │
│ (encrypted)         │
└─────────────────────┘
```

### Authenticated Request Flow

```
┌─────────────────────┐
│ WordPress Plugin    │
│ SaaS_Client         │
└──────┬──────────────┘
       │
       │ GET /api/v1/experiments
       │ Authorization: Bearer {token}
       ▼
┌─────────────────────┐
│ Laravel API         │
│ Sanctum Middleware  │
└──────┬──────────────┘
       │
       │ Validate token
       │ Load user & workspace
       ▼
┌─────────────────────┐
│ ExperimentController│
│ Authorization       │
└──────┬──────────────┘
       │
       │ Check permissions
       │ Return data
       ▼
┌─────────────────────┐
│ WordPress Plugin    │
│ Process response    │
└─────────────────────┘
```

---

## Configuration

### WordPress Plugin Constants

Defined in `sigmize.php`:

```php
// API Base URL
define('SIGMIZE_SAAS_API_BASE_URL', 'https://api.sigmize.com');

// Frontend Base URL
define('SIGMIZE_SAAS_BASE_URL', 'https://app.sigmize.com');
```

### Laravel Configuration

**API Routes:** `routes/api/v1.php`
- All routes prefixed with `/api/v1`
- Protected by `auth:sanctum` middleware

**Connection Token Expiration:**
- Default: 10 minutes
- Configurable in `ConnectionToken` model

---

## Error Handling

### WordPress Plugin

**Token Exchange Failures:**
- Invalid token → Redirect with `auth_error=1`
- Expired token → Redirect with `auth_error=1`
- Network errors → Log and show error message

**API Request Failures:**
- 401 Unauthorized → Trigger re-authentication
- 403 Forbidden → Show permission error
- Network errors → Return WP_Error object

### Laravel Backend

**Validation Errors:**
- Returns 422 with validation messages
- Token format validation (must be 64 chars)
- Required fields validation

**Token Errors:**
- Invalid token → 400 "Invalid or expired token"
- Expired token → 400 "Invalid or expired token"
- Used token → 400 "Invalid or expired token"

**Authorization Errors:**
- 403 Forbidden with policy message
- 401 Unauthorized for missing/invalid bearer token

---

## Testing

### WordPress Plugin Tests
- E2E tests in `tests/e2e/`
- Tests connection flow
- Tests API communication
- Tests error handling

### Laravel Backend Tests
- Feature tests in `tests/Feature/Api/V1/`
- `ConnectionControllerTest.php` - Connection endpoints
- `ConnectionEmailVerificationTest.php` - Email verification
- Token validation tests
- Authorization tests

---

## Monitoring & Logging

### WordPress Plugin
- Errors logged via WordPress error logging
- Network errors captured
- Authentication failures tracked

### Laravel Backend
- Connection creation tracked in PostHog
- Connection deletion tracked in PostHog
- Errors logged to Laravel log
- Sanctum token usage tracked

---

## Best Practices

1. **Token Storage:**
   - Primary: Secure encrypted cookies
   - Backup: Encrypted database storage
   - Never store tokens in plain text

2. **Token Expiration:**
   - Temporary tokens: Short-lived (10 minutes)
   - Bearer tokens: Long-lived but revocable

3. **Error Handling:**
   - Always validate tokens before use
   - Handle network errors gracefully
   - Provide user-friendly error messages

4. **Security:**
   - Use HTTPS for all API communication
   - Encrypt sensitive data
   - Validate all inputs
   - Use authorization policies

---

## Conclusion

The Sigmize WordPress plugin connects to the Laravel backend using a secure OAuth-like flow:

1. **Initiation:** User initiates connection from WordPress
2. **Token Generation:** Laravel creates temporary OAuth token
3. **Redirect:** User redirected back to WordPress with token
4. **Exchange:** WordPress exchanges temporary token for permanent bearer token
5. **Storage:** Bearer token stored securely in WordPress
6. **Communication:** All subsequent API calls use bearer token authentication

The system is designed with security in mind, using:
- Short-lived temporary tokens
- Encrypted token storage
- Laravel Sanctum for API authentication
- Policy-based authorization
- Email verification requirements

---

## Related Files

### WordPress Plugin
- `sigmize.php` - Main plugin file
- `includes/class-auth-manager.php` - Authentication
- `includes/class-saas-client.php` - API client
- `includes/api/class-rest-controller.php` - REST endpoints

### Laravel Backend
- `app/Http/Controllers/Api/V1/ConnectionController.php` - Connection endpoints
- `app/Services/ConnectionService.php` - Connection logic
- `app/Models/Connection.php` - Connection model
- `app/Models/ConnectionToken.php` - Token model
- `routes/api/v1.php` - API routes

---

**Report Generated:** 2024
**Version:** 1.0
**Author:** AI Analysis

