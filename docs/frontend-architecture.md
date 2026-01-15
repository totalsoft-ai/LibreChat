# LibreChat Frontend Architecture

> **Visual Diagram:** See [frontend-architecture-diagram.svg](./frontend-architecture-diagram.svg) for a comprehensive visual representation.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Layer-by-Layer Breakdown](#layer-by-layer-breakdown)
4. [State Management Strategy](#state-management-strategy)
5. [Data Flow Patterns](#data-flow-patterns)
6. [Component Organization](#component-organization)
7. [Performance Optimizations](#performance-optimizations)
8. [Best Practices](#best-practices)

---

## Architecture Overview

LibreChat uses a **modern React architecture** with a clear separation of concerns across multiple layers:

```
┌─────────────────────────────────────────────────────────────┐
│  Entry Point (main.jsx)                                      │
│  ↓ React 18 • i18n • Global Providers                        │
├─────────────────────────────────────────────────────────────┤
│  Root App Component (App.jsx)                               │
│  ↓ React Query • Router • Theme                             │
├─────────────────────────────────────────────────────────────┤
│  Routing Layer (routes/)                                     │
│  ↓ ChatRoute • Dashboard • Search • Share                   │
├─────────────────────────────────────────────────────────────┤
│  UI Components (components/)                                 │
│  ↓ Chat • Nav • Agents • Artifacts • Auth                   │
├─────────────────────────────────────────────────────────────┤
│  State Management (store/ + data-provider/)                  │
│  ↔ Jotai (UI) ⟷ React Query (Server)                       │
├─────────────────────────────────────────────────────────────┤
│  Context Providers (Providers/)                             │
│  ↔ 17 React Contexts for shared state                       │
├─────────────────────────────────────────────────────────────┤
│  Backend Integration (packages/data-provider/)              │
│  ↓ REST API • WebSocket (future) • Auth                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Technologies
- **React 18** - Latest React with concurrent features
- **Vite 6.4.1** - Fast build tool with HMR (Hot Module Replacement)
- **TypeScript** - Gradual migration (prefer `.tsx` for new components)
- **Tailwind CSS** - Utility-first CSS with dark mode support

### State Management
- **Jotai** - Atomic state management for UI state (PRIMARY)
- **React Query (TanStack Query)** - Server state management, caching, mutations
- **React Context** - 17 context providers for shared state
- **Recoil** - Legacy state (⚠️ AVOID for new features, being migrated)

### Routing & Navigation
- **React Router v6** - Declarative routing with `createBrowserRouter`
- Protected routes with authentication guards

### Internationalization
- **react-i18next** - 36 languages supported (lazy-loaded)
- Dynamic language switching

### Build & Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing
- **Playwright** - E2E testing

---

## Layer-by-Layer Breakdown

### Layer 1: Entry Point (`client/src/main.jsx`)

**Purpose:** Bootstrap the React application

```javascript
import { createRoot } from 'react-dom/client';
import './locales/i18n';  // i18n initialization (lazy-loaded)
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <ApiErrorBoundaryProvider>
    <App />
  </ApiErrorBoundaryProvider>
);
```

**Key Responsibilities:**
- Initialize React 18 with `createRoot()`
- Load global CSS (style.css, mobile.css)
- Initialize i18n with lazy loading
- Set up KaTeX for math rendering
- Wrap app with `ApiErrorBoundaryProvider`

---

### Layer 2: Root App (`client/src/App.jsx`)

**Purpose:** Configure global providers and routing

**Provider Hierarchy:**
```jsx
<React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <RouterProvider router={router}>
        <App />
      </RouterProvider>
    </ThemeProvider>
  </QueryClientProvider>
</React.StrictMode>
```

**Key Providers:**

#### React Query Provider
- **Purpose:** Server state management
- **Configuration:**
  ```javascript
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000,      // 5 seconds
        refetchOnWindowFocus: true,
        retry: 3,
      },
    },
  });
  ```
- **Features:**
  - Automatic caching and background refetching
  - Optimistic updates
  - Query invalidation
  - Loading and error states

#### React Router
- **Type:** `createBrowserRouter` (data router)
- **Routes:**
  - `/` → Root layout
  - `/chat/:conversationId?` → ChatRoute (main chat UI)
  - `/dashboard` → Dashboard (agent management)
  - `/search` → Search view
  - `/share/:shareId` → ShareRoute (public shares)
  - `/login` → Login page

#### Theme Provider
- Dark/Light mode switching
- Tailwind CSS integration
- Persistent theme preference

---

### Layer 3: Routes (`client/src/routes/`)

**Route Structure:**

| Route | Component | Purpose |
|-------|-----------|---------|
| `/chat/:id?` | `ChatRoute.tsx` | Main chat interface |
| `/dashboard` | `Dashboard.tsx` | Agent marketplace & management |
| `/search` | `Search.tsx` | Conversation search view |
| `/share/:id` | `ShareRoute.tsx` | Public conversation sharing |
| `*` | `RouteErrorBoundary.tsx` | 404 and error handling |

**Protected Routes:**
```jsx
<Route
  path="/chat"
  element={
    <ProtectedRoute>
      <ChatRoute />
    </ProtectedRoute>
  }
/>
```

---

### Layer 4: UI Components (`client/src/components/`)

Components are organized by **feature**, not by type.

#### 💬 Chat Components (`components/Chat/`)

**Main Components:**
- `ChatView.jsx` - Main chat container (wrapped with ErrorBoundary)
- `Landing.jsx` - Landing screen with conversation starters
- `ExportAndShareMenu.tsx` - Export/share functionality
- `AddMultiConvo.tsx` - Multi-conversation support

**Input System (`Chat/Input/`):**
- `TextareaHeader.tsx` - Input header with options
- `SendButton.tsx`, `StopButton.tsx` - Action buttons
- `Files/` - File upload system
  - `FileUpload.tsx` - Main file upload
  - `ImagePreview.tsx` - Image preview
  - `FilesView.tsx` - Uploaded files list
- `Mention.tsx` - @ mentions support
- `WebSearch.tsx` - Web search toggle
- `Artifacts.tsx` - Artifact generation toggle

**Menus (`Chat/Menus/`):**
- `BookmarkMenu.tsx` - Bookmark conversations
- `PresetsMenu.tsx` - Conversation presets
- `Endpoints/` - Model/endpoint selection

**Messages (`Chat/Messages/`):**
- `MessagesView.tsx` - Message list (with ErrorBoundary)
- Message rendering with markdown, code blocks
- Tool call results display

**Context Usage:**
- `ChatContext` - Active conversation state
- `ChatFormContext` - Form state

---

#### 🧭 Navigation Components (`components/Nav/`)

**Main Components:**
- Sidebar navigation
- `SearchBar.tsx` - Search with Jotai state (migrated ✅)
- `ConversationList.jsx` - Conversation history
- `UserMenu.jsx` - User profile and settings

**Settings (`Nav/SettingsTabs/`):**
- `General/` - General settings, archived chats
- `Data/` - Data export, shared links
- Account management

**Export (`Nav/ExportConversation/`):**
- `ExportModal.tsx` - Export dialog with PDF support
- Formats: JSON, Markdown, HTML, PDF, Text, CSV, Screenshot

**Context Usage:**
- `SearchContext` - Search functionality

---

#### 🤖 Agent Components (`components/Agents/`)

**Features:**
- Agent marketplace with virtualized grid
- `AgentCard.tsx` - Agent display card
- `AgentGrid.tsx` - Grid layout
- `VirtualizedAgentGrid.tsx` - Performance-optimized list
- `CategoryTabs.tsx` - Category filtering
- `AgentDetail.tsx` - Detailed agent view

**Performance:**
- Virtualization for 1000+ agents
- Lazy loading with intersection observer
- 6,500+ lines of comprehensive tests

**Context Usage:**
- `AgentsContext`, `AgentsMapContext`

---

#### 🎨 Artifacts Components (`components/Artifacts/`)

**Code Artifact System:**
- `Artifact.tsx` - Artifact container
- `Code.tsx` - Code rendering with syntax highlighting
- `Mermaid.tsx` - Mermaid diagram rendering
- `PlantUML.tsx` - PlantUML diagram rendering
- `Thinking.tsx` - AI thinking display
- `DownloadArtifact.tsx` - Download functionality

**Context Usage:**
- `ArtifactsContext`, `ArtifactContext`

---

#### 🔐 Auth Components (`components/Auth/`)

- `Login.tsx` - Login screen
- `Registration.tsx` - User registration
- `SocialLoginRender.tsx` - OAuth buttons
- `TwoFactorScreen.tsx` - 2FA verification
- `VerifyEmail.tsx` - Email verification
- `RequestPasswordReset.tsx` - Password reset

---

#### 🎯 UI Components (`components/ui/`)

**Reusable UI Elements:**
- `ErrorBoundary.tsx` - React error boundary (210 lines, 32 tests)
- `ErrorFallback.tsx` - Error UI component
- Buttons, modals, dropdowns, tooltips
- Form inputs and validation

---

#### ♿ Accessibility (`a11y/`)

**Screen Reader Support:**
- `LiveAnnouncer.tsx` - Announce dynamic updates
- `LiveMessenger.tsx` - Message announcements
- `Announcer.tsx` - Global announcer
- ARIA labels throughout the app
- Keyboard navigation support

**Context Usage:**
- `AnnouncerContext`

---

### Layer 5: State Management

#### 🔸 Jotai Atoms (`client/src/store/`) - UI State

**Purpose:** Atomic state for UI and client-side data

**Key Atoms:**

| Atom | Purpose | Status |
|------|---------|--------|
| `search.ts` | Search query and state | ✅ Migrated |
| `fontSize.ts` | Font size setting | ✅ Migrated |
| `artifacts.ts` | Artifact state | Active |
| `agents.ts` | Agent selection | Active |
| `prompts.ts` | Prompt library | Active |
| `settings.ts` | User settings | Active |
| `user.ts` | User preferences | Active |
| `mcp.ts` | MCP server state | Active |
| `toast.ts` | Toast notifications | Active |
| `endpoints.ts` | Endpoint config | Active |

**Usage Pattern:**
```jsx
import { useAtom } from 'jotai';
import { searchAtom } from '~/store/search';

function SearchBar() {
  const [search, setSearch] = useAtom(searchAtom);

  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );
}
```

**Benefits:**
- Atomic, granular updates
- No Provider boilerplate
- TypeScript-friendly
- Devtools support

---

#### 🟢 React Query (`packages/data-provider/`) - Server State

**Purpose:** Server data fetching, caching, and mutations

**Key Hooks:**

**Queries (GET):**
```javascript
// Conversations
useGetConversationsQuery()
useGetConversationByIdQuery(id)

