import React from 'react';
import { Link as MuiLink } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { defaultLinkStyle } from './styles';

/**
 * Base EntityLink Component
 *
 * A reusable component for creating clickable entity links with consistent styling
 * and accessibility features. This component serves as the foundation for all
 * entity-specific link components (UserLink, PostLink, CommentLink).
 *
 * Features:
 * - Consistent hover states and styling
 * - Keyboard navigation support (accessible via Tab and Enter)
 * - TypeScript type safety
 * - Configurable appearance via sx prop
 */

export interface EntityLinkProps {
  /** The entity ID or display text */
  children: React.ReactNode;
  /** Navigation path (from ROUTES config) */
  to: string;
  /** Optional custom styles */
  sx?: SxProps<Theme>;
  /** Optional aria-label for accessibility */
  ariaLabel?: string;
  /** Optional tooltip text (displayed via title attribute) */
  title?: string;
  /** Optional click handler (in addition to navigation) */
  onClick?: (event: React.MouseEvent) => void;
}

export const EntityLink: React.FC<EntityLinkProps> = ({
  children,
  to,
  sx,
  ariaLabel,
  title,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();

    // Call custom onClick handler if provided
    if (onClick) {
      onClick(event);
    }

    // Navigate to the target route
    navigate(to);
  };

  return (
    <MuiLink
      component="button"
      variant="body2"
      onClick={handleClick}
      sx={[defaultLinkStyle, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      aria-label={ariaLabel}
      title={title}
      tabIndex={0}
    >
      {children}
    </MuiLink>
  );
};
