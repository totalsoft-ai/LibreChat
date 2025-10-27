# CLAUDE_FRONTEND.md

Frontend-specific guidance for LibreChat development. For general project overview, see [CLAUDE.md](./CLAUDE.md).

## Recent Updates (2025-01-27)

### Error Handling & Reliability (2025-01-27)
- **ErrorBoundary Component**: Created comprehensive React Error Boundary class component with extensive features (210 lines):
  - Configurable fallback UI (static or function-based)
  - Error reporting callbacks ready for Sentry/LogRocket integration
  - Reset functionality to recover from errors
  - Development mode with detailed error info
  - Accessibility-first with ARIA attributes
- **ErrorFallback Component**: Reusable error UI component (80 lines) with user-friendly messages, technical details collapse, and dark mode support.
- **ChatView Error Boundary**: Wrapped ChatView with custom error boundary and fallback UI to prevent blank screens on errors.
- **MessagesView Error Boundary**: Added error boundary around MessagesView with user-friendly error message.
- **Comprehensive Testing**: 32 total test cases across ErrorBoundary (19 tests) and ErrorFallback (13 tests) covering:
  - Error catching and display
  - Fallback rendering (static and function-based)
  - Reset functionality and callbacks
  - Accessibility attributes
  - Edge cases (missing errors, no stack traces)
- **Files**:
  - `client/src/components/ui/ErrorBoundary.tsx` (new)
  - `client/src/components/ui/ErrorFallback.tsx` (new)
  - `client/src/components/ui/__tests__/ErrorBoundary.test.tsx` (new, 240 lines)
  - `client/src/components/ui/__tests__/ErrorFallback.test.tsx` (new, 180 lines)
  - `client/src/components/Chat/ChatView.tsx` (wrapped with ErrorBoundary)
  - `client/src/components/Chat/Messages/MessagesView.tsx` (wrapped with ErrorBoundary)

### Bundle Size Optimization (2025-10-24)
- **Lazy Loading for i18n**: Converted from static imports of all 36 languages to dynamic loading. Only English loads at startup; other 35 languages load on-demand when selected.
- **Lazy Loading for HEIC Converter**: The `heic-to` library (544 KB gzip) now loads dynamically only when users upload HEIC files.
- **Bundle Analysis**: Added `rollup-plugin-visualizer` for visual bundle analysis at `client/dist/stats.html`.
- **Per-Locale Chunking**: Vite now creates separate chunks for each language file.
- **Result**: Initial bundle size reduced by ~50% (from 8.2 MB to ~4.1 MB at startup).
- **Files Modified**:
  - `client/vite.config.ts:234-240, 39-44` - visualizer plugin and locale chunking
  - `client/src/locales/i18n.ts` - complete refactor for lazy loading
  - `client/src/utils/heicConverter.ts:1-8, 15-24, 33-43` - dynamic imports

### State Management Migration
- **Recoil to Jotai**: Migrated fontSize setting from Recoil to Jotai (`client/src/store/fontSize.ts`), continuing the migration away from Recoil.
- **Pattern**: New `fontSize.ts` atom with 54 lines of Jotai implementation replacing Recoil state.

### Agent Marketplace
- **New Components**: Comprehensive Agent Marketplace UI with virtualized grid for performance (`client/src/components/Agents/`).
- **Test Coverage**: Added 6,500+ lines of tests including:
  - AgentCard, AgentDetail, AgentGrid tests
  - CategoryTabs, ErrorDisplay, SmartLoader tests
  - VirtualizedAgentGrid performance tests
  - Integration and accessibility tests
- **Features**: Search, filtering, categorization, virtualization for large lists.

### Message Enhancements
- **UI Resource Carousel**: New component for displaying tool call resources (`client/src/components/Chat/Messages/Content/UIResourceCarousel.tsx`).
- **Tool Call Info**: Enhanced tool call display with metadata (`client/src/components/Chat/Messages/Content/ToolCallInfo.tsx`).
- **Test Coverage**: Added comprehensive tests for new message components.

### Configuration
- **Vite Dev Server**: Added configurable domain and port (`VITE_DOMAIN`, `VITE_PORT`) in `client/vite.config.ts`.

### Testing Infrastructure
- **Coverage**: Significant increase in test coverage across components, hooks, and utilities.
- **Accessibility**: Added dedicated accessibility test suites for Agent components.

## Project Overview

LibreChat is an all-in-one AI conversation platform. This document focuses on the **frontend architecture** (React/Vite client application).

