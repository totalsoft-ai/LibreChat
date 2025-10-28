# TODO_FRONTEND.md

Frontend development tasks for LibreChat. See [CLAUDE_FRONTEND.md](./CLAUDE_FRONTEND.md) for architecture details.

## Legend
- 🔴 **High Priority** - Critical bugs or UX issues
- 🟡 **Medium Priority** - Important features or improvements
- 🟢 **Low Priority** - Nice-to-have enhancements
- 🔧 **Tech Debt** - Code quality improvements
- 🧪 **Testing** - Test coverage improvements
- 📚 **Documentation** - Documentation needs
- ♿ **A11y** - Accessibility improvements

---

## 🔴 High Priority

### Critical UX & Performance

- [ ] 🔴 Fix memory leaks in Chat component
  - [ ] Review message rendering and cleanup
  - [ ] Check for unclosed subscriptions
  - [ ] Profile memory usage with React DevTools
  - **File:** `client/src/components/Chat/`

- [x] 🔴 Optimize initial bundle size (~50% reduction achieved)
  - [x] Analyze bundle with `rollup-plugin-visualizer`
  - [x] Lazy load i18n translations (35 languages load on-demand)
  - [x] Lazy load HEIC converter (544 KB, loads only when needed)
  - [ ] Implement code splitting for routes
  - [ ] Lazy load heavy components (sandpack, framer-motion, codemirror)
  - [ ] Remove unused dependencies
  - **File:** `client/vite.config.ts`, `client/src/locales/i18n.ts`, `client/src/utils/heicConverter.ts`
  - **Commit:** `b0522d0a6` (2025-10-24)

- [ ] 🔴 Fix hydration errors in production
  - [ ] Ensure server/client HTML matches
  - [ ] Move browser-only code to useEffect
  - [ ] Check for random values in initial render
  - **File:** `client/src/components/`

- [x] 🔴 Improve error boundaries and error handling ✅ 2025-01-27
  - [x] Created comprehensive ErrorBoundary component with logging
  - [x] Created reusable ErrorFallback UI component
  - [x] Added error boundary to Chat view with custom fallback
  - [x] Added error boundary to MessagesView
  - [x] Display user-friendly error messages with accessibility
  - [x] Support for error reporting callbacks (ready for Sentry integration)
  - [x] Comprehensive test coverage (40+ test cases)
  - **Files:**
    - `client/src/components/ui/ErrorBoundary.tsx` (new)
    - `client/src/components/ui/ErrorFallback.tsx` (new)
    - `client/src/components/ui/__tests__/ErrorBoundary.test.tsx` (new)
    - `client/src/components/ui/__tests__/ErrorFallback.test.tsx` (new)
    - `client/src/components/Chat/ChatView.tsx` (modified)
    - `client/src/components/Chat/Messages/MessagesView.tsx` (modified)

### State Management

- [ ] 🔴 Complete Recoil to Jotai migration
  - [x] ✅ Migrated search state (searchAtom) - 8 files updated (2025-01-27)
  - [x] ✅ Migrated fontSize state (fontSizeAtom) - completed earlier
  - [ ] Audit all Recoil imports: `grep -r "useRecoilState" client/` (~461 remaining uses)
  - [ ] Convert remaining Recoil atoms to Jotai
  - [ ] Remove Recoil dependency
  - **Progress:** 2 atoms migrated (search, fontSize), many more remain
  - **File:** `client/src/store/`, `client/src/components/`

- [ ] 🔴 Fix React Query cache invalidation issues
  - [ ] Ensure mutations invalidate correct queries
  - [ ] Add optimistic updates for better UX
  - [ ] Review stale time and cache time settings
  - **File:** `client/src/` (components using React Query)

### Code Cleanup & Deprecation