// Agents
useGetAgentsQuery()
useGetAgentByIdQuery(id)

// Prompts
useGetPromptsQuery()

// Export
useGetExportFormatsQuery()
```

**Mutations (POST/PUT/DELETE):**
```javascript
// Conversations
useCreateConversationMutation()
useUpdateConversationMutation()
useDeleteConversationMutation()

// Export
useExportConversationMutation()  // JSON, MD, PDF

// Agents
useCreateAgentMutation()
useUpdateAgentMutation()
```

**Usage Pattern:**
```jsx
import { useGetConversationsQuery } from 'librechat-data-provider/react-query';

function ConversationList() {
  const { data, isLoading, error, refetch } = useGetConversationsQuery();

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {data.conversations.map(conv => (
        <ConversationCard key={conv.id} {...conv} />
      ))}
    </div>
  );
}
```

**Mutation with Optimistic Update:**
```jsx
const mutation = useUpdateConversationMutation({
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['conversations']);
    const previous = queryClient.getQueryData(['conversations']);

    queryClient.setQueryData(['conversations'], (old) => {
      return old.map(conv =>
        conv.id === newData.id ? { ...conv, ...newData } : conv
      );
    });

    return { previous };
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(['conversations'], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['conversations']);
  },
});
```

---

#### ⚠️ Legacy: Recoil (AVOID)

**Status:** Being migrated to Jotai

**Remaining Usage:** ~461 `useRecoilState` calls

**Migration Strategy:**
1. Identify Recoil atom
2. Create equivalent Jotai atom in `store/`
3. Update all imports and usage
4. Write tests
5. Remove Recoil atom

**DO NOT use Recoil for new features!**

---

### Layer 6: Context Providers (`client/src/Providers/`)

**17 React Context Providers:**

| Context | Purpose |
|---------|---------|
| `ChatContext` | Active conversation state |
| `AgentsContext` | Agent list and selection |
| `AgentsMapContext` | Agent lookup map |
| `ArtifactsContext` | Artifact collection |
| `ArtifactContext` | Single artifact state |
| `BookmarkContext` | Conversation bookmarks |
| `SearchContext` | Search functionality |
| `AssistantsContext` | OpenAI assistants |
| `AssistantsMapContext` | Assistant lookup |
| `FileMapContext` | File upload mapping |
| `ToolCallsMapContext` | Tool call results |
| `ChatFormContext` | Chat form state |
| `CustomFormContext` | Custom form state |
| `DashboardContext` | Dashboard state |
| `EditorContext` | Code editor state |
| `CodeBlockContext` | Code block state |
| `SidePanelContext` | Side panel state |

**Usage Pattern:**
```jsx
import { useChatContext } from '~/Providers/ChatContext';