**Key Frontend Features:**
- React 18 with modern hooks and concurrent features
- Vite for fast development and optimized builds
- State management with Jotai (atomic state) and React Query (server state)
- Multi-language support (i18n)
- Real-time chat interface
- File uploads and image generation
- AI Agents management UI
- Model Context Protocol (MCP) integration UI
- Code artifacts and generative UI
- Responsive design with Tailwind CSS

## Frontend Repository Structure

```
client/
├── src/
│   ├── main.jsx              # Application entry point
│   ├── App.jsx               # Root component
│   ├── components/           # React components (feature-based)
│   │   ├── Chat/            # Main chat interface
│   │   ├── Messages/        # Message rendering
│   │   ├── Input/           # Chat input area
│   │   ├── Nav/             # Navigation sidebar
│   │   ├── Agents/          # Agent management
│   │   ├── Artifacts/       # Code artifacts
│   │   ├── Auth/            # Authentication screens
│   │   └── MCP/             # MCP integration UI
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Jotai atoms (global state)
│   ├── routes/              # React Router configuration
│   ├── utils/               # Utility functions
│   ├── locales/             # i18n translations
│   └── data-provider/       # Re-exports from packages/data-provider
├── test/                    # Frontend unit tests
├── public/                  # Static assets
├── index.html               # HTML entry point
└── vite.config.js           # Vite configuration

packages/
├── data-provider/           # API client & React Query hooks
│   ├── src/                # API endpoints
│   └── react-query/        # React Query hooks
└── client/                 # Shared client components
```

## Frontend Development Commands

### Starting the Frontend

```bash
# Development mode (Vite dev server on http://localhost:3080)
npm run frontend:dev

# Build for production
npm run frontend

# Build with Bun (faster)
npm run b:client:dev          # Development with Bun
npm run b:client              # Production build with Bun
```

### Building Packages

Frontend depends on shared packages that must be built first:

```bash
# Build all packages in correct order
npm run build:packages

# Build specific packages
npm run build:data-provider   # API client
npm run build:client-package  # Shared client components
```

**Important:** If you get module resolution errors in the frontend, rebuild packages.

### Testing

```bash
npm run test:client           # Run client unit tests
npm run b:test:client         # Run client tests with Bun
```

### Linting & Formatting

```bash
npm run lint                  # Lint TypeScript/JavaScript
npm run lint:fix              # Auto-fix linting issues
npm run format                # Format with Prettier
```

## Frontend Architecture

### Entry Point: `client/src/main.jsx`

The main entry file that:
1. Imports React 18 and ReactDOM
2. Sets up global providers (React Query, i18n, Router)
3. Configures theme and styling
4. Mounts the root `<App />` component

```jsx
// Simplified example
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
```

### Component Organization

Components are organized by **feature**, not by type:

```
components/
├── Chat/
│   ├── ChatView.jsx         # Main chat container
│   ├── ChatHeader.jsx       # Chat header with model selector
│   └── ChatMessages.jsx     # Message list
├── Messages/
│   ├── Message.jsx          # Single message component
│   ├── MessageContent.jsx   # Message content rendering
│   └── MessageActions.jsx   # Copy, edit, regenerate buttons
├── Input/
│   ├── ChatInput.jsx        # Main input component
│   ├── SubmitButton.jsx     # Send button
│   └── FileUpload.jsx       # File attachment
├── Nav/
│   ├── Sidebar.jsx          # Navigation sidebar
│   ├── ConversationList.jsx # Conversation history
│   └── UserMenu.jsx         # User profile menu
├── Agents/
│   ├── AgentList.jsx        # List of agents
│   ├── AgentEditor.jsx      # Create/edit agent
│   └── AgentCard.jsx        # Agent display card
├── Artifacts/
│   ├── ArtifactView.jsx     # Code artifact viewer
│   └── ArtifactEditor.jsx   # Code editor
└── ui/
    ├── ErrorBoundary.tsx    # Error boundary component
    └── ErrorFallback.tsx    # Error fallback UI
```

**Naming Convention:**
- Components: PascalCase (e.g., `ChatView.jsx`)
- Hooks: camelCase starting with `use` (e.g., `useConversations.js`)
- Utils: camelCase (e.g., `formatDate.js`)

### State Management

LibreChat uses a **hybrid state management** approach:

#### 1. **Jotai** (Primary - UI State)

Used for client-side UI state, settings, and preferences.

**Location:** `client/src/store/`

