import React from 'react';
import type { SxProps, Theme } from '@mui/material';
import { EntityLink } from './EntityLink';
import { ROUTES } from '../../config/constants';

/**
 * UserLink Component
 *
 * A specialized link component for navigating to user detail pages.
 * Provides consistent styling and behavior for all user references in the admin dashboard.
 *
 * Usage:
 *   <UserLink userId={user.id}>{user.email}</UserLink>
 *   <UserLink userId={user.id} displayName={user.profileName} />
 */

export interface UserLinkProps {
  /** The user's unique identifier */
  userId: string;
  /** Optional display text. If not provided, children will be used */
  displayName?: string;
  /** The content to display in the link (typically user ID, email, or name) */
  children?: React.ReactNode;
  /** Optional custom styles */
  sx?: SxProps<Theme>;
  /** Optional click handler */
  onClick?: (event: React.MouseEvent) => void;
}

export const UserLink: React.FC<UserLinkProps> = ({
  userId,
  displayName,
  children,
  sx,
  onClick,
}) => {
  const displayText = displayName || children || userId;
  // For aria-label and title, use string values only
  const accessibilityText = displayName || (typeof children === 'string' ? children : userId);

  return (
    <EntityLink
      to={ROUTES.USER_DETAIL(userId)}
      sx={sx}
      ariaLabel={`View user details: ${accessibilityText}`}
      title={`View user: ${accessibilityText}`}
      onClick={onClick}
    >
      {displayText}
    </EntityLink>
  );
};
