# TODO_BACKEND.md

Backend development tasks for LibreChat. See [CLAUDE_BACKEND.md](./CLAUDE_BACKEND.md) for architecture details.

## Legend
- 🔴 **High Priority** - Critical bugs or security issues
- 🟡 **Medium Priority** - Important features or improvements
- 🟢 **Low Priority** - Nice-to-have enhancements
- 🔧 **Tech Debt** - Code quality improvements
- 🧪 **Testing** - Test coverage improvements
- 📚 **Documentation** - Documentation needs

---

## 🔴 High Priority

### Security & Authentication
- [ ] 🔴 Audit all authentication endpoints for security vulnerabilities
  - [ ] Review JWT token validation in `api/server/middleware/`
  - [ ] Check rate limiting on login endpoints
  - [ ] Validate password reset flow for timing attacks
  - [ ] Audit OAuth2 callback handling
  - **File:** `api/strategies/`, `api/server/middleware/`

- [ ] 🔴 Implement CSRF protection for state-changing endpoints
  - [ ] Add CSRF tokens to forms
  - [ ] Validate tokens in middleware
  - **File:** `api/server/middleware/`

- [ ] 🔴 Add input validation for all API endpoints
  - [ ] Use Zod schemas from `@librechat/data-schemas`
  - [ ] Validate query parameters, body, and headers
  - [ ] Add sanitization for user-generated content
  - **File:** `api/server/controllers/`, `packages/data-schemas/`

### Database & Performance
- [x] 🔴 Optimize slow database queries ✅ 2025-10-28
  - [x] Add indexes for frequently queried fields
    - [x] Added compound indexes for Conversation model (user+updatedAt, user+isArchived+updatedAt, user+tags+updatedAt, user+expiredAt)
    - [x] Added compound indexes for Message model (conversationId+createdAt, conversationId+user, user+createdAt)
    - [x] Added indexes for User model (role, provider, createdAt)
  - [x] Review `User`, `Conversation`, `Message` model queries
    - [x] Optimized queries with `.lean()` for read-only operations in Conversation.js and Message.js
    - [x] Added `.select()` to limit returned fields and reduce memory usage
  - [x] Add query profiling in development
    - [x] Created query profiler middleware in `api/server/middleware/queryProfiler.js`
    - [x] Integrated profiler in database connection setup
    - [x] Added environment variables for configuration (ENABLE_QUERY_PROFILER, SLOW_QUERY_THRESHOLD, LOG_ALL_QUERIES)
  - [x] Created documentation in `docs/database-optimization.md`
  - **File:** `api/models/`, `api/db/`, `packages/data-schemas/src/schema/`, `api/server/middleware/queryProfiler.js`

- [x] 🔴 Fix memory leaks in long-running processes ✅ 2025-10-27
  - [x] Review event listener cleanup
  - [x] Check for unclosed database connections
  - [x] Added StreamRunManager.dispose() method for proper cleanup
  - [x] Removed global EventEmitter.defaultMaxListeners setting
  - [x] Created timer management utility (memoryManagement.js)
  - [x] Enhanced cleanup.js with automatic timer cleanup
  - [x] Added disposal calls in chatV1.js and chatV2.js
  - [ ] Monitor memory usage in production
  - **File:** `api/server/index.js`, `api/server/services/`, `api/server/utils/memoryManagement.js`

### Code Cleanup & Deprecation