**Example:**
```jsx
// store/conversation.js
import { atom } from 'jotai';

export const conversationAtom = atom(null);
export const messagesAtom = atom([]);

// In component:
import { useAtom } from 'jotai';
import { conversationAtom } from '~/store';

function ChatView() {
  const [conversation, setConversation] = useAtom(conversationAtom);
  // ...
}
```

**When to use Jotai:**
- UI state (modals open/closed, selected items)
- User preferences (theme, language)
- Form state (drafts, temporary data)
- Client-side filters and sorts

#### 2. **React Query** (Server State)

Used for **all server data** (API calls, caching, mutations).

**Location:** `packages/data-provider/react-query/`

**Example:**
```jsx
// Using a React Query hook
import { useGetConversationsQuery } from 'librechat-data-provider/react-query';

function ConversationList() {
  const { data, isLoading, error } = useGetConversationsQuery();

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return <div>{data.conversations.map(conv => ...)}</div>;
}
```

**When to use React Query:**
- Fetching data from API
- Creating/updating/deleting resources (mutations)
- Automatic caching and background refetching
- Optimistic updates

#### 3. **Recoil** (Legacy - AVOID)

Recoil is being phased out. **DO NOT use Recoil for new features.**

If you see Recoil imports, consider migrating to Jotai:
```jsx
// Old (Recoil) - AVOID
import { useRecoilState } from 'recoil';
import { conversationState } from './recoil';

// New (Jotai) - PREFERRED
import { useAtom } from 'jotai';
import { conversationAtom } from '~/store';
```

### Routing

LibreChat uses **React Router** for navigation.

**Location:** `client/src/routes/`

```jsx
// routes/index.jsx
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { path: '/chat', element: <ChatView /> },
      { path: '/chat/:conversationId', element: <ChatView /> },
      { path: '/agents', element: <AgentList /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
]);
```

**Protected Routes:**
```jsx
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
}
```

### Custom Hooks

Hooks are located in `client/src/hooks/[Feature]/`

**Common Patterns:**

**Data Fetching Hook:**
```jsx
// hooks/useConversations.js
import { useGetConversationsQuery } from 'librechat-data-provider/react-query';

export function useConversations() {
  const { data, isLoading, error, refetch } = useGetConversationsQuery();

  return {
    conversations: data?.conversations ?? [],
    isLoading,
    error,
    refetch,
  };
}
```

**UI State Hook:**
```jsx
// hooks/useModal.js
import { atom, useAtom } from 'jotai';

const modalOpenAtom = atom(false);

export function useModal() {
  const [isOpen, setIsOpen] = useAtom(modalOpenAtom);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  };
}
```

## Development Workflows

### Adding a New UI Component

1. **Create Component** in `client/src/components/[Feature]/`
   ```jsx
   // components/MyFeature/MyComponent.jsx
   import React from 'react';

   export default function MyComponent({ title, onAction }) {
     return (
       <div className="my-component">
         <h2>{title}</h2>
         <button onClick={onAction}>Click me</button>
       </div>
     );
   }
   ```

2. **Create Associated Hook** in `client/src/hooks/MyFeature/`
   ```jsx
   // hooks/MyFeature/useMyFeature.js
   import { useGetMyDataQuery } from 'librechat-data-provider/react-query';

   export function useMyFeature() {
     const { data, isLoading } = useGetMyDataQuery();

     const handleAction = () => {
       // Logic here
     };

     return { data, isLoading, handleAction };
   }
   ```

3. **Add State Atoms** in `client/src/store/` (if needed)
   ```jsx
   // store/myFeature.js
   import { atom } from 'jotai';

   export const myFeatureStateAtom = atom({
     isEnabled: false,
     selectedItem: null,
   });
   ```

4. **Use React Query Hooks** from data-provider
   ```jsx
   // In your component
   import { useMyFeatureMutation } from 'librechat-data-provider/react-query';

   function MyComponent() {
     const mutation = useMyFeatureMutation();

     const handleSubmit = (data) => {
       mutation.mutate(data, {
         onSuccess: () => console.log('Success!'),
         onError: (err) => console.error(err),
       });
     };
   }
   ```

5. **Add Translations** in `client/src/locales/` (if user-facing)
   ```json
   // locales/en-US/translation.json
   {
     "myFeature": {
       "title": "My Feature",
       "button": "Click me"
     }
   }
   ```

