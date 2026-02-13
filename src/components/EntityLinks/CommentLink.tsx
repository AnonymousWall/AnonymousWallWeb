import React from 'react';
import type { SxProps, Theme } from '@mui/material';
import { EntityLink } from './EntityLink';
import { ROUTES } from '../../config/constants';

/**
 * CommentLink Component
 *
 * A specialized link component for navigating to comment detail pages.
 * Provides consistent styling and behavior for all comment references in the admin dashboard.
 *
 * Usage:
 *   <CommentLink commentId={comment.id}>{comment.text}</CommentLink>
 *   <CommentLink commentId={comment.id} displayText={comment.id} />
 */

export interface CommentLinkProps {
  /** The comment's unique identifier */
  commentId: string;
  /** Optional display text. If not provided, children will be used */
  displayText?: string;
  /** The content to display in the link (typically comment ID or text preview) */
  children?: React.ReactNode;
  /** Optional custom styles */
  sx?: SxProps<Theme>;
  /** Optional click handler */
  onClick?: (event: React.MouseEvent) => void;
}

export const CommentLink: React.FC<CommentLinkProps> = ({
  commentId,
  displayText,
  children,
  sx,
  onClick,
}) => {
  const displayContent = displayText || children || commentId;

  return (
    <EntityLink
      to={ROUTES.COMMENT_DETAIL(commentId)}
      sx={sx}
      ariaLabel={`View comment details: ${displayContent}`}
      title={`View comment: ${displayContent}`}
      onClick={onClick}
    >
      {displayContent}
    </EntityLink>
  );
};