- [ ] 🔴 Remove Code Interpreter API and all related backend code
  - [ ] Search and identify all Code Interpreter references: `grep -ri "code.?interpreter" api/`
  - [ ] Remove Code Interpreter API endpoints and routes
  - [ ] Delete Code Interpreter controllers and services
  - [ ] Remove Code Interpreter database models (if any)
  - [ ] Clean up Code Interpreter middleware
  - [ ] Remove Code Interpreter configuration from librechat.yaml
  - [ ] Delete Code Interpreter sandbox/execution logic
  - [ ] Remove Code Interpreter dependencies from package.json
  - [ ] Clean up environment variables related to Code Interpreter
  - [ ] Remove Code Interpreter from API documentation
  - [ ] Update schemas in packages/data-schemas
  - [ ] Test that removal doesn't break other features
  - **Files to check:**
    - `api/server/routes/` (remove Code Interpreter routes)
    - `api/server/controllers/` (remove Code Interpreter controllers)
    - `api/server/services/CodeInterpreter/` (delete entire folder if exists)
    - `api/models/` (remove Code Interpreter models if any)
    - `api/server/middleware/` (remove Code Interpreter middleware)
    - `packages/api/src/` (remove Code Interpreter utilities)
    - `packages/data-schemas/src/` (remove Code Interpreter schemas)
    - `librechat.yaml` (remove Code Interpreter config)
    - `.env.example` (remove Code Interpreter environment variables)
    - Search for imports: `grep -r "CodeInterpreter\|codeInterpreter\|code-interpreter" api/`
    - Search for sandbox/execution related code

---

## 🟡 Medium Priority

### Features & Enhancements

- [ ] 🟡 Add pagination to conversation and message endpoints
  - [ ] Implement cursor-based pagination
  - [ ] Add `limit` and `offset` query parameters
  - [ ] Update API response format
  - **File:** `api/server/controllers/conversations.js`, `api/server/controllers/messages.js`

- [ ] 🟡 Implement webhook support for external integrations
  - [ ] Create webhook registration endpoint
  - [ ] Add webhook event triggering
  - [ ] Implement retry logic for failed webhooks
  - **File:** `api/server/routes/webhooks.js`, `api/server/services/webhooks.js` (new)

- [ ] 🟡 Add support for custom AI model providers
  - [ ] Create plugin system for model integrations
  - [ ] Document plugin API
  - [ ] Add example plugin
  - **File:** `api/server/services/models/` (new)

- [ ] 🟡 Implement conversation export (JSON, Markdown, PDF)
  - [ ] Create export service
  - [ ] Add export endpoint
  - [ ] Support different formats
  - **File:** `api/server/services/export.js` (new), `api/server/routes/export.js` (new)

- [ ] 🟡 Add conversation search with full-text search
  - [ ] Integrate MeiliSearch or Elasticsearch
  - [ ] Index conversations and messages
  - [ ] Create search API endpoint
  - **File:** `api/server/services/search.js`, `api/server/routes/search.js`

### API Improvements

- [ ] 🟡 Standardize API response format across all endpoints
  - [ ] Create response wrapper utility
  - [ ] Ensure consistent error format
  - [ ] Add API versioning (v1, v2)
  - **File:** `api/server/utils/response.js` (new), `api/server/routes/`

- [ ] 🟡 Add GraphQL API alongside REST
  - [ ] Set up Apollo Server
  - [ ] Create GraphQL schema
  - [ ] Implement resolvers
  - **File:** `api/server/graphql/` (new)

- [ ] 🟡 Implement real-time notifications via WebSocket
  - [ ] Set up Socket.IO or native WebSocket
  - [ ] Handle user presence
  - [ ] Push notifications for new messages
  - **File:** `api/server/websocket/` (new)

### Database & Models

- [ ] 🟡 Add soft delete for conversations and messages
  - [ ] Add `deletedAt` field to models
  - [ ] Update queries to exclude soft-deleted items
  - [ ] Create restore endpoint
  - **File:** `api/models/Conversation.js`, `api/models/Message.js`

- [ ] 🟡 Implement database backup automation
  - [ ] Create backup script
  - [ ] Schedule daily backups
  - [ ] Store backups in S3 or cloud storage
  - **File:** `api/scripts/backup.js` (new)

- [ ] 🟡 Add database migrations system
  - [ ] Use migrate-mongo or similar tool
  - [ ] Document migration process
  - [ ] Create migration for existing data
  - **File:** `api/migrations/` (new)

---

## 🟢 Low Priority

### Nice-to-Have Features