6. **Use i18n in Component**
   ```jsx
   import { useTranslation } from 'react-i18next';

   function MyComponent() {
     const { t } = useTranslation();

     return <h2>{t('myFeature.title')}</h2>;
   }
   ```

### Working with React Query

#### Fetching Data (Query)

```jsx
import { useGetConversationsQuery } from 'librechat-data-provider/react-query';

function ConversationList() {
  const {
    data,              // Response data
    isLoading,         // Initial loading state
    isFetching,        // Background refetching state
    error,             // Error object
    refetch,           // Manual refetch function
  } = useGetConversationsQuery({
    enabled: true,     // Query runs automatically
    refetchOnWindowFocus: true,
    staleTime: 5000,   // Consider data fresh for 5s
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return <div>{data.conversations.map(...)}</div>;
}
```

#### Mutating Data (Create/Update/Delete)

```jsx
import { useCreateConversationMutation } from 'librechat-data-provider/react-query';

function CreateConversation() {
  const mutation = useCreateConversationMutation();

  const handleCreate = () => {
    mutation.mutate(
      { title: 'New Chat', model: 'gpt-4' },
      {
        onSuccess: (data) => {
          console.log('Created:', data);
          // Navigate or update UI
        },
        onError: (error) => {
          console.error('Failed:', error);
        },
      }
    );
  };

  return (
    <button onClick={handleCreate} disabled={mutation.isLoading}>
      {mutation.isLoading ? 'Creating...' : 'Create Conversation'}
    </button>
  );
}
```

#### Optimistic Updates

```jsx
const mutation = useUpdateConversationMutation({
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['conversations']);

    // Snapshot previous value
    const previous = queryClient.getQueryData(['conversations']);

    // Optimistically update to new value
    queryClient.setQueryData(['conversations'], (old) => {
      return old.map(conv =>
        conv.id === newData.id ? { ...conv, ...newData } : conv
      );
    });

    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['conversations'], context.previous);
  },
  onSettled: () => {
    // Refetch after mutation
    queryClient.invalidateQueries(['conversations']);
  },
});
```

### Styling with Tailwind CSS

LibreChat uses **Tailwind CSS** for styling.

```jsx
function MyComponent() {
  return (
    <div className="flex flex-col gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Hello World
      </h2>
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        Click me
      </button>
    </div>
  );
}
```

**Dark Mode:**
- Use `dark:` prefix for dark mode variants
- Dark mode state is managed globally (typically in Jotai)

### Form Handling

**Recommended:** Use `react-hook-form` for complex forms.

```jsx
import { useForm } from 'react-hook-form';

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('name', { required: 'Name is required' })}
        placeholder="Name"
      />
      {errors.name && <span>{errors.name.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Testing Frontend Code

### Unit Tests

Tests are located in `client/test/` and use **Jest** + **React Testing Library**.

```bash
# Run all client tests
npm run test:client

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### Writing Component Tests

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '../components/MyFeature/MyComponent';

