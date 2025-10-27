# CLAUDE_BACKEND.md

Backend-specific guidance for LibreChat development. For general project overview, see [CLAUDE.md](./CLAUDE.md).

## Recent Updates (2025-01-27)

- **Memory Management**: Fixed memory leaks with StreamRunManager disposal pattern and comprehensive timer management utilities (`api/server/utils/memoryManagement.js`).
- **Permissions System**: New PermissionService for fine-grained access control over agents, prompts, and files with sharing capabilities (`api/server/services/PermissionService.js`, `api/server/middleware/accessResources/`).
- **Model Pricing**: Enhanced token pricing with improved pattern matching for model variants and better coverage (`api/models/tx.js`, `api/models/tx.spec.js`).
- **Testing**: Added 1600+ lines of test coverage for Permission Service, extensive model tests, and service tests.
- **MCP Enhancements**: OAuth reconnection manager for automatic MCP server reconnection after OAuth flow (`api/server/services/initializeOAuthReconnectManager.js`).
- **File Processing**: Improved file citations and document handling with context fields for Anthropic documents.
- **Database**: Added ConversationTag model for tagging system.

## Project Overview

LibreChat is an all-in-one AI conversation platform. This document focuses on the **backend architecture** (Node.js/Express API server).

**Key Backend Features:**
- Multi-user authentication (OAuth2, LDAP, JWT, SAML)
- RESTful API with Express
- MongoDB database with Mongoose ODM
- AI model integrations (OpenAI, Anthropic, Google, Azure, etc.)
- Model Context Protocol (MCP) integration with OAuth support
- File handling and storage (local, S3, Firebase)
- Rate limiting and security middleware
- WebSocket support for real-time features
- Fine-grained permissions system for resource access control
- Comprehensive memory management utilities
- Enhanced model pricing and token tracking

## Backend Repository Structure

```
api/
├── server/
│   ├── index.js              # Main entry point
│   ├── routes/               # Express route definitions
│   │   └── accessPermissions.js  # Resource permission routes (NEW)
│   ├── controllers/          # Request handlers & business logic
│   │   └── PermissionsController.js  # Permission management (NEW)
│   ├── middleware/           # Custom middleware (auth, rate limiting, etc.)
│   │   └── accessResources/  # Access control middleware (NEW)
│   │       ├── canAccessAgentResource.js
│   │       ├── canAccessPromptGroupResource.js
│   │       └── fileAccess.js
│   ├── services/             # Business logic & external integrations
│   │   ├── PermissionService.js      # Permission logic (NEW)
│   │   ├── GraphApiService.js        # MS Graph integration (NEW)
│   │   └── initializeOAuthReconnectManager.js  # MCP OAuth (NEW)
│   └── utils/                # Utility functions
│       └── memoryManagement.js  # Memory leak prevention (NEW)
├── models/                   # Mongoose models for MongoDB
│   └── ConversationTag.js    # Tagging system (NEW)
├── strategies/               # Passport authentication strategies
├── db/                       # Database connection & indexing
├── test/                     # Backend unit tests (extensive coverage)
└── cache/                    # Caching utilities

packages/
├── api/                      # Backend TypeScript utilities
│   ├── src/middleware/       # Shared middleware
│   ├── src/utils/            # Backend utilities (enhanced token pricing)
│   ├── src/endpoints/        # Endpoint handlers
│   └── src/files/            # File processing utilities
└── data-schemas/             # Shared schemas & validators (used by backend & frontend)
```

## Backend Development Commands

### Starting the Backend

```bash
# Development mode (with nodemon hot-reload)
npm run backend:dev

# Production mode
npm run backend

# Stop backend server
npm run backend:stop

# Run with Bun (alternative runtime)
npm run b:api:dev             # Development with Bun
npm run b:api                 # Production with Bun
```

### Database & User Management

```bash
npm run create-user            # Create a new user
npm run invite-user            # Generate invite for new user
npm run list-users             # List all users
npm run reset-password         # Reset user password
npm run ban-user               # Ban a user
npm run delete-user            # Delete a user
npm run add-balance            # Add balance to user account
npm run list-balances          # List user balances
```

