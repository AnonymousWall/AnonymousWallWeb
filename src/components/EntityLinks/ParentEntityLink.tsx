import React from 'react';
import type { SxProps, Theme } from '@mui/material';
import { EntityLink } from './EntityLink';
import { getParentRoute, getParentLabel } from './parentEntityUtils';
import type { CommentParentType } from '../../types';

export interface ParentEntityLinkProps {
  /** The parent entity's unique identifier */
  parentId: string;
  /** The type of parent entity: POST, INTERNSHIP, or MARKETPLACE */
  parentType: CommentParentType;
  /** Optional display text. If not provided, children will be used */
  displayText?: string;
  /** The content to display in the link */
  children?: React.ReactNode;
  /** Optional custom styles */
  sx?: SxProps<Theme>;
  /** Optional click handler */
  onClick?: (event: React.MouseEvent) => void;
}

export const ParentEntityLink: React.FC<ParentEntityLinkProps> = ({
  parentId,
  parentType,
  displayText,
  children,
  sx,
  onClick,
}) => {
  const displayContent = displayText || children || parentId;
  const accessibilityText = displayText || (typeof children === 'string' ? children : parentId);
  const label = getParentLabel(parentType);

  return (
    <EntityLink
      to={getParentRoute(parentId, parentType)}
      sx={sx}
      ariaLabel={`View ${label} details: ${accessibilityText}`}
      title={`View ${label}: ${accessibilityText}`}
      onClick={onClick}
    >
      {displayContent}
    </EntityLink>
  );
};
