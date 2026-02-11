# Architecture Documentation

## Overview

This Admin Dashboard follows **Clean Architecture** principles with clear separation of concerns across multiple layers. The architecture is designed to be maintainable, scalable, testable, and follows SOLID principles.

## Architecture Layers

### 1. **Presentation Layer** (`/src/pages`, `/src/components`, `/src/layouts`)

- **Pages**: Route-level components that compose UI and business logic
- **Components**: Reusable, pure UI components
- **Layouts**: Page layout components (e.g., main layout with navigation)

**Responsibilities:**

- Rendering UI
- Handling user interactions
- Composing business logic through hooks
- No direct API calls or business logic

### 2. **Business Logic Layer** (`/src/hooks`)

Custom React hooks that encapsulate business logic and data fetching:

- `useUsers.ts` - User management logic
- `usePosts.ts` - Post moderation logic
- `useComments.ts` - Comment moderation logic
- `useReports.ts` - Report management logic
- `useDashboardStats.ts` - Dashboard statistics logic

**Responsibilities:**

- Data fetching with TanStack Query
- Mutations (create, update, delete operations)
- Cache management
- Loading and error states
- Business logic encapsulation

### 3. **State Management Layer** (`/src/stores`)

Global state management using Zustand:

- `authStore.ts` - Authentication state (user, login, logout, token management)

**Responsibilities:**

- Global application state
- Authentication state
- Cross-component state sharing

### 4. **Service Layer** (`/src/api`)

API service modules that handle HTTP requests:

- `authService.ts` - Authentication API calls
- `userService.ts` - User management API calls
- `postService.ts` - Post moderation API calls
- `commentService.ts` - Comment moderation API calls
- `reportService.ts` - Report management API calls

**Responsibilities:**

- API endpoint calls
- Request/response transformation
- Type-safe API interfaces
- Business-focused API methods

### 5. **Infrastructure Layer** (`/src/api`)

Core infrastructure code:

- `httpClient.ts` - Centralized Axios instance with interceptors

**Responsibilities:**

- HTTP client configuration
- Request/response interceptors
- Token management
- Error handling
- Automatic token refresh
- Base URL configuration

### 6. **Configuration Layer** (`/src/config`)

- `constants.ts` - Centralized application constants

**Responsibilities:**

- API configuration
- Application constants
- Route definitions
- Query keys
- Error/success messages
- Pagination settings

### 7. **Type Layer** (`/src/types`)

- `index.ts` - TypeScript type definitions

**Responsibilities:**

- Shared types and interfaces
- API response types
- Domain models

## Data Flow

```
User Interaction (UI)
    ↓
Page Component
    ↓
Custom Hook (useUsers, usePosts, etc.)
    ↓
TanStack Query
    ↓
Service Layer (userService, postService, etc.)
    ↓
HTTP Client (httpClient.ts)
    ↓
API Endpoint
```

## Key Design Patterns

### 1. **Dependency Inversion**

Higher-level modules (pages) don't depend on lower-level modules (API). Both depend on abstractions (hooks).

### 2. **Single Responsibility**

Each module has one reason to change:

- Pages: UI changes
- Hooks: Business logic changes
- Services: API contract changes
- HTTP Client: HTTP configuration changes

### 3. **Separation of Concerns**

- UI layer is decoupled from business logic
- Business logic is decoupled from data access
- Authentication is centralized in Zustand store

### 4. **Composition over Inheritance**

Hooks compose functionality instead of creating inheritance hierarchies.

## Technology Stack

### Core

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool

### State Management

- **Zustand** - Global state management
- **TanStack Query (React Query)** - Server state management

### HTTP & API

- **Axios** - HTTP client
- **Custom interceptors** - Token management, error handling

### UI

- **Material-UI (MUI)** - Component library
- **Emotion** - CSS-in-JS styling

### Code Quality

- **ESLint** - Linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit checks

## Best Practices

### 1. **Custom Hooks**

All data fetching logic is encapsulated in custom hooks:

```typescript
// ✅ Good
const { data, isLoading, error } = useUsers(page, limit);

// ❌ Bad
const [users, setUsers] = useState([]);
useEffect(() => {
  apiService.getUsers().then(setUsers);
}, []);
```