- [ ] 🟢 Add conversation folders/categories
  - [ ] Create Folder model
  - [ ] Add folder assignment to conversations
  - [ ] Create folder management endpoints
  - **File:** `api/models/Folder.js` (new), `api/server/controllers/folders.js` (new)

- [ ] 🟢 Implement conversation templates
  - [ ] Create Template model
  - [ ] Add template creation/usage endpoints
  - [ ] Support variable replacement
  - **File:** `api/models/Template.js` (new)

- [ ] 🟢 Add conversation analytics and usage statistics
  - [ ] Track message counts, token usage, response times
  - [ ] Create analytics endpoints
  - [ ] Add admin dashboard data
  - **File:** `api/server/services/analytics.js` (new)

- [ ] 🟢 Support for conversation sharing with public links
  - [ ] Generate shareable links
  - [ ] Add public view endpoint
  - [ ] Support password protection
  - **File:** `api/server/controllers/share.js` (new)

- [ ] 🟢 Add email notifications for important events
  - [ ] Set up email templates
  - [ ] Send welcome emails
  - [ ] Send weekly digest emails
  - **File:** `api/server/services/email.js`

---

## 🔧 Tech Debt

### Code Quality

- [ ] 🔧 Migrate `api/server/` from JavaScript to TypeScript
  - [ ] Start with routes and controllers
  - [ ] Add type definitions
  - [ ] Configure tsconfig.json for api/
  - **File:** `api/server/routes/`, `api/server/controllers/`

- [ ] 🔧 Refactor large controller functions into services
  - [ ] Move business logic to services
  - [ ] Keep controllers thin (only request/response handling)
  - [ ] Improve separation of concerns
  - **File:** `api/server/controllers/`, `api/server/services/`

- [ ] 🔧 Remove deprecated code and unused dependencies
  - [ ] Audit package.json for unused packages
  - [ ] Remove commented-out code
  - [ ] Delete unused utility functions
  - **File:** `api/package.json`, `api/server/utils/`

- [ ] 🔧 Standardize error handling across all endpoints
  - [ ] Create centralized error handler middleware
  - [ ] Use custom error classes
  - [ ] Log errors consistently
  - **File:** `api/server/middleware/errorHandler.js` (new)

- [ ] 🔧 Add JSDoc comments to all public functions
  - [ ] Document parameters, return types, and examples
  - [ ] Generate API documentation from JSDoc
  - **File:** All files in `api/server/`

### Configuration & Environment

- [ ] 🔧 Validate environment variables on startup
  - [ ] Use Zod or similar for validation
  - [ ] Provide clear error messages for missing vars
  - [ ] Document all required environment variables
  - **File:** `api/server/index.js`, `api/config/` (new)

- [ ] 🔧 Externalize configuration to `librechat.yaml`
  - [ ] Move hardcoded values to config file
  - [ ] Add config validation
  - [ ] Document all config options
  - **File:** `librechat.yaml`, `api/config/`

### Performance

- [ ] 🔧 Implement Redis caching for frequently accessed data
  - [ ] Cache user profiles
  - [ ] Cache AI model configurations
  - [ ] Add cache invalidation logic
  - **File:** `api/cache/`, `api/server/services/`

- [ ] 🔧 Optimize file upload handling
  - [ ] Stream large files instead of loading into memory
  - [ ] Add progress tracking
  - [ ] Implement resumable uploads
  - **File:** `api/server/middleware/upload.js`

- [ ] 🔧 Add database connection pooling optimization
  - [ ] Tune pool size for production
  - [ ] Monitor connection usage
  - [ ] Add connection timeout handling
  - **File:** `api/db/`

---

## 🧪 Testing

### Test Coverage

- [ ] 🧪 Increase unit test coverage to 80%+
  - [ ] Focus on controllers and services
  - [ ] Test error handling paths
  - [ ] Test edge cases
  - **File:** `api/test/`

- [ ] 🧪 Add integration tests for critical API flows
  - [ ] Test user registration and login
  - [ ] Test conversation creation and messaging
  - [ ] Test file upload and retrieval
  - **File:** `api/test/integration/` (new)