function ChatMessage() {
  const { conversation, setConversation } = useChatContext();

  return <div>{conversation.title}</div>;
}
```

---

### Layer 7: Backend Integration (`packages/data-provider/`)

#### API Client (`src/data-service.ts`)

**Purpose:** Axios-based HTTP client for backend API

**Key Functions:**
```javascript
// Conversations
getConversations()
createConversation(data)
updateConversation(id, data)
deleteConversation(id)

// Export
exportConversationAPI(conversationId, format)  // JSON, MD, HTML, PDF
getExportFormats()

// Agents
getAgents()
createAgent(data)

// Auth
login(credentials)
register(userData)
```

**Error Handling:**
```javascript
try {
  const data = await getConversations();
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
  }
  // Show error toast
}
```

---

#### API Endpoints (`src/api-endpoints.ts`)

**Endpoint Definitions:**
```javascript
export const endpoints = {
  conversations: '/api/conversations',
  messages: '/api/messages',
  export: '/api/export',
  agents: '/api/agents',
  prompts: '/api/prompts',
  // ... more endpoints
};
```

---

## Data Flow Patterns

### Pattern 1: User Action → UI Update (Optimistic)

```
┌──────────────┐
│ User clicks  │
│ "Save"       │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ mutation.mutate()    │
│ (optimistic update)  │
└──────┬───────────────┘
       │
       ├──► Update UI immediately (optimistic)
       │
       ▼
