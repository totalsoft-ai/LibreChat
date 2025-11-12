# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Recent Updates

### 2025-10-28: Conversation Export & Database Optimization

**Conversation Export Feature:**
- **Export Service**: New ExportService supporting JSON, Markdown, HTML, and PDF formats
- **API Endpoints**:
  - `GET /api/export/:conversationId?format={format}` - Export conversation in specified format
  - `GET /api/export/` - Get list of supported export formats
- **Security**: JWT authentication required, HTML escaping for XSS prevention
- **Files**: `api/server/services/ExportService.js`, `api/server/routes/export.js`, `docs/export-api.md`
- **Testing**: Comprehensive test coverage with 15+ test cases in `ExportService.spec.js`
- **Features**: Full conversation data export including metadata, messages, and user feedback

**Database Query Optimization:**
- **Performance**: Comprehensive database optimization achieving 8-10x query performance improvement and 60-75% memory reduction
- **Indexes**: Added 13 strategic compound indexes across Conversation, Message, and User models
  - Conversation: `user+updatedAt`, `user+isArchived+updatedAt`, `user+tags+updatedAt`, `user+expiredAt`
  - Message: `conversationId+createdAt`, `conversationId+user`, `user+createdAt`, compound indexes for deleteMessagesSince
  - User: `role`, `provider`, `createdAt`
- **Query Optimization**: Implemented `.lean()` for read-only operations and `.select()` to limit fields (files: `api/models/Conversation.js`, `api/models/Message.js`)
- **Development Tools**: Query profiler middleware for identifying slow queries (`api/server/middleware/queryProfiler.js`)
- **Documentation**: Comprehensive guides at `docs/database-optimization.md` and `DATABASE_OPTIMIZATION_SUMMARY.md`

### 2025-01-27: Frontend & Backend Improvements

**Backend:**
- **Memory Management**: Fixed memory leaks with StreamRunManager disposal pattern and timer management utilities (`api/server/utils/memoryManagement.js`)
- **Permissions System**: New PermissionService for fine-grained access control over agents, prompts, and files (`api/server/services/PermissionService.js`)
- **Model Pricing**: Enhanced token pricing with improved pattern matching (`api/models/tx.js`)
- **Testing**: 1600+ lines of test coverage for Permission Service, models, and services
- **MCP**: OAuth reconnection manager for automatic server reconnection after OAuth flow

**Frontend:**
- **Search Migration**: Completed Recoil to Jotai migration for search state across 8 files with 16 comprehensive tests
- **Error Boundaries**: Comprehensive error handling with ErrorBoundary and ErrorFallback components, 32 test cases
- **Bundle Optimization**: Reduced bundle size by ~50% through lazy loading of i18n (36 languages) and HEIC converter (544 KB)
- **State Management**: Continuing Recoil to Jotai migration (fontSize and search atoms migrated)

### 2025-10-24: Performance
- **Dependencies**: Updated Vite to v6.4.1, @playwright/test to v1.56.1, @librechat/agents to v2.4.86
- **Configuration**: Configurable Vite dev server domain and port

## Project Overview

LibreChat is an all-in-one AI conversation platform that integrates multiple AI models (OpenAI, Anthropic, Google, Azure, etc.) with a ChatGPT-inspired interface. It's a full-stack application with advanced features including:
- Multi-user authentication with OAuth2, LDAP, and email login
- AI Agents with marketplace support
- Model Context Protocol (MCP) integration
- Code interpreter API for sandboxed execution
- File handling, image generation, web search, and more
- Advanced permissions system for resource access control
- Comprehensive memory management and cleanup patterns
- Optimized database queries with strategic indexing

## Repository Structure