- [ ] 🔴 Remove Code Interpreter API and all related components
  - [ ] Search and identify all Code Interpreter references: `grep -ri "code.?interpreter" client/`
  - [ ] Remove Code Interpreter UI components
  - [ ] Delete Code Interpreter routes and navigation items
  - [ ] Remove Code Interpreter hooks and utilities
  - [ ] Clean up Code Interpreter state atoms from store
  - [ ] Remove Code Interpreter React Query hooks from data-provider
  - [ ] Delete Code Interpreter translations from i18n files
  - [ ] Remove Code Interpreter configuration options
  - [ ] Clean up imports and dependencies
  - [ ] Update documentation to reflect removal
  - [ ] Test that removal doesn't break other features
  - **Files to check:**
    - `client/src/components/CodeInterpreter/` (delete entire folder if exists)
    - `client/src/hooks/CodeInterpreter/` (delete entire folder if exists)
    - `client/src/routes/` (remove Code Interpreter routes)
    - `client/src/store/` (remove Code Interpreter atoms)
    - `client/src/locales/*/translation.json` (remove Code Interpreter translations)
    - `packages/data-provider/src/` (remove Code Interpreter API calls)
    - `packages/data-provider/react-query/` (remove Code Interpreter hooks)
    - Search for imports: `grep -r "CodeInterpreter\|codeInterpreter\|code-interpreter" client/`
    - Search for sandbox/execution related components

---

## 🟡 Medium Priority

### Features & Enhancements

- [x] 🟡 Add conversation search functionality ✅ 2025-01-27
  - [x] Migrated SearchBar from Recoil to Jotai for state management
  - [x] Integrated with backend search API using React Query
  - [x] Added comprehensive test coverage (16 test cases)
  - [x] Supports real-time debounced search with 500ms delay
  - [x] Full accessibility support with ARIA labels
  - [x] Updated all 6 files that used search state to use Jotai
  - **Files:**
    - `client/src/store/search.ts` (migrated to Jotai with derived atoms)
    - `client/src/components/Nav/SearchBar.tsx` (updated)
    - `client/src/components/Nav/Nav.tsx` (updated)
    - `client/src/routes/Search.tsx` (updated)
    - `client/src/hooks/Conversations/useSearchEnabled.ts` (updated)
    - `client/src/components/Nav/SettingsTabs/General/ArchivedChatsTable.tsx` (updated)
    - `client/src/components/Nav/SettingsTabs/Data/SharedLinks.tsx` (updated)
    - `client/src/components/Chat/Messages/SearchButtons.tsx` (updated)
    - `client/src/components/Nav/__tests__/SearchBar.test.tsx` (new, 16 tests)

- [x] 🟡 Implement conversation export (JSON, Markdown, PDF) ✅ 2025-10-28
  - [x] Added PDF format to export options
  - [x] Integrated backend API for JSON, Markdown, and PDF exports
  - [x] Created API endpoints in data-provider
  - [x] Updated useExportConversation hook to use backend API
  - [x] Added error handling with toast notifications
  - [x] Kept client-side exports for text, CSV, and screenshot
  - **Files:**
    - `packages/data-provider/src/api-endpoints.ts` (added exportConversation, exportFormats)
    - `packages/data-provider/src/data-service.ts` (added exportConversationAPI, getExportFormats)
    - `packages/data-provider/src/react-query/react-query-service.ts` (added useExportConversationMutation)
    - `client/src/components/Nav/ExportConversation/ExportModal.tsx` (added PDF option)
    - `client/src/hooks/Conversations/useExportConversation.ts` (integrated backend API)
  - **API Integration:**
    - Server-side export for JSON, Markdown, PDF (better formatting, includes feedback)
    - Client-side fallback for text, CSV, screenshot
    - Blob download with proper content types
    - Error handling with user-friendly messages

- [ ] 🟡 Add conversation folders/categories
  - [ ] Create Folder management UI
  - [ ] Add drag-and-drop to organize conversations
  - [ ] Support nested folders
  - **File:** `client/src/components/Nav/Folders/` (new)

- [ ] 🟡 Implement conversation templates
  - [ ] Create template selector
  - [ ] Add template management UI
  - [ ] Support variable substitution
  - **File:** `client/src/components/Templates/` (new)

- [ ] 🟡 Add message editing and regeneration
  - [ ] Add edit button to messages
  - [ ] Show edit history
  - [ ] Add regenerate with different parameters
  - **File:** `client/src/components/Messages/MessageActions.jsx`

- [ ] 🟡 Implement advanced model settings UI
  - [ ] Add sliders for temperature, top_p, etc.
  - [ ] Show current token count
  - [ ] Add preset configurations
  - **File:** `client/src/components/Chat/ModelSettings.jsx` (new)

### UI/UX Improvements

