# LibreChat Documentation

This directory contains comprehensive documentation for the LibreChat project.

## 📊 Architecture Documentation

### Frontend Architecture
- **[Frontend Architecture Guide](./frontend-architecture.md)** - Complete frontend architecture documentation
  - Layer-by-layer breakdown (8 layers from Entry Point to Backend)
  - State management strategy (Jotai, React Query, Context)
  - Data flow patterns and diagrams
  - Component organization and naming conventions
  - Performance optimization techniques
  - Best practices and anti-patterns
  - Recoil → Jotai migration guide
  - Testing strategies

- **[Frontend Architecture Diagram](./frontend-architecture-diagram.svg)** - Visual architecture diagram (SVG)
  - Interactive visual representation of the frontend architecture
  - Shows component hierarchy, data flow, and state management
  - Color-coded layers and arrows for easy understanding

## 📚 API Documentation

- **[Export API Documentation](./export-api.md)** - Conversation export API reference
  - JSON, Markdown, HTML, and PDF export formats
  - API endpoints and usage examples
  - Authentication requirements
  - Response formats

## 🔍 RAG Integration Documentation

- **[RAG Integration Guide](./rag-integration.md)** - Complete RAG API integration architecture
  - Architecture overview with diagrams
  - Component descriptions and responsibilities
  - Namespace system for multi-user isolation
  - Complete upload, query, and delete flows
  - Testing scripts and procedures

- **[RAG API Configuration](./rag-api-configuration.md)** - Configuration and setup guide
  - Environment variables reference
  - LibreChat configuration (librechat.yaml)
  - RAG API setup instructions
  - Docker compose examples
  - Troubleshooting guide

- **[RAG API Modifications](./rag-api-modifications.md)** - Required RAG API changes
  - X-Namespace header support implementation
  - Webhook callback service
  - Database modifications for namespace filtering
  - Security-critical namespace isolation
  - Code examples in Python/FastAPI

## 🗄️ Database Documentation

- **[Database Optimization Guide](./database-optimization.md)** - MongoDB query optimization
  - Strategic indexing strategies
  - Query performance improvements (8-10x faster)
  - Memory optimization (60-75% reduction)
  - Best practices for database queries

- **[Database Optimization Summary](../DATABASE_OPTIMIZATION_SUMMARY.md)** - Quick reference
  - Summary of optimization achievements
  - Index implementations
  - Performance metrics

## 🔧 Development Guides

### Main Documentation Files (Root Directory)
- **[CLAUDE.md](../CLAUDE.md)** - Main project overview and development guide
  - Project structure and organization
  - Development commands and workflows
  - Configuration and environment setup
  - Architecture references

- **[CLAUDE_FRONTEND.md](../CLAUDE_FRONTEND.md)** - Frontend development guide
  - Frontend-specific development workflows
  - Component patterns and conventions
  - State management guidelines
  - Testing strategies
  - Common issues and solutions

- **[CLAUDE_BACKEND.md](../CLAUDE_BACKEND.md)** - Backend development guide (if exists)
  - Backend architecture and patterns
  - API development guidelines
  - Database integration
  - Authentication and authorization

## 📋 Task Lists

- **[TODO_FRONTEND.md](../TODO_FRONTEND.md)** - Frontend development tasks
  - Categorized by priority (High, Medium, Low)
  - Includes tech debt, testing, and documentation tasks
  - Progress tracking with completion dates

- **[TODO_BACKEND.md](../TODO_BACKEND.md)** - Backend development tasks
  - API improvements and features
  - Security and compliance tasks
  - Database and performance optimizations
  - Infrastructure and DevOps tasks

## 🚀 Quick Start

1. **New to the project?** Start with [CLAUDE.md](../CLAUDE.md)
2. **Frontend development?** Read [Frontend Architecture Guide](./frontend-architecture.md) and [CLAUDE_FRONTEND.md](../CLAUDE_FRONTEND.md)
3. **Backend development?** Check [Database Optimization](./database-optimization.md) and backend guides
4. **Need API reference?** See [Export API Documentation](./export-api.md)

## 📊 Visual Resources

- [Frontend Architecture Diagram](./frontend-architecture-diagram.svg) - Open in browser or SVG viewer

## 🤝 Contributing

When adding new documentation:
1. Place architecture docs in this `docs/` directory
2. Update this README with links to new documents
3. Reference documentation in main CLAUDE.md files
4. Keep documentation up-to-date with code changes

## 📝 Documentation Standards

- Use Markdown format (`.md`)
- Include table of contents for long documents
- Add code examples with syntax highlighting
- Use diagrams and visuals when helpful (SVG preferred)
- Keep examples up-to-date with current codebase
- Include "Last Updated" date at bottom of documents

---

**Last Updated:** 2025-10-29
**Maintainer:** Development Team