### Advanced Backend Operations

```bash
npm run reset-meili-sync       # Reset MeiliSearch sync
npm run update-banner          # Update site banner
npm run delete-banner          # Delete site banner
npm run reset-terms            # Reset terms of service acceptance
npm run flush-cache            # Flush application cache
npm run migrate:agent-permissions          # Migrate agent permissions
npm run migrate:prompt-permissions         # Migrate prompt permissions
```

### Testing

```bash
npm run test:api               # Run API unit tests
npm run b:test:api             # Run API tests with Bun
```

### Building

```bash
npm run build:api              # Build API package (TypeScript in packages/api)
npm run build:data-schemas     # Build shared schemas
```

## Backend Architecture

### Entry Point: `api/server/index.js`

The main server file that:
1. Initializes Express server
2. Connects to MongoDB
3. Configures middleware (CORS, compression, rate limiting, sessions)
4. Loads Passport authentication strategies
5. Registers route handlers
6. Initializes file storage (local/S3/Firebase)
7. Performs startup checks and database seeding
8. Starts listening on configured PORT

### Key Directories

**`api/server/routes/`** - Express route definitions (RESTful endpoints)
- Each file typically handles a resource (e.g., `auth.js`, `conversations.js`, `messages.js`)
- Routes delegate to controllers for business logic

**`api/server/controllers/`** - Request handlers and business logic
- Process incoming requests
- Validate input (often with Zod schemas from data-schemas)
- Call services for complex operations
- Return consistent JSON responses

**`api/server/middleware/`** - Custom middleware
- Authentication (`requireJwtAuth`, `requireLocalAuth`)
- Rate limiting (`limiters.js`)
- Input validation
- Error handling
- Request logging

**`api/server/services/`** - Business logic and external integrations
- AI model API calls
- File processing
- Email services
- Complex business operations

**`api/models/`** - Mongoose models for MongoDB collections
- Define schemas and data validation
- Provide query methods
- Handle relationships between collections

**`api/strategies/`** - Passport authentication strategies
- JWT authentication
- Local (email/password)
- OAuth2 (Google, GitHub, Discord, etc.)
- LDAP
- SAML

**`api/db/`** - Database connection and indexing logic
- MongoDB connection setup
- Index creation for performance
- Database migrations

### Database Models

The application uses **MongoDB** with **Mongoose ODM**. Key models:

| Model | Purpose |
|-------|---------|
| `User` | User accounts, authentication, preferences |
| `Conversation` | Chat conversation metadata |
| `Message` | Individual chat messages |
| `Agent` | Custom AI agent configurations with enhanced permissions |
| `Prompt` | Saved prompts and templates with group support |
| `File` | File upload metadata and storage references |
| `Assistant` | OpenAI assistant configurations |
| `Transaction` | Token usage tracking and billing with enhanced pricing |
| `Key` | API key management |
| `Session` | User session data |
| `ConversationTag` | Tagging system for organizing conversations (NEW) |
| `Role` | Role-based access control |

**Model Location:** `api/models/[ModelName].js`

**Recent Enhancements:**
- Agent and Prompt models now include permission fields for fine-grained access control
- Transaction model enhanced with improved pricing pattern matching
- File model includes permission metadata for access control

### Authentication Flow

1. **Local Authentication:**
   - User submits email/password
   - Passport local strategy validates credentials
   - JWT token issued on success
   - Token stored client-side (localStorage/cookies)

2. **OAuth2 Authentication:**
   - User clicks "Login with Google/GitHub/etc."
   - Redirected to OAuth provider
   - Provider returns authorization code
   - Backend exchanges code for user info
   - User created/updated in database
   - JWT token issued

3. **JWT Token Validation:**
   - Client sends JWT in `Authorization: Bearer <token>` header
   - `requireJwtAuth` middleware validates token
   - User object attached to `req.user`
   - Protected routes can access user data