- [ ] 🟡 Improve mobile responsiveness
  - [ ] Optimize Chat view for mobile
  - [ ] Add mobile-friendly navigation
  - [ ] Test on various screen sizes
  - **File:** `client/src/components/Chat/`, `client/src/components/Nav/`

- [ ] 🟡 Add keyboard shortcuts
  - [ ] Document shortcuts in help menu
  - [ ] Add shortcut hints in UI
  - [ ] Support customizable shortcuts
  - **File:** `client/src/hooks/useKeyboardShortcuts.js` (new)

- [ ] 🟡 Improve dark mode implementation
  - [ ] Fix color contrast issues
  - [ ] Ensure all components support dark mode
  - [ ] Add smooth theme transition
  - **File:** All components, `client/src/store/theme.js`

- [ ] 🟡 Add loading skeletons instead of spinners
  - [ ] Replace spinners with skeleton screens
  - [ ] Match skeleton to actual content layout
  - [ ] Improve perceived performance
  - **File:** `client/src/components/ui/Skeleton.jsx` (new)

- [ ] 🟡 Implement infinite scroll for conversation history
  - [ ] Replace pagination with infinite scroll
  - [ ] Add "Load more" button as fallback
  - [ ] Optimize rendering with virtualization
  - **File:** `client/src/components/Nav/ConversationList.jsx`

### Real-time Features

- [ ] 🟡 Add WebSocket support for real-time updates
  - [ ] Set up WebSocket connection
  - [ ] Handle real-time message streaming
  - [ ] Show typing indicators
  - **File:** `client/src/services/websocket.js` (new)

- [ ] 🟡 Implement typing indicators
  - [ ] Show when AI is generating response
  - [ ] Add animated dots or pulse
  - [ ] Support multiple users (future)
  - **File:** `client/src/components/Chat/TypingIndicator.jsx` (new)

---

## 🟢 Low Priority

### Nice-to-Have Features

- [ ] 🟢 Add conversation sharing with public links
  - [ ] Generate shareable link
  - [ ] Create public conversation view
  - [ ] Support password protection
  - **File:** `client/src/components/Chat/ShareButton.jsx` (new)

- [ ] 🟢 Implement message reactions (like, dislike)
  - [ ] Add reaction buttons to messages
  - [ ] Store reactions in backend
  - [ ] Show reaction counts
  - **File:** `client/src/components/Messages/MessageReactions.jsx` (new)

- [ ] 🟢 Add conversation bookmarks/favorites
  - [ ] Add bookmark button
  - [ ] Create bookmarks view
  - [ ] Support bookmark categories
  - **File:** `client/src/components/Nav/Bookmarks.jsx` (new)

- [ ] 🟢 Implement conversation analytics dashboard
  - [ ] Show usage statistics (messages, tokens)
  - [ ] Add charts for trends over time
  - [ ] Display cost estimates
  - **File:** `client/src/components/Analytics/` (new)

- [ ] 🟢 Add voice input support
  - [ ] Integrate Web Speech API
  - [ ] Add microphone button
  - [ ] Show voice recording UI
  - **File:** `client/src/components/Input/VoiceInput.jsx` (new)

- [ ] 🟢 Implement drag-and-drop file upload
  - [ ] Add drop zone to chat area
  - [ ] Show upload progress
  - [ ] Support multiple files
  - **File:** `client/src/components/Input/FileUpload.jsx`

---

## 🔧 Tech Debt

### Code Quality

- [ ] 🔧 Migrate JavaScript components to TypeScript
  - [ ] Start with most-used components
  - [ ] Add proper type definitions
  - [ ] Update imports and exports
  - **File:** `client/src/components/`

- [ ] 🔧 Refactor large components into smaller ones
  - [ ] Split ChatView into smaller components
  - [ ] Extract reusable UI elements
  - [ ] Improve component composition
  - **File:** `client/src/components/Chat/ChatView.jsx`

- [ ] 🔧 Remove unused dependencies
  - [ ] Audit package.json with `depcheck`
  - [ ] Remove unused imports
  - [ ] Update outdated packages
  - **File:** `client/package.json`

- [ ] 🔧 Standardize component patterns
  - [ ] Use consistent prop naming
  - [ ] Standardize event handler names
  - [ ] Create component templates
  - **File:** All components

