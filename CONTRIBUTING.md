# Contributing to Anonymous Wall Admin Dashboard

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   git clone https://github.com/YOUR_USERNAME/AnonymousWallWeb.git
   cd AnonymousWallWeb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing code structure and patterns
- Use functional components with hooks
- Keep components small and focused
- Use meaningful variable and function names

### TypeScript

- Add proper type definitions for all functions and components
- Avoid using `any` type - use specific types or `unknown`
- Use interfaces for object types
- Export types that may be reused

```typescript
// Good
interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'MODERATOR' | 'USER';
}

// Bad
const user: any = { ... };
```

### Component Structure

```typescript
import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import type { User } from '../types';

interface MyComponentProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ userId, onUpdate }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Component logic
  }, [userId]);
  
  return (
    <Box>
      <Typography variant="h5">{user?.email}</Typography>
    </Box>
  );
};
```

### Material-UI Usage

- Use MUI components consistently
- Follow MUI theming patterns
- Use `sx` prop for styling
- Maintain responsive design

```typescript
// Good
<Box sx={{ p: 2, display: 'flex', gap: 2 }}>
  <Typography variant="h5">Title</Typography>
</Box>

// Avoid inline styles when possible
<div style={{ padding: '16px' }}>
  <h5>Title</h5>
</div>
```

### Error Handling

- Always handle errors gracefully
- Show user-friendly error messages
- Log errors for debugging

```typescript
try {
  await apiService.someMethod();
} catch (err: any) {
  const message = err.response?.data?.error || 'Operation failed';
  setError(message);
}
```

### State Management

- Use React Context for global state (auth, theme)
- Use local state for component-specific data
- Keep state as close to where it's used as possible

## API Integration

### Adding New Endpoints

1. Add TypeScript types in `src/types/index.ts`
2. Add method to `src/services/api.ts`
3. Use the method in your component

```typescript
// types/index.ts
export interface NewResource {
  id: string;
  name: string;
}

// services/api.ts
async getNewResource(id: string): Promise<NewResource> {
  const response = await this.client.get<NewResource>(`/resource/${id}`);
  return response.data;
}
```

## Testing

### Before Submitting

1. **Build succeeds**
   ```bash
   npm run build
   ```

2. **TypeScript compilation passes**
   ```bash
   npx tsc --noEmit
   ```

3. **Code lints without errors**
   ```bash
   npm run lint
   ```

4. **Application runs without errors**
   ```bash
   npm run dev
   # Test all features manually
   ```

### Manual Testing Checklist

- [ ] Login/logout works
- [ ] All navigation links work
- [ ] Data loads correctly
- [ ] Pagination works
- [ ] Forms validate properly
- [ ] Error messages display correctly
- [ ] Responsive on mobile
- [ ] No console errors

## Security

### Security Guidelines

- Never commit sensitive data (API keys, passwords)
- Always validate and sanitize user input
- Use HTTPS in production
- Follow principle of least privilege
- Keep dependencies updated

### Reporting Security Issues

If you discover a security vulnerability:
1. **DO NOT** open a public issue
2. Email security concerns to the maintainers
3. Include details of the vulnerability
4. Wait for a response before disclosing

## Commit Guidelines

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

**Examples:**
```
feat: add user search functionality

Add search bar to Users page with real-time filtering

Closes #123
```

```
fix: resolve pagination issue on Reports page

The pagination was not resetting when changing filters

Fixes #456
```

## Pull Request Process

1. **Update documentation**
   - Update README if needed
   - Add/update comments for complex code
   - Update DEPLOYMENT.md if deployment changes

2. **Ensure quality**
   - Code builds successfully
   - No TypeScript errors
   - No console warnings
   - Follows style guidelines

3. **Create Pull Request**
   - Use descriptive title
   - Reference related issues
   - Describe changes made
   - Add screenshots for UI changes

4. **PR Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Build passes
   - [ ] Manual testing completed
   - [ ] No console errors
   
   ## Screenshots
   (if applicable)
   
   ## Related Issues
   Fixes #issue_number
   ```

5. **Code Review**
   - Address review comments
   - Make requested changes
   - Re-request review when ready

## Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/         # React contexts (auth, theme)
├── pages/            # Page components (one per route)
├── services/         # API and external services
├── types/            # TypeScript type definitions
├── utils/            # Helper functions
├── App.tsx           # Main app component
└── main.tsx          # Application entry point
```

### Where to Add Code

- **New page**: `src/pages/`
- **Reusable component**: `src/components/`
- **API method**: `src/services/api.ts`
- **Type definition**: `src/types/index.ts`
- **Global state**: `src/contexts/`
- **Helper function**: `src/utils/`

## Common Tasks

### Adding a New Page

1. Create component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation item in `src/components/Layout.tsx`
4. Add types if needed in `src/types/index.ts`

### Adding a New API Endpoint

1. Define types in `src/types/index.ts`
2. Add method to `src/services/api.ts`
3. Use in component with error handling

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm install package-name@latest

# Update all packages
npm update

# Check for security vulnerabilities
npm audit
npm audit fix
```

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Material-UI Documentation](https://mui.com/material-ui/getting-started/)
- [React Router Documentation](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)

## Questions?

- Check existing issues on GitHub
- Review the README and documentation
- Ask in discussions or open an issue

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the project's coding standards

Thank you for contributing! 🎉