4. **Session Management:**
   - Redis (production) or in-memory (development)
   - Session expiration configurable
   - Two-factor authentication (2FA) support

5. **MCP OAuth Flow:**
   - OAuth reconnection manager handles token refresh after auth flow
   - Automatic MCP server reconnection after successful OAuth
   - Managed in `api/server/services/initializeOAuthReconnectManager.js`

### Memory Management

LibreChat includes comprehensive memory management utilities to prevent leaks in long-running processes.

**Location:** `api/server/utils/memoryManagement.js`

**Key Features:**
- Managed timers with automatic cleanup (createManagedTimeout, createManagedInterval)
- WeakMap-based timer registry for automatic GC cleanup
- Event emitter cleanup utilities
- Stream disposal helpers
- Async iterator cleanup

**Usage Example:**
```javascript
const { createManagedTimeout, clearAllTimers } = require('~/server/utils/memoryManagement');

class MyService {
  constructor() {
    // Timers are auto-tracked and cleaned up when context is GC'd
    this.timer = createManagedTimeout(this, () => {
      console.log('Periodic task');
    }, 5000);
  }

  dispose() {
    clearAllTimers(this); // Clean up all managed timers for this context
  }
}
```

**Integration:**
- StreamRunManager includes comprehensive dispose() method
- cleanup.js enhanced with automatic timer cleanup
- All long-running services should use managed timers

### Permissions System

New fine-grained access control system for resources (Agents, Prompts, Files).

**Location:** `api/server/services/PermissionService.js`, `api/server/middleware/accessResources/`

**Features:**
- Resource-level permissions (read, write, share)
- User and group-based access control
- Share capabilities with external users
- People picker with directory integration (Microsoft Graph API)
- Middleware for validating access before operations

**Usage in Routes:**
```javascript
const { canAccessAgentResource } = require('~/server/middleware/accessResources');

router.get('/agents/:id',
  requireJwtAuth,
  canAccessAgentResource,
  agentController.get
);
```

**Checking Permissions:**
```javascript
const PermissionService = require('~/server/services/PermissionService');

const hasAccess = await PermissionService.checkAccess({
  userId: req.user.id,
  resourceType: 'agent',
  resourceId: agentId,
  action: 'read'
});
```

### API Response Format

All API responses should follow a consistent structure:

**Success Response:**
```json
{
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Optional detailed error information"
}
```

**HTTP Status Codes:**
- `200` - OK (successful GET, PUT, PATCH)
- `201` - Created (successful POST)
- `204` - No Content (successful DELETE)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Configuration

### Environment Variables (`.env`)

**Required Backend Variables:**
```bash
# Server Configuration
PORT=3080                          # Server port
HOST=localhost                     # Server host
NODE_ENV=development              # Environment (development/production)

# Database
MONGO_URI=mongodb://localhost:27017/librechat

# JWT Authentication
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret
SESSION_EXPIRY=1000 * 60 * 15     # 15 minutes
REFRESH_TOKEN_EXPIRY=1000 * 60 * 60 * 24 * 7  # 7 days

# AI Provider API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_KEY=...
AZURE_OPENAI_API_KEY=...

# OAuth Credentials (if using social login)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# File Storage
FILE_STORAGE_BACKEND=local        # local, s3, or firebase
# For S3:
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=...

# Redis (recommended for production)
REDIS_URI=redis://localhost:6379

# Email (for password reset, etc.)
EMAIL_SERVICE=gmail
EMAIL_USERNAME=...
EMAIL_PASSWORD=...
```

### Application Configuration (`librechat.yaml`)

Backend-relevant sections:
- **Endpoints:** AI model endpoint configurations
- **FileStrategy:** File upload/storage settings per file type
- **RateLimits:** API rate limiting configuration
- **Registration:** User registration settings
- **Features:** Feature flags (social login, file uploads, etc.)

## Development Workflows

### Adding a New API Endpoint