- [ ] 🔧 Extract magic numbers and strings to constants
  - [ ] Create constants file
  - [ ] Move hardcoded values
  - [ ] Document constant meanings
  - **File:** `client/src/constants/` (new)

### State Management

- [ ] 🔧 Simplify complex state logic
  - [ ] Review state atoms for redundancy
  - [ ] Combine related atoms
  - [ ] Use derived atoms where appropriate
  - **File:** `client/src/store/`

- [ ] 🔧 Optimize React Query configuration
  - [ ] Review cache times and stale times
  - [ ] Add proper error retry logic
  - [ ] Configure background refetching
  - **File:** `client/src/main.jsx` (QueryClient config)

- [ ] 🔧 Implement proper loading states everywhere
  - [ ] Ensure all async operations show loading UI
  - [ ] Add skeleton screens
  - [ ] Handle loading errors gracefully
  - **File:** All components with data fetching

### Performance

- [ ] 🔧 Memoize expensive computations
  - [ ] Use useMemo for expensive calculations
  - [ ] Use useCallback for event handlers in memoized components
  - [ ] Profile performance with React DevTools
  - **File:** All components with heavy computation

- [ ] 🔧 Implement virtualization for long message lists
  - [ ] Use react-window or react-virtual
  - [ ] Render only visible messages
  - [ ] Maintain scroll position
  - **File:** `client/src/components/Messages/MessageList.jsx`

- [ ] 🔧 Optimize image loading
  - [ ] Add lazy loading for images
  - [ ] Implement progressive image loading
  - [ ] Use WebP format where supported
  - **File:** `client/src/components/Messages/ImageMessage.jsx`

- [ ] 🔧 Reduce bundle size with tree shaking
  - [ ] Ensure dead code elimination works
  - [ ] Import only needed lodash functions
  - [ ] Use ES modules where possible
  - **File:** All imports

---

## 🧪 Testing

### Test Coverage

- [ ] 🧪 Increase unit test coverage to 80%+
  - [ ] Focus on critical components (Chat, Messages, Input)
  - [ ] Test hooks in isolation
  - [ ] Test error scenarios
  - **File:** `client/test/`

- [ ] 🧪 Add component integration tests
  - [ ] Test component interactions
  - [ ] Test form submissions
  - [ ] Test navigation flows
  - **File:** `client/test/integration/` (new)

- [ ] 🧪 Add visual regression tests
  - [ ] Use Chromatic or Percy
  - [ ] Test UI changes automatically
  - [ ] Catch unexpected visual bugs
  - **File:** `.storybook/` (if using Storybook)

- [ ] 🧪 Test React Query hooks
  - [ ] Mock API responses
  - [ ] Test loading, success, and error states
  - [ ] Test cache invalidation
  - **File:** `client/test/hooks/` (new)

### Test Infrastructure

- [ ] 🧪 Set up Storybook for component development
  - [ ] Create stories for UI components
  - [ ] Add controls for props
  - [ ] Document component usage
  - **File:** `.storybook/` (new), `client/src/components/**/*.stories.jsx` (new)

- [ ] 🧪 Add E2E tests for critical user flows
  - [ ] Test user registration and login
  - [ ] Test creating and sending messages
  - [ ] Test file uploads
  - **File:** `e2e/specs/`

- [ ] 🧪 Mock API calls in tests
  - [ ] Use MSW (Mock Service Worker)
  - [ ] Create request handlers for all endpoints
  - [ ] Ensure tests don't call real API
  - **File:** `client/test/mocks/` (new)

---

## ♿ Accessibility

- [ ] ♿ Add ARIA labels to all interactive elements
  - [ ] Buttons, links, inputs
  - [ ] Custom components (modals, dropdowns)
  - [ ] Ensure screen reader compatibility
  - **File:** All components

- [ ] ♿ Ensure keyboard navigation works everywhere
  - [ ] Test tab order
  - [ ] Add keyboard shortcuts
  - [ ] Support Escape key to close modals
  - **File:** All interactive components

- [ ] ♿ Fix color contrast issues
  - [ ] Use WCAG AAA contrast ratios
  - [ ] Test with accessibility tools
  - [ ] Fix low-contrast text
  - **File:** Tailwind config, all components

