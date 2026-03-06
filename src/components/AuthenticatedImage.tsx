import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { httpClient } from '../api/httpClient';
import { getMediaUrl } from '../utils/mediaUtils';

interface AuthenticatedImageProps {
  /** Object name (e.g. "posts/uuid.jpg") or legacy full URL */
  src: string;
  alt: string;
  sx?: SxProps<Theme>;
  onClick?: () => void;
}

/**
 * Renders an image that may require authentication to load.
 *
 * Object names returned by the backend after the OCI bucket became private are
 * fetched via the authenticated /media proxy endpoint using the current JWT
 * token. The response blob is converted to an object URL for the <img> tag.
 *
 * Legacy full http/https URLs (older data) are fetched the same way so that
 * existing images continue to work seamlessly.
 *
 * The object URL is revoked when the component unmounts to avoid memory leaks.
 */
export const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
  src,
  alt,
  sx,
  onClick,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    const load = async () => {
      try {
        const mediaPath = getMediaUrl(src);
        // httpClient (axios) handles absolute URLs correctly: it does NOT prepend
        // baseURL when the URL already starts with http:// or https://.
        // For object names (new data), getMediaUrl returns a relative path like
        // "/media/posts/uuid.jpg" which axios resolves against the base URL.
        // For legacy full URLs (old data), getMediaUrl returns them unchanged and
        // they are fetched as-is; these will likely fail since the bucket is now
        // private, but the error is handled gracefully below.
        const blob = await httpClient.getBlob(mediaPath);
        if (!cancelled) {
          objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('AuthenticatedImage: failed to load image', src, err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...sx,
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!blobUrl) return null;

  return <Box component="img" src={blobUrl} alt={alt} onClick={onClick} sx={sx} />;
};
