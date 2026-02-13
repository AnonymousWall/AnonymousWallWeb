import type { SxProps, Theme } from '@mui/material';

/**
 * Shared styles for entity links
 *
 * Provides consistent styling across all entity link components.
 */

export const defaultLinkStyle: SxProps<Theme> = {
  textDecoration: 'none',
  cursor: 'pointer',
  color: 'primary.main',
  '&:hover': {
    textDecoration: 'underline',
    color: 'primary.dark',
  },
  '&:focus': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: '2px',
    borderRadius: '2px',
  },
  maxWidth: 200,
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;