┌──────────────────────┐
│ API call to backend  │
└──────┬───────────────┘
       │
       ├──► Success → Keep optimistic update
       │
       └──► Error → Rollback to previous state
```

---

### Pattern 2: Server Data Fetch

```
┌──────────────────────┐
│ Component mounts     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ useQuery() hook      │
└──────┬───────────────┘
       │
       ├──► Check cache (if fresh, return cached)
       │
       ▼
┌──────────────────────┐
│ Fetch from API       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Update cache         │
│ Trigger re-render    │
└──────────────────────┘
```

---

### Pattern 3: UI State Management

```
┌──────────────────────┐
│ User changes theme   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ setTheme(newTheme)   │
│ (Jotai atom)         │
└──────┬───────────────┘
       │
       ├──► Update localStorage
       │
       ├──► All components reading themeAtom re-render
       │
       └──► Apply CSS classes
```

---

## Component Organization

### Feature-Based Structure

```
components/
├── Chat/              # Chat feature
│   ├── ChatView.jsx
│   ├── Input/         # Chat input sub-feature
│   ├── Messages/      # Messages sub-feature
│   └── Menus/         # Menus sub-feature
├── Nav/               # Navigation feature
│   ├── SearchBar.tsx
│   ├── SettingsTabs/  # Settings sub-feature
│   └── ExportConversation/  # Export sub-feature
├── Agents/            # Agent management feature
├── Artifacts/         # Artifacts feature
├── Auth/              # Authentication feature
└── ui/                # Reusable UI components
```

**Benefits:**
- Related code is colocated
- Easy to find features
- Natural code splitting boundaries

---

### Component Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ChatView.jsx` |
| Hooks | camelCase + `use` prefix | `useConversations.js` |
| Utils | camelCase | `formatDate.js` |
| Contexts | PascalCase + `Context` suffix | `ChatContext.tsx` |
| Atoms | camelCase + `Atom` suffix | `searchAtom.ts` |