### 2. **Type Safety**

No `any` types allowed:

```typescript
// ✅ Good
catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
}

// ❌ Bad
catch (err: any) {
  const errorMessage = err.message;
}
```

### 3. **Centralized Configuration**

Use constants from `config/constants.ts`:

```typescript
// ✅ Good
navigate(ROUTES.DASHBOARD);
const pageSize = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;

// ❌ Bad
navigate('/');
const pageSize = 20;
```

### 4. **Service Layer**

All API calls go through service layer:

```typescript
// ✅ Good (in hook)
const queryFn = () => userService.getUsers(page, limit);

// ❌ Bad (in component)
const response = await axios.get('/api/users');
```

### 5. **Error Handling**

Errors are handled at multiple levels:

- HTTP Client: Network errors, 401/403
- Services: API errors
- Hooks: Query errors
- Components: Display errors

## File Structure

```
src/
├── api/                    # Service layer
│   ├── httpClient.ts      # HTTP client with interceptors
│   ├── authService.ts     # Auth API calls
│   ├── userService.ts     # User API calls
│   ├── postService.ts     # Post API calls
│   ├── commentService.ts  # Comment API calls
│   └── reportService.ts   # Report API calls
│
├── components/            # Reusable UI components
│   └── ProtectedRoute.tsx
│
├── config/                # Configuration
│   └── constants.ts       # App constants
│
├── hooks/                 # Custom React hooks
│   ├── useUsers.ts
│   ├── usePosts.ts
│   ├── useComments.ts
│   ├── useReports.ts
│   └── useDashboardStats.ts
│
├── layouts/               # Layout components
│   └── Layout.tsx
│
├── pages/                 # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── UsersPage.tsx
│   ├── PostsPage.tsx
│   ├── CommentsPage.tsx
│   └── ReportsPage.tsx
│
├── stores/                # Zustand stores
│   └── authStore.ts
│
├── types/                 # TypeScript types
│   └── index.ts
│
├── App.tsx               # Root component
└── main.tsx              # Entry point
```

## Benefits of This Architecture

### ✅ **Maintainability**

- Clear separation of concerns
- Easy to locate and fix bugs
- Consistent patterns across codebase

### ✅ **Scalability**

- Easy to add new features
- Can scale to hundreds of pages
- Modular design supports team growth

### ✅ **Testability**

- Hooks can be tested in isolation
- Services can be mocked
- Pure functions are easy to test

### ✅ **Type Safety**

- Full TypeScript coverage
- No `any` types
- Compile-time error checking

### ✅ **Developer Experience**

- Autocomplete everywhere
- Clear error messages
- Fast feedback loop with Vite

### ✅ **Performance**

- Automatic caching with TanStack Query
- Smart refetching strategies
- Optimized re-renders

## Future Enhancements

### Recommended

1. **Unit Tests** - Add Jest + React Testing Library
2. **E2E Tests** - Add Playwright or Cypress
3. **Code Splitting** - Use React.lazy() for route-based splitting
4. **Performance Monitoring** - Add analytics and error tracking
5. **Storybook** - Component documentation and testing

### Optional

1. **GraphQL** - If backend switches to GraphQL
2. **PWA** - Progressive Web App features
3. **i18n** - Internationalization support
4. **Dark Mode** - Theme switching
5. **Real-time Updates** - WebSocket integration

## Migration Guide

### From Old Architecture

**Before:**

```typescript
// Page component with direct API calls
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  apiService
    .getUsers()
    .then(setUsers)
    .finally(() => setLoading(false));
}, []);
```

**After:**

```typescript
// Page component with hooks
const { data: users, isLoading } = useUsers(page, limit);
```

The refactored architecture provides:

- ✅ Automatic caching
- ✅ Automatic refetching
- ✅ Better error handling
- ✅ Loading states
- ✅ Optimistic updates
- ✅ Request deduplication

## Questions?

For questions about the architecture or implementation details, refer to:

- README.md - Project setup and usage
- CONTRIBUTING.md - Development guidelines
- Individual file comments - Inline documentation