1. **Create Route Handler** in `api/server/routes/`
   ```javascript
   // api/server/routes/myFeature.js
   const express = require('express');
   const { myController } = require('../controllers/myFeature');
   const { requireJwtAuth } = require('../middleware');

   const router = express.Router();
   router.get('/', requireJwtAuth, myController.getAll);
   router.post('/', requireJwtAuth, myController.create);

   module.exports = router;
   ```

2. **Create Controller** in `api/server/controllers/`
   ```javascript
   // api/server/controllers/myFeature.js
   const { MyModel } = require('~/models');

   const getAll = async (req, res) => {
     try {
       const items = await MyModel.find({ userId: req.user.id });
       res.json({ data: items });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   };

   module.exports = { getAll };
   ```

3. **Add Mongoose Model** (if needed) in `api/models/`
   ```javascript
   // api/models/MyModel.js
   const mongoose = require('mongoose');

   const mySchema = mongoose.Schema({
     userId: { type: String, required: true, index: true },
     name: { type: String, required: true },
     createdAt: { type: Date, default: Date.now }
   });

   module.exports = mongoose.model('MyModel', mySchema);
   ```

4. **Register Route** in `api/server/index.js`
   ```javascript
   const myFeatureRouter = require('./routes/myFeature');
   app.use('/api/myfeature', myFeatureRouter);
   ```

5. **Add API Client** in `packages/data-provider/src/`
   (This connects backend to frontend - see CLAUDE_FRONTEND.md)

6. **Write Tests** in `api/test/`
   ```javascript
   // api/test/myFeature.test.js
   const request = require('supertest');
   const app = require('../server');

   describe('MyFeature API', () => {
     it('should get all items', async () => {
       const res = await request(app)
         .get('/api/myfeature')
         .set('Authorization', `Bearer ${token}`);
       expect(res.status).toBe(200);
     });
   });
   ```

### Working with Mongoose Models

**Creating Documents:**
```javascript
const newUser = await User.create({
  email: 'user@example.com',
  name: 'John Doe'
});
```

**Querying:**
```javascript
// Find one
const user = await User.findById(userId);
const user = await User.findOne({ email: 'user@example.com' });

// Find many
const users = await User.find({ role: 'admin' });
const users = await User.find({ createdAt: { $gte: startDate } })
  .sort({ createdAt: -1 })
  .limit(10);
```

**Updating:**
```javascript
await User.updateOne({ _id: userId }, { name: 'New Name' });
await User.findByIdAndUpdate(userId, { name: 'New Name' }, { new: true });
```

**Deleting:**
```javascript
await User.deleteOne({ _id: userId });
await User.findByIdAndDelete(userId);
```

### Database Indexing

Always add indexes for frequently queried fields:

```javascript
// In model schema
const mySchema = mongoose.Schema({
  userId: { type: String, required: true, index: true },
  email: { type: String, unique: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true }
});

// Compound indexes
mySchema.index({ userId: 1, createdAt: -1 });
```

### Error Handling Best Practices

```javascript
const myController = async (req, res) => {
  try {
    // Validate input
    const schema = z.object({
      name: z.string().min(1)
    });
    const validated = schema.parse(req.body);

    // Business logic
    const result = await MyService.doSomething(validated);

    // Success response
    res.status(200).json({ data: result });
  } catch (error) {
    // Log error (use logger from data-schemas)
    logger.error('Error in myController:', error);

    // Zod validation error
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }

    // Generic error
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

## Testing Backend Code

### Unit Tests

Tests are located in `api/test/` and use **Jest**.

```bash
# Run all API tests
npm run test:api

# Run specific test file
npm test -- api/test/myFeature.test.js

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### Writing Tests

```javascript
const request = require('supertest');
const app = require('../server');
const { User } = require('~/models');

describe('User API', () => {
  let token;

  beforeAll(async () => {
    // Setup: create test user, get auth token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    token = res.body.token;
  });

  afterAll(async () => {
    // Cleanup: delete test data
    await User.deleteMany({ email: 'test@example.com' });
  });

  it('should get user profile', async () => {
    const res = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('email');
  });
});
```