---

## Performance Optimizations

### 1. Lazy Loading (Bundle Size Reduction)

**i18n Lazy Loading:**
```javascript
// Before: 8.2 MB bundle
import en from './locales/en-US/translation.json';
import fr from './locales/fr/translation.json';
// ... 36 languages

// After: 4.1 MB initial bundle (~50% reduction)
const loadLanguage = async (lang) => {
  return await import(`./locales/${lang}/translation.json`);
};
```

**HEIC Converter Lazy Loading:**
```javascript
// 544 KB library only loads when needed
const convertHEIC = async (file) => {
  const heic = await import('heic-to');
  return heic.convert(file);
};
```

**Result:** Initial bundle reduced from 8.2 MB → 4.1 MB (~50%)

---

### 2. Code Splitting

**Route-Based Splitting:**
```jsx
const ChatRoute = lazy(() => import('./routes/ChatRoute'));
const Dashboard = lazy(() => import('./routes/Dashboard'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/chat" element={<ChatRoute />} />
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
</Suspense>
```

---

### 3. Virtualization

**Agent Grid with React Window:**
```jsx
import { FixedSizeGrid } from 'react-window';

function VirtualizedAgentGrid({ agents }) {
  return (
    <FixedSizeGrid
      height={600}
      width={1200}
      rowCount={Math.ceil(agents.length / 4)}
      columnCount={4}
      rowHeight={200}
      columnWidth={300}
    >
      {AgentCard}
    </FixedSizeGrid>
  );
}
```

**Performance:** Handles 1000+ agents smoothly

---

### 4. Memoization

**Component Memoization:**
```jsx
const AgentCard = memo(({ agent }) => {
  return <div>{agent.name}</div>;
});
```

**Computation Memoization:**
```jsx
const filteredAgents = useMemo(() => {
  return agents.filter(a => a.category === selectedCategory);
}, [agents, selectedCategory]);
```

**Callback Memoization:**
```jsx
const handleClick = useCallback(() => {
  setSelected(agent.id);
}, [agent.id]);
```

---

### 5. React Query Caching

**Stale-While-Revalidate:**
```javascript
useGetConversationsQuery({
  staleTime: 5000,  // Data fresh for 5 seconds
  cacheTime: 10 * 60 * 1000,  // Keep in cache for 10 minutes
});
```

---

## Best Practices

### 1. State Management Guidelines

**Use Jotai for:**
- UI state (modals, dropdowns, selected items)
- User preferences (theme, language, font size)
- Client-side filters and sorts
- Form drafts

**Use React Query for:**
- All server data (conversations, messages, agents)
- Create/update/delete operations
- File uploads
- Export operations

**Use Context for:**
- Cross-cutting concerns (chat state, artifacts)
- Rarely changing data
- Provider-based state sharing

**❌ NEVER use Recoil for new features**

---

### 2. Component Design Principles

**Single Responsibility:**
```jsx
// ❌ Bad: Component does too much
function ChatView() {
  // Fetch data
  // Handle form submission
  // Render messages
  // Handle file uploads
  // ...
}

// ✅ Good: Focused components
function ChatView() {
  return (
    <ChatContainer>
      <ChatHeader />
      <MessageList />
      <ChatInput />
    </ChatContainer>
  );
}
```

---

### 3. Accessibility First

