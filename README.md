# Anonymous Wall - Admin Dashboard

A production-grade, enterprise-level Admin Dashboard built with React for managing the Anonymous Wall campus social platform.

## Features

✅ **User Management**

- List all users with pagination
- View detailed user information
- Block/unblock user accounts
- Track user reports and activity

✅ **Post Moderation**

- View all posts (campus and national walls)
- Filter by visibility status (visible/hidden)
- Soft-delete inappropriate posts
- View detailed post information including content, likes, and comments

✅ **Comment Moderation**

- View all comments across all posts
- Soft-delete inappropriate comments
- Track comment authors and timestamps

✅ **Report Management**

- View all reported posts and comments
- Filter by report type
- Track reporter information and reasons

✅ **Dashboard Overview**

- Real-time statistics (total users, posts, comments, reports)
- Track blocked users and hidden content
- Visual cards for quick metrics

✅ **Authentication & Authorization**

- Secure login with email and password
- Role-based access control (Admin and Moderator roles)
- JWT token-based authentication
- Protected routes

✅ **Enterprise Features**

- Responsive Material-UI design
- Mobile-friendly interface
- Pagination for large datasets
- Error handling and loading states
- Confirmation dialogs for critical actions
- TypeScript for type safety

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **UI Library**: Material-UI (MUI) v7
- **Routing**: React Router v7
- **HTTP Client**: Axios 1.13.5
- **Data Fetching**: TanStack Query (React Query) v5
- **State Management**: Zustand v5
- **Date Formatting**: date-fns
- **Icons**: Material Icons
- **Code Quality**: ESLint, Prettier, Husky, lint-staged

## Prerequisites

- Node.js 18+ and npm
- Access to Anonymous Wall API (Backend must be running)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/AnonymousWall/AnonymousWallWeb.git
cd AnonymousWallWeb
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables (optional):

**Development Mode (Default):**
The application uses Vite's proxy feature to avoid CORS issues. No environment configuration is needed - requests to `/api` are automatically proxied to `http://localhost:8080`. You can skip creating a `.env` file.

**Production or Direct API Access:**
Create a `.env` file and configure the full API URL:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```

## Development

1. Make sure the backend API is running on `http://localhost:8080` (see [Anonymous Wall Backend](https://github.com/AnonymousWall/AnonymousWall))

2. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

**Note:** The Vite development server is configured with a proxy to forward API requests from `/api` to `http://localhost:8080/api`, eliminating CORS issues during development.

## Building for Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## API Configuration

The dashboard connects to the Anonymous Wall API.

**Development Mode:**
The Vite development server includes a built-in proxy that forwards requests from `/api` to `http://localhost:8080/api`. This eliminates CORS issues during development. No additional configuration is required.

**Production or Custom API URL:**
Create a `.env` file and configure the API base URL:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```

For more details, see the `.env.example` file.

## Admin Access

To access the admin dashboard, you need an account with **ADMIN** or **MODERATOR** role.

### Creating an Admin User

1. Register a user account through the API
2. Update the user role in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

3. Login to the dashboard with the admin credentials

## Available Routes

- `/login` - Admin login page
- `/` - Dashboard overview with statistics
- `/users` - User management
- `/posts` - Post moderation
- `/comments` - Comment moderation
- `/reports` - Report management

## Security Features

- JWT token-based authentication
- Automatic token refresh handling
- Protected routes with role verification
- Secure axios interceptors
- No vulnerabilities in dependencies (verified)

## Project Structure

```
src/
├── api/                    # API service layer
│   ├── httpClient.ts      # Axios client with interceptors
│   ├── authService.ts     # Authentication services
│   ├── userService.ts     # User management services
│   ├── postService.ts     # Post moderation services
│   ├── commentService.ts  # Comment moderation services
│   └── reportService.ts   # Report management services
├── components/            # Reusable UI components
│   └── ProtectedRoute.tsx # Route protection component
├── config/                # Centralized configuration
│   └── constants.ts       # App constants and config
├── hooks/                 # Custom React hooks
│   ├── useUsers.ts        # User management hooks
│   ├── usePosts.ts        # Post moderation hooks
│   ├── useComments.ts     # Comment moderation hooks
│   ├── useReports.ts      # Report management hooks
│   └── useDashboardStats.ts # Dashboard statistics
├── layouts/               # Page layout components
│   └── Layout.tsx         # Main layout with navigation
├── pages/                 # Page components
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   ├── UsersPage.tsx
│   ├── PostsPage.tsx
│   ├── CommentsPage.tsx
│   └── ReportsPage.tsx
├── stores/                # Zustand state stores
│   └── authStore.ts       # Authentication state
├── types/                 # TypeScript type definitions
│   └── index.ts
├── App.tsx               # Main app component with routing
└── main.tsx              # Application entry point
```

## API Integration

The dashboard integrates with the following Admin API endpoints:

### User Management

- `GET /api/v1/admin/users` - List all users
- `GET /api/v1/admin/users/:id` - Get user details
- `POST /api/v1/admin/users/:id/block` - Block user
- `POST /api/v1/admin/users/:id/unblock` - Unblock user

### Post Moderation

- `GET /api/v1/admin/posts` - List all posts
- `DELETE /api/v1/admin/posts/:id` - Delete post (soft-delete)

### Comment Moderation

- `GET /api/v1/admin/comments` - List all comments
- `DELETE /api/v1/admin/comments/:id` - Delete comment (soft-delete)

### Report Management

- `GET /api/v1/admin/reports` - List all reports

For complete API documentation, see: [Admin API Documentation](https://github.com/AnonymousWall/AnonymousWall/blob/main/README.md#admin-api-documentation)

## Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

- **API Layer**: HTTP client with interceptors, service modules for each domain
- **Hooks Layer**: Custom React hooks using TanStack Query for data fetching
- **Store Layer**: Zustand for global state management (authentication)
- **UI Layer**: React components (pages, components, layouts)
- **Config Layer**: Centralized configuration and constants

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md)

## Development Best Practices

### Code Quality

The project enforces code quality through:

- **TypeScript**: Strict type checking, no `any` types allowed
- **ESLint**: Code linting with React hooks rules
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks
- **lint-staged**: Run linters on staged files only

### Making Changes

1. **Install dependencies**: `npm install`
2. **Start dev server**: `npm run dev`
3. **Make your changes**
4. **Format code**: `npm run format`
5. **Check linting**: `npm run lint`
6. **Build**: `npm run build`
7. **Commit**: Git hooks will automatically format and lint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Troubleshooting

Having issues with login or CORS errors? See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common solutions.

## License

This project is part of the Anonymous Wall platform.

## Support

For issues and questions, please open an issue on GitHub.
