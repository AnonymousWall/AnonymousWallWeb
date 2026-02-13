/**
 * Entity Link Components
 *
 * Reusable navigation components for cross-entity navigation in the Admin Dashboard.
 * These components provide consistent styling, behavior, and accessibility features
 * across all entity references.
 *
 * Components:
 * - EntityLink: Base component with shared navigation logic
 * - UserLink: Navigate to user detail pages
 * - PostLink: Navigate to post detail pages
 * - CommentLink: Navigate to comment detail pages
 *
 * Architecture Benefits:
 * ✓ DRY (Don't Repeat Yourself) - Single source of truth for navigation logic
 * ✓ Type Safety - Full TypeScript support with strict typing
 * ✓ Accessibility - Keyboard navigation and screen reader support
 * ✓ Consistency - Uniform styling and behavior across all pages
 * ✓ Maintainability - Centralized route configuration
 * ✓ Scalability - Easy to add new entity types in the future
 */

export { EntityLink } from './EntityLink';
export type { EntityLinkProps } from './EntityLink';

export { UserLink } from './UserLink';
export type { UserLinkProps } from './UserLink';

export { PostLink } from './PostLink';
export type { PostLinkProps } from './PostLink';

export { CommentLink } from './CommentLink';
export type { CommentLinkProps } from './CommentLink';

export { defaultLinkStyle } from './styles';