- [ ] ♿ Add focus indicators to all focusable elements
  - [ ] Make focus rings visible
  - [ ] Use consistent focus styles
  - [ ] Don't remove default focus styles
  - **File:** Global CSS, component styles

- [ ] ♿ Support screen reader announcements for dynamic content
  - [ ] Use aria-live for real-time updates
  - [ ] Announce loading states
  - [ ] Announce errors and success messages
  - **File:** Components with dynamic content

- [ ] ♿ Add skip links for keyboard users
  - [ ] Add "Skip to main content" link
  - [ ] Add "Skip to navigation" link
  - **File:** `client/src/App.jsx`

---

## 📚 Documentation

- [ ] 📚 Create component library documentation
  - [ ] Document all reusable components
  - [ ] Add prop types and descriptions
  - [ ] Provide usage examples
  - **File:** `docs/components.md` (new) or Storybook

- [ ] 📚 Document state management patterns
  - [ ] Explain Jotai atom structure
  - [ ] Document React Query patterns
  - [ ] Provide examples of common patterns
  - **File:** `docs/state-management.md` (new)

- [ ] 📚 Create frontend architecture diagram
  - [ ] Show component hierarchy
  - [ ] Document data flow
  - [ ] Explain routing structure
  - **File:** `docs/frontend-architecture.md` (new)

- [ ] 📚 Document i18n translation process
  - [ ] How to add new translations
  - [ ] Translation key naming conventions
  - [ ] How to test translations
  - **File:** `docs/i18n.md` (new)

- [ ] 📚 Add inline JSDoc comments to complex functions
  - [ ] Document utility functions
  - [ ] Explain non-obvious logic
  - [ ] Add examples where helpful
  - **File:** `client/src/utils/`, custom hooks

---

## 🐛 Known Issues (from Code Scan)

_This section should be populated after running code analysis tools or reviewing TODOs/FIXMEs in the codebase._

- [ ] Search for TODO comments: `grep -r "TODO" client/`
- [ ] Search for FIXME comments: `grep -r "FIXME" client/`
- [ ] Search for HACK comments: `grep -r "HACK" client/`
- [ ] Review console.log statements (remove debug logs): `grep -r "console\\.log" client/`
- [ ] Check for useEffect dependency warnings
- [ ] Audit for XSS vulnerabilities in user-generated content
- [ ] Check for missing key props in lists

---

## 🎨 Design System

- [ ] Create consistent design system
  - [ ] Define color palette
  - [ ] Standardize spacing scale
  - [ ] Create typography system
  - [ ] Document component variants
  - **File:** `client/src/styles/design-system.md` (new)

- [ ] Create reusable UI component library
  - [ ] Button variants
  - [ ] Input components
  - [ ] Modal/Dialog
  - [ ] Toast notifications
  - [ ] Dropdown menus
  - **File:** `client/src/components/ui/` (organize existing components)

- [ ] Implement consistent animations
  - [ ] Define animation durations
  - [ ] Create transition utilities
  - [ ] Add micro-interactions
  - **File:** `client/src/styles/animations.css` (new)

---

## 📝 Notes

- **Priority Review:** Review and update priorities monthly based on user feedback
- **Code Review:** All changes should go through code review before merging
- **Testing:** Write tests for all new components and features
- **Accessibility:** Test with screen readers and keyboard navigation
- **Documentation:** Update CLAUDE_FRONTEND.md when architecture changes
- **Dependencies:** Keep dependencies up to date; run `npm audit` regularly
- **Performance:** Profile before and after optimization changes

---

## 🎯 Quick Wins (Easy Tasks to Start With)

1. Add ARIA labels to 5 buttons
2. Write unit test for 1 utility function
3. Convert 1 JavaScript component to TypeScript
4. Add JSDoc comments to 3 custom hooks
5. Fix 5 TODO comments in the codebase
6. Add loading skeleton to 1 component
7. Improve color contrast in 3 UI elements

---

## 🚀 Performance Metrics Goals

- **Lighthouse Score:** 90+ on all metrics
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s
- **Total Bundle Size:** < 500KB (gzipped)
- **Test Coverage:** > 80%

---

**Last Updated:** 2025-01-27
**Maintainer:** Development Team
**Related:** [TODO_BACKEND.md](./TODO_BACKEND.md) | [CLAUDE_FRONTEND.md](./CLAUDE_FRONTEND.md)