**ARIA Labels:**
```jsx
<button
  aria-label="Send message"
  aria-disabled={isLoading}
>
  <SendIcon />
</button>
```

**Keyboard Navigation:**
```jsx
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  onClick={handleClick}
>
  Click or press Enter
</div>
```

**Live Regions:**
```jsx
<div aria-live="polite" aria-atomic="true">
  {message}
</div>
```

---

### 4. Error Handling

**Error Boundaries:**
```jsx
<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onError={(error, info) => {
    console.error('Error:', error);
    // Send to Sentry
  }}
>
  <ChatView />
</ErrorBoundary>
```

**React Query Error Handling:**
```jsx
const { data, error } = useGetConversationsQuery({
  onError: (error) => {
    toast.error('Failed to load conversations');
  },
  retry: 3,
});
```

---

### 5. Testing Strategy

**Component Tests:**
```jsx
import { render, screen, fireEvent } from '@testing-library/react';

test('SearchBar updates on input', () => {
  render(<SearchBar />);

  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'test' } });

  expect(input.value).toBe('test');
});
```

**Integration Tests:**
```jsx
test('Error boundary catches errors', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
```

---

## Migration Path: Recoil → Jotai

### Step-by-Step Process

1. **Identify Recoil Atom:**
   ```javascript
   // Old: Recoil
   const searchState = atom({
     key: 'search',
     default: '',
   });
   ```

2. **Create Jotai Atom:**
   ```javascript
   // New: Jotai
   import { atom } from 'jotai';
   import { atomWithStorage } from 'jotai/utils';

   export const searchAtom = atomWithStorage('search', '');
   ```

3. **Update Components:**
   ```javascript
   // Old
   import { useRecoilState } from 'recoil';
   const [search, setSearch] = useRecoilState(searchState);

   // New
   import { useAtom } from 'jotai';
   const [search, setSearch] = useAtom(searchAtom);
   ```

4. **Write Tests:**
   ```javascript
   import { renderHook } from '@testing-library/react';
   import { useAtom } from 'jotai';
   import { searchAtom } from '~/store/search';

   test('searchAtom updates correctly', () => {
     const { result } = renderHook(() => useAtom(searchAtom));

     act(() => {
       result.current[1]('test query');
     });

     expect(result.current[0]).toBe('test query');
   });
   ```

5. **Remove Recoil Dependency** (when all atoms migrated)

---

## Performance Metrics Goals

| Metric | Target | Current |
|--------|--------|---------|
| **Initial Bundle Size** | < 500 KB (gzipped) | ~2 MB (4.1 MB uncompressed) |
| **LCP (Largest Contentful Paint)** | < 2.5s | TBD |
| **FID (First Input Delay)** | < 100ms | TBD |
| **CLS (Cumulative Layout Shift)** | < 0.1 | TBD |
| **Test Coverage** | > 80% | ~60% |

---

## Future Enhancements

### Planned Improvements

1. **PWA Offline Support**
   - Service worker enhancements
   - IndexedDB for offline storage
   - Background sync for queued messages

2. **Performance Monitoring**
   - Sentry integration for error tracking
   - Web Vitals tracking (LCP, FID, CLS)
   - Custom performance marks

3. **Accessibility Improvements**
   - WCAG 2.1 AA compliance audit
   - Comprehensive keyboard navigation
   - Screen reader testing

4. **State Management**
   - Complete Recoil → Jotai migration
   - ~461 remaining Recoil uses

5. **Advanced Features**
   - Push notifications (Web Push Protocol)
   - Real-time updates (WebSocket)
   - Advanced search filters

---

## Resources

- **Visual Diagram:** [frontend-architecture-diagram.svg](./frontend-architecture-diagram.svg)
- **Frontend Guide:** [CLAUDE_FRONTEND.md](../CLAUDE_FRONTEND.md)
- **TODO List:** [TODO_FRONTEND.md](../TODO_FRONTEND.md)

### External Documentation
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Jotai Documentation](https://jotai.org/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

**Last Updated:** 2025-10-29
**Maintainer:** Development Team