## Code Style & Patterns

### Module System
- **api/**: CommonJS modules (`require` / `module.exports`)
- **packages/api/**: ES modules (`import` / `export`)

### Async/Await
Preferred over promises and callbacks:

```javascript
// Good
async function getUser(id) {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    logger.error('Error fetching user:', error);
    throw error;
  }
}

// Avoid
function getUser(id) {
  return User.findById(id)
    .then(user => user)
    .catch(error => {
      logger.error('Error fetching user:', error);
      throw error;
    });
}
```

### TypeScript Migration
- `packages/api/` is TypeScript
- `api/server/` is gradually being migrated to TypeScript
- When adding new files, prefer TypeScript (`.ts`) over JavaScript (`.js`)

## Common Backend Issues & Solutions

### Database Connection Issues

**Problem:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
1. Ensure MongoDB is running: `mongod` or via Docker
2. Check `MONGO_URI` in `.env`
3. Verify MongoDB port (default: 27017)

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3080`

**Solution:**
```bash
# Find process using port 3080
lsof -i :3080  # macOS/Linux
netstat -ano | findstr :3080  # Windows

# Kill the process or change PORT in .env
PORT=3081 npm run backend:dev
```

### Authentication Errors

**Problem:** `401 Unauthorized` on protected routes

**Solution:**
1. Verify JWT token is being sent in `Authorization: Bearer <token>` header
2. Check `JWT_SECRET` matches between token generation and validation
3. Ensure token hasn't expired (`SESSION_EXPIRY`)
4. Check middleware order in route definitions

### Slow Database Queries

**Problem:** API endpoints responding slowly

**Solution:**
1. Add indexes to frequently queried fields
2. Use `.lean()` for read-only queries (skips Mongoose hydration)
3. Use `.select()` to limit returned fields
4. Add query logging to identify slow queries:
   ```javascript
   mongoose.set('debug', true);  // Development only
   ```

### Memory Leaks

**Problem:** Backend memory usage increasing over time

**Solution:**
1. Avoid storing large objects in memory (use Redis)
2. Close database connections properly
3. Remove event listeners when done
4. Use streaming for large file uploads/downloads

### Rate Limiting Issues

**Problem:** Legitimate users being rate limited

**Solution:**
1. Adjust rate limits in `librechat.yaml` or middleware
2. Implement user-based (not IP-based) rate limiting for authenticated routes
3. Use Redis for distributed rate limiting (if using multiple servers)

## Docker Development

```bash
# Start all services (MongoDB, Redis, LibreChat backend)
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up --build
```

## Important Backend Notes

- **Monorepo:** Changes in `packages/data-schemas` affect backend validation
- **librechat.yaml:** Controls AI endpoints, rate limits, file storage, features, permissions
- **Authentication:** JWT tokens for API, session cookies for OAuth flows, MCP OAuth reconnection support
- **File Storage:** Configurable (local/S3/Firebase) per file type in librechat.yaml
- **Caching:** Redis recommended for production; in-memory for development
- **MCP Integration:** Model Context Protocol servers for custom AI tools with OAuth support
- **Database:** MongoDB is required; ensure proper indexing for performance
- **Security:** Always validate input, use rate limiting, sanitize user data
- **Logging:** Use logger from `@librechat/data-schemas` (Winston-based)
- **Memory Management:** Use utilities in `memoryManagement.js` for all timers and cleanup
- **Permissions:** Fine-grained access control available for agents, prompts, and files
- **Testing:** Comprehensive test suite with focus on services, models, and permissions
- **Pricing:** Enhanced model pricing with pattern matching for variants and better coverage

## Useful Resources

- **Mongoose Docs:** https://mongoosejs.com/docs/
- **Express Docs:** https://expressjs.com/
- **Passport.js:** http://www.passportjs.org/
- **Zod (validation):** https://zod.dev/

---

For frontend development, see [CLAUDE_FRONTEND.md](./CLAUDE_FRONTEND.md).
For general project info, see [CLAUDE.md](./CLAUDE.md).