- [ ] 🧪 Add API endpoint tests for all routes
  - [ ] Test success cases
  - [ ] Test validation errors (400 responses)
  - [ ] Test authentication errors (401, 403)
  - **File:** `api/test/routes/` (new)

- [ ] 🧪 Add performance/load testing
  - [ ] Use k6 or Artillery
  - [ ] Test concurrent users
  - [ ] Identify bottlenecks
  - **File:** `api/test/load/` (new)

### Test Infrastructure

- [ ] 🧪 Set up test database with seeded data
  - [ ] Create test fixtures
  - [ ] Add data seeding scripts
  - [ ] Ensure tests are isolated
  - **File:** `api/test/fixtures/` (new)

- [ ] 🧪 Add CI/CD pipeline for automated testing
  - [ ] Run tests on every PR
  - [ ] Add coverage reporting
  - [ ] Fail builds on test failures
  - **File:** `.github/workflows/` (if using GitHub Actions)

- [ ] 🧪 Mock external API calls in tests
  - [ ] Mock OpenAI, Anthropic, etc.
  - [ ] Use nock or msw for HTTP mocking
  - [ ] Ensure tests don't make real API calls
  - **File:** `api/test/mocks/` (new)

---

## 📚 Documentation

- [ ] 📚 Generate OpenAPI/Swagger documentation for all endpoints
  - [ ] Add Swagger annotations to routes
  - [ ] Generate interactive API docs
  - [ ] Host docs at `/api-docs`
  - **File:** `api/server/routes/`, `api/swagger.yaml` (new)

- [ ] 📚 Document database schema and relationships
  - [ ] Create ERD (Entity Relationship Diagram)
  - [ ] Document each model's purpose and fields
  - [ ] Add examples of common queries
  - **File:** `docs/database.md` (new)

- [ ] 📚 Create API integration guide for external developers
  - [ ] Document authentication flow
  - [ ] Provide code examples (curl, JavaScript, Python)
  - [ ] Add rate limiting information
  - **File:** `docs/api-integration.md` (new)

- [ ] 📚 Document deployment process
  - [ ] Production setup guide
  - [ ] Docker deployment
  - [ ] Environment variable reference
  - **File:** `docs/deployment.md` (new)

- [ ] 📚 Add inline code comments for complex logic
  - [ ] Explain non-obvious algorithms
  - [ ] Document workarounds and edge cases
  - [ ] Add TODO comments for known issues
  - **File:** All files in `api/server/`

---

## 🐛 Known Issues (from Code Scan)

_This section should be populated after running code analysis tools or reviewing TODOs/FIXMEs in the codebase._

- [ ] Search for TODO comments: `grep -r "TODO" api/`
- [ ] Search for FIXME comments: `grep -r "FIXME" api/`
- [ ] Search for HACK comments: `grep -r "HACK" api/`
- [ ] Review console.log statements (should use logger): `grep -r "console\\.log" api/`
- [ ] Check for unhandled promise rejections
- [ ] Audit for SQL injection vulnerabilities (if using raw queries)
- [ ] Check for path traversal vulnerabilities in file operations

---

## 📝 Notes

- **Priority Review:** Review and update priorities quarterly based on user feedback and business needs
- **Code Review:** All changes should go through code review before merging
- **Testing:** Write tests for all new features and bug fixes
- **Documentation:** Update CLAUDE_BACKEND.md when architecture changes
- **Dependencies:** Keep dependencies up to date; run `npm audit` regularly

---

## 🎯 Quick Wins (Easy Tasks to Start With)

1. Add JSDoc comments to 5 controller functions
2. Write unit tests for 1 service module
3. Add input validation to 3 endpoints using Zod
4. Fix 5 TODO comments in the codebase
5. Add indexes to 3 frequently queried fields

---

**Last Updated:** 2025-01-27
**Maintainer:** Development Team
**Related:** [TODO_FRONTEND.md](./TODO_FRONTEND.md) | [CLAUDE_BACKEND.md](./CLAUDE_BACKEND.md)
