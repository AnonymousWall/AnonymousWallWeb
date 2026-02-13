import React from 'react';
import type { SxProps, Theme } from '@mui/material';
import { EntityLink } from './EntityLink';
import { ROUTES } from '../../config/constants';

/**
 * PostLink Component
 *
 * A specialized link component for navigating to post detail pages.
 * Provides consistent styling and behavior for all post references in the admin dashboard.
 *
 * Usage:
 *   <PostLink postId={post.id}>{post.title}</PostLink>
 *   <PostLink postId={post.id} displayText={post.id} />
 */

export interface PostLinkProps {
  /** The post's unique identifier */
  postId: string;
  /** Optional display text. If not provided, children will be used */
  displayText?: string;
  /** The content to display in the link (typically post ID or title) */
  children?: React.ReactNode;
  /** Optional custom styles */
  sx?: SxProps<Theme>;
  /** Optional click handler */
  onClick?: (event: React.MouseEvent) => void;
}

export const PostLink: React.FC<PostLinkProps> = ({
  postId,
  displayText,
  children,
  sx,
  onClick,
}) => {
  const displayContent = displayText || children || postId;
  // For aria-label and title, use string values only
  const accessibilityText = displayText || (typeof children === 'string' ? children : postId);

  return (
    <EntityLink
      to={ROUTES.POST_DETAIL(postId)}
      sx={sx}
      ariaLabel={`View post details: ${accessibilityText}`}
      title={`View post: ${accessibilityText}`}
      onClick={onClick}
    >
      {displayContent}
    </EntityLink>
  );
};