describe('MyComponent', () => {
  it('renders title correctly', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onAction when button clicked', () => {
    const mockAction = jest.fn();
    render(<MyComponent onAction={mockAction} />);

    fireEvent.click(screen.getByText('Click me'));
    expect(mockAction).toHaveBeenCalledTimes(1);
  });
});
```

### Testing React Query Hooks

```jsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetConversationsQuery } from 'librechat-data-provider/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useGetConversationsQuery', () => {
  it('fetches conversations', async () => {
    const { result } = renderHook(() => useGetConversationsQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```

## Configuration

### Environment Variables

Frontend environment variables are prefixed with `VITE_` (Vite requirement).

**Example `.env`:**
```bash
# Client URL
VITE_APP_TITLE=LibreChat
VITE_DOMAIN_CLIENT=http://localhost:3080
VITE_DOMAIN_SERVER=http://localhost:3080

# Feature flags
VITE_SHOW_DEBUG_INFO=false
```

**Usage in code:**
```jsx
const apiUrl = import.meta.env.VITE_DOMAIN_SERVER;
const appTitle = import.meta.env.VITE_APP_TITLE;
```

### Vite Configuration

`client/vite.config.js` controls build settings, plugins, and optimizations.

**Key sections:**
- **Plugins:** React, Tailwind CSS
- **Resolve aliases:** `~` → `client/src/`
- **Build options:** Output directory, code splitting
- **Dev server:** Port, proxy settings

## Code Style & Patterns

### Module System
- **ES Modules:** Use `import` / `export` (not `require`)

### Component Patterns

**Functional Components (Preferred):**
```jsx
function MyComponent({ title, children }) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

**Arrow Functions (Alternative):**
```jsx
const MyComponent = ({ title }) => {
  return <h2>{title}</h2>;
};
```

### Props Destructuring

```jsx
// Good
function MyComponent({ title, onAction }) {
  return <button onClick={onAction}>{title}</button>;
}

// Avoid
function MyComponent(props) {
  return <button onClick={props.onAction}>{props.title}</button>;
}
```

### Conditional Rendering

```jsx
// Short-circuit evaluation
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}

// Ternary operator
{isLoading ? <Spinner /> : <Content data={data} />}

// Early return (in component body)
if (isLoading) return <Spinner />;
if (error) return <Error />;
return <Content data={data} />;
```

### Event Handlers

```jsx
// Inline (simple logic)
<button onClick={() => setCount(count + 1)}>Increment</button>

// Named function (complex logic)
function handleSubmit(e) {
  e.preventDefault();
  // Complex logic here
}

<form onSubmit={handleSubmit}>...</form>
```

## Common Frontend Issues & Solutions

### Module Resolution Errors

**Problem:** `Cannot find module 'librechat-data-provider'`

**Solution:**
```bash
# Rebuild packages
npm run build:packages

# Or rebuild specific package
npm run build:data-provider
```

### Port Conflicts

**Problem:** `Port 3080 is already in use`

**Solution:**
```bash
# Check vite.config.js or start on different port
PORT=3081 npm run frontend:dev
```

### Hydration Errors (React 18)

**Problem:** `Hydration failed because the initial UI does not match`

**Solution:**
1. Ensure server-rendered HTML matches client render
2. Avoid using browser-only APIs during initial render
3. Use `useEffect` for client-only code

### State Not Updating

**Problem:** Component not re-rendering after state change

**Solution:**
1. Ensure you're using state setters correctly
2. Don't mutate state directly (use spread operator or immutability helpers)
3. Check if parent component is memoized (`React.memo`)

```jsx
// Wrong
const [items, setItems] = useState([]);
items.push(newItem);  // Mutating state!

// Correct
setItems([...items, newItem]);
```

### React Query Cache Issues

**Problem:** Stale data displayed after mutation

**Solution:**
```jsx
// Invalidate queries after mutation
mutation.mutate(data, {
  onSuccess: () => {
    queryClient.invalidateQueries(['conversations']);
  },
});
```

### Build Performance

**Problem:** Slow Vite builds

**Solution:**
```bash
# Use Bun for faster builds
npm run b:client

# Or optimize Vite config
# - Reduce bundle size by code splitting
# - Use esbuild for minification
# - Disable source maps in production
```

## Performance Optimization

### Code Splitting

```jsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Memoization

```jsx
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(a);
}, [a]);

// Memoize components
const MyComponent = memo(({ data }) => {
  return <div>{data}</div>;
});
```

### Virtualization (Long Lists)

Use `react-window` or `react-virtual` for long lists:

```jsx
import { FixedSizeList } from 'react-window';

function ConversationList({ conversations }) {
  const Row = ({ index, style }) => (
    <div style={style}>{conversations[index].title}</div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={conversations.length}
      itemSize={50}
    >
      {Row}
    </FixedSizeList>
  );
}
```

## Important Frontend Notes

- **Monorepo:** Changes in `packages/data-provider` or `packages/client` affect the frontend
- **State Management:** Use Jotai for UI state, React Query for server state. Avoid Recoil.
- **Styling:** Tailwind CSS with dark mode support
- **i18n:** Use `useTranslation()` for all user-facing text
- **Build Order:** Packages must be built before frontend (`npm run build:packages`)
- **Vite:** Fast dev server with HMR; use `import.meta.env` for env variables
- **TypeScript:** Gradually being adopted; prefer `.tsx` for new components
- **Testing:** Focus on user interactions and critical UI flows
- **Accessibility:** Use semantic HTML, ARIA labels, keyboard navigation

## Useful Resources

- **React Docs:** https://react.dev/
- **Vite Docs:** https://vitejs.dev/
- **React Query:** https://tanstack.com/query/latest
- **Jotai:** https://jotai.org/
- **Tailwind CSS:** https://tailwindcss.com/
- **React Router:** https://reactrouter.com/

---

For backend development, see [CLAUDE_BACKEND.md](./CLAUDE_BACKEND.md).
For general project info, see [CLAUDE.md](./CLAUDE.md).