This is a monorepo workspace managed via npm workspaces:
- **api/** - Node.js/Express backend server
- **client/** - React/Vite frontend application
- **packages/** - Shared libraries:
  - **data-provider/** - API client and React Query hooks
  - **data-schemas/** - Shared schemas, validators, and utilities
  - **api/** - Backend API utilities and middleware (TypeScript)
  - **client/** - Shared client components

## Development Commands

### Initial Setup
```bash
npm install                    # Install all workspace dependencies
npm run reinstall              # Force reinstall (local development)
npm run update                 # Update dependencies
```

### Backend Development
```bash
npm run backend:dev            # Start backend in development mode (with nodemon)
npm run backend                # Start backend in production mode
npm run backend:stop           # Stop backend server
```

### Frontend Development
```bash
npm run frontend:dev           # Start Vite dev server (runs on http://localhost:3080)
npm run build:packages         # Build all shared packages (required before client build)
npm run frontend               # Build frontend for production
npm run build:client           # Build only the client package
```

### Testing
```bash
npm run test:api               # Run API unit tests
npm run test:client            # Run client unit tests
npm run e2e                    # Run Playwright e2e tests (local config)
npm run e2e:headed             # Run e2e tests with browser UI
npm run e2e:debug              # Debug e2e tests
npm run e2e:codegen            # Generate e2e test code with Playwright
npm run e2e:login              # Generate auth state for e2e tests
```

### Linting & Formatting
```bash
npm run lint                   # Lint all TypeScript/JavaScript files
npm run lint:fix               # Lint and auto-fix issues
npm run format                 # Format all files with Prettier
```

### Build Commands
```bash
npm run build:data-provider    # Build data-provider package
npm run build:data-schemas     # Build data-schemas package
npm run build:api              # Build API package (TypeScript)
npm run build:client-package   # Build client package
npm run build:packages         # Build all packages in order
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

### Advanced Operations
```bash
npm run reset-meili-sync       # Reset MeiliSearch sync
npm run update-banner          # Update site banner
npm run delete-banner          # Delete site banner
npm run reset-terms            # Reset terms of service acceptance
npm run flush-cache            # Flush application cache
npm run migrate:agent-permissions          # Migrate agent permissions
npm run migrate:prompt-permissions         # Migrate prompt permissions
```

### Bun Runtime (Alternative)
LibreChat supports Bun as an alternative runtime:
```bash
npm run b:api                  # Run API with Bun
npm run b:api:dev              # Run API in watch mode with Bun
npm run b:client:dev           # Run client dev server with Bun
npm run b:client               # Build client with Bun
npm run b:test:client          # Run client tests with Bun
npm run b:test:api             # Run API tests with Bun
```

## Architecture Overview

### Backend Architecture (api/)

**Entry Point:** `api/server/index.js`
- Initializes Express server, MongoDB connection, authentication strategies
- Configures middleware (CORS, compression, rate limiting, sessions)
- Loads routes, controllers, and services
- Handles file storage initialization
- Performs startup checks and database seeding
- Initializes MCP servers and OAuth reconnection manager
- Sets up query profiling in development mode

**Key Directories:**
- `api/server/routes/` - Express route definitions (RESTful endpoints)
- `api/server/controllers/` - Request handlers and business logic
- `api/server/middleware/` - Custom middleware (auth, rate limiting, validation, access control, query profiling)
- `api/server/services/` - Business logic and external integrations
- `api/models/` - Mongoose models for MongoDB collections
- `api/strategies/` - Passport authentication strategies (JWT, LDAP, OAuth)
- `api/db/` - Database connection and indexing logic
- `api/server/utils/` - Utility functions including memory management

**Database Models:**
The application uses MongoDB with Mongoose. Key models include:
- `User` - User accounts and authentication (indexed: email, role, provider, createdAt, OAuth IDs)
- `Conversation` - Chat conversation data (indexed: conversationId+user, user+updatedAt, user+isArchived+updatedAt, user+tags+updatedAt, user+expiredAt)
- `Message` - Individual chat messages (indexed: messageId+user, conversationId+createdAt, conversationId+user, user+createdAt)
- `Agent` - Custom AI agent configurations with enhanced permissions
- `Prompt` - Saved prompts and templates with group support
- `File` - File upload metadata
- `Assistant` - OpenAI assistant configurations
- `Transaction` - Token usage tracking with enhanced pricing patterns
- `ConversationTag` - Tagging system for conversations
- `Role` - Role-based access control

**Authentication Flow:**
1. Multiple strategies supported: Local (email/password), OAuth2 (Google, GitHub, Discord, etc.), LDAP, SAML
2. JWT tokens used for API authentication
3. Session management with Redis or in-memory store
4. Two-factor authentication (2FA) support
5. OAuth reconnection manager for MCP servers

**Permissions System:**
- Fine-grained access control for agents, prompts, and files
- Resource-level permissions with share capabilities
- People picker with directory integration support
- Middleware for validating resource access

**Query Optimization:**
- Strategic compound indexes for frequent query patterns
- `.lean()` for read-only operations (5-8x faster)
- `.select()` for field limitation (40-60% memory reduction)
- Query profiler middleware for development (configurable via `ENABLE_QUERY_PROFILER`, `SLOW_QUERY_THRESHOLD`, `LOG_ALL_QUERIES`)

### Frontend Architecture (client/)

**Entry Point:** `client/src/main.jsx`
- React 18 application
- Vite build system with optimized bundle splitting
- State management: Jotai (atomic state), Recoil (legacy), React Query (server state)
- Lazy-loaded i18n with 36 language support

**Key Directories:**
- `client/src/components/` - React components organized by feature
- `client/src/hooks/` - Custom React hooks
- `client/src/store/` - Jotai atoms for global state
- `client/src/routes/` - React Router route definitions
- `client/src/data-provider/` - Re-exports from packages/data-provider
- `client/src/utils/` - Utility functions
- `client/src/locales/` - i18n translations (lazy-loaded)

**Component Organization:**
Components are feature-based:
- `Chat/` - Main chat interface with error boundaries
- `Messages/` - Message rendering and interactions with UI resource carousels
- `Input/` - Chat input area with file attachments
- `Nav/` - Navigation sidebar with agent marketplace button, search functionality
- `Agents/` - Agent management and marketplace UI (extensive)
- `Artifacts/` - Code artifacts (generative UI)
- `Auth/` - Authentication screens
- `MCP/` - Model Context Protocol integration UI
- `ui/` - Reusable UI components (ErrorBoundary, ErrorFallback, etc.)

**State Management:**
- **Jotai** (primary): Atomic state for UI state, settings, user preferences
- **React Query**: Server state management, caching, and mutations
- **Recoil** (legacy): Being phased out, avoid using for new features

### Shared Packages (packages/)

**packages/data-provider/**
- API client layer using axios
- React Query hooks for data fetching and mutations
- Exports endpoints for all API routes
- Located in: `packages/data-provider/src/`

**packages/data-schemas/**
- Shared TypeScript/Zod schemas
- Validation utilities
- Constants and enums
- Winston logger configuration
- Mongoose schema definitions with optimized indexes
- Used by both frontend and backend

**packages/api/**
- Backend TypeScript utilities
- Middleware components
- Endpoint handlers and utilities
- MCP (Model Context Protocol) integration
- Agent and tool implementations
- Enhanced token pricing utilities

## Configuration

**Primary Configuration Files:**
- `.env` - Environment variables (copy from `.env.example`)
- `librechat.yaml` - Application configuration (copy from `librechat.example.yaml`)
  - AI endpoint configuration
  - Interface customization
  - File storage settings
  - Feature flags
  - MCP server configuration
  - Permissions configuration

**Environment Variables:**
- `PORT` - Server port (default: 3080)
- `HOST` - Server host (default: localhost)
- `MONGO_URI` - MongoDB connection string
- `DOMAIN_CLIENT` / `DOMAIN_SERVER` - Client and server URLs
- `VITE_DOMAIN` / `VITE_PORT` - Configurable Vite dev server settings
- API keys for various AI providers (OpenAI, Anthropic, Google, etc.)
- OAuth credentials for social login
- Storage configuration (S3, Firebase, local)
- Redis configuration for caching
- **Query Profiling**: `ENABLE_QUERY_PROFILER`, `SLOW_QUERY_THRESHOLD`, `LOG_ALL_QUERIES`

## Key Development Workflows

### Adding a New API Endpoint

1. Create route handler in `api/server/routes/`
2. Create controller in `api/server/controllers/`
3. Add business logic in controller or `api/server/services/`
4. Add access control middleware if needed (`api/server/middleware/accessResources/`)
5. Add Mongoose model if needed in `api/models/` with appropriate indexes
6. Add API client in `packages/data-provider/src/`
7. Add React Query hook in `packages/data-provider/react-query/`
8. Use the hook in frontend components
9. Write tests in `api/test/` and `client/test/`

### Adding a New UI Component

1. Create component in `client/src/components/[Feature]/`
2. Create associated hooks in `client/src/hooks/[Feature]/`
3. Add state atoms in `client/src/store/` if needed (use Jotai, not Recoil)
4. Use React Query hooks from data-provider for server state
5. Add translations in `client/src/locales/` if user-facing
6. Write comprehensive tests following Agent marketplace test patterns
7. Consider lazy loading for heavy components
8. Add error boundaries for critical UI sections

### Testing Strategy

- **Unit Tests**: Jest for both API (`api/test/`) and client (`client/test/`)
- **E2E Tests**: Playwright in `e2e/specs/`
- **E2E Setup**: Tests require running backend and use real MongoDB (memory server for CI)
- **Coverage**: Focus on critical paths, business logic, and user flows
- **Integration Tests**: Test component interactions and accessibility
- **Recent Additions**: Extensive test coverage for Agents, Models, Permissions, Services, Error Boundaries, Search functionality

### Working with Packages

When modifying shared packages:
1. Make changes in `packages/[package-name]/src/`
2. Build the package: `npm run build:[package-name]`
3. The workspace will automatically link the updated package
4. For continuous development, some packages support watch mode

**Build Order:** data-schemas → data-provider → api → client

### Memory Management Best Practices

Use the memory management utilities for proper cleanup:
```javascript
const { createManagedTimeout, clearAllTimers } = require('~/server/utils/memoryManagement');

class MyService {
  constructor() {
    this.timer = createManagedTimeout(this, () => {
      // Cleanup is automatic when object is GC'd
    }, 5000);
  }

  dispose() {
    clearAllTimers(this); // Clean up all managed timers
  }
}
```

### Database Query Optimization

Follow these best practices for optimal performance:
```javascript
// Use .lean() for read-only queries (5-8x faster)
const conversations = await Conversation.find({ user: userId })
  .select('conversationId title updatedAt')  // Limit fields (40-60% less memory)
  .sort({ updatedAt: -1 })
  .lean();

// Add indexes for frequently queried fields
conversationSchema.index({ user: 1, updatedAt: -1 });
messageSchema.index({ conversationId: 1, createdAt: 1 });

// Enable query profiling in development
// Set ENABLE_QUERY_PROFILER=true in .env
```

## Code Style & Patterns

- **Backend**: CommonJS modules (require/module.exports) in api/, ES modules in packages/api/
- **Frontend**: ES modules (import/export)
- **TypeScript**: Used in packages/ and gradually being adopted in client/
- **Async/Await**: Preferred over promises and callbacks
- **Error Handling**: Use try-catch blocks, centralized error handling in API, error boundaries in React
- **Database Queries**: Use Mongoose models with proper indexes, `.lean()` for read-only, `.select()` for field limitation
- **API Responses**: Consistent JSON structure with proper HTTP status codes
- **Memory Management**: Use managed timers and proper disposal patterns
- **Testing**: Comprehensive test coverage with unit, integration, and accessibility tests

## Common Issues & Solutions

### Package Build Issues
If you get module resolution errors, rebuild packages in order:
```bash
npm run build:packages
```

### Database Connection Issues
Ensure MongoDB is running and `MONGO_URI` is correct in `.env`

### Port Conflicts
If port 3080 is in use, change `PORT` in `.env` or use `PORT=0` for automatic assignment

### E2E Test Issues
- Ensure backend is not running separately when using `npm run e2e`
- Check `e2e/storageState.json` exists for authenticated tests
- Use `npm run e2e:login` to regenerate auth state

### Build Performance
Use Bun for faster builds: `npm run b:client` instead of `npm run build:client`

### Memory Leaks
- Use `memoryManagement.js` utilities for timers
- Ensure proper cleanup in dispose methods
- Use WeakMap for object associations
- Clear event listeners and Maps/Sets in cleanup

### Slow Database Queries
- Enable query profiling: `ENABLE_QUERY_PROFILER=true` in `.env`
- Check profiler logs for slow queries
- Add appropriate indexes based on query patterns
- Use `.lean()` for read-only operations
- Use `.select()` to limit returned fields
- See `docs/database-optimization.md` for detailed guidance

## Docker Development

```bash
docker-compose up              # Start all services (MongoDB, Redis, LibreChat)
npm run start:deployed         # Start deployed Docker configuration
npm run stop:deployed          # Stop deployed Docker configuration
npm run update:docker          # Update Docker deployment
```

## Important Notes

- **Monorepo**: This is a workspace monorepo; changes in packages/ affect both api/ and client/
- **librechat.yaml**: This file controls many features and AI endpoint configurations
- **MCP Support**: Model Context Protocol servers can be configured for custom tools with OAuth support
- **Agents**: Custom AI agents with tools, file search, and marketplace support
- **Authentication**: Multiple strategies; social login requires `ALLOW_SOCIAL_LOGIN=true`
- **File Storage**: Supports local, S3, and Firebase; configurable per file type in librechat.yaml
- **Caching**: Redis recommended for production; in-memory cache for development
- **Permissions**: Fine-grained access control for resources with sharing capabilities
- **Memory Management**: Use provided utilities to prevent leaks in long-running processes
- **Bundle Optimization**: Frontend uses lazy loading for i18n and heavy libraries
- **Testing**: Comprehensive test suite with focus on accessibility and integration
- **Database Optimization**: Strategic indexing and query optimization for 8-10x performance improvement
- **Query Profiling**: Development tool for identifying slow queries and optimization opportunities
