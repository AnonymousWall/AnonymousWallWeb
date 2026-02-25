import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import { PhotoLibrary as PhotoLibraryIcon, Close as CloseIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

interface ImageViewerButtonProps {
  /** The entity ID used for fetching images and cache keying */
  entityId: string;
  /** Function to fetch images for the entity */
  fetchImages: (id: string) => Promise<{ imageUrls: string[] }>;
  /** React Query cache key prefix */
  queryKey: string;
  /** Title shown in the images dialog */
  dialogTitle?: string;
}

/**
 * Reusable button that eagerly fetches image metadata to conditionally render.
 * The icon is hidden when there are no images. Clicking a thumbnail opens a
 * full-size lightbox view.
 */
export const ImageViewerButton: React.FC<ImageViewerButtonProps> = ({
  entityId,
  fetchImages,
  queryKey,
  dialogTitle = 'Images',
}) => {
  const [open, setOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Fetch eagerly so we can hide the button when there are no images.
  const { data, isLoading } = useQuery({
    queryKey: [queryKey, entityId],
    queryFn: () => fetchImages(entityId),
  });

  const imageUrls = data?.imageUrls ?? [];

  // While loading, render nothing to avoid a flickering icon.
  // Once loaded, hide completely when there are no images.
  if (isLoading || imageUrls.length === 0) return null;

  return (
    <>
      <Tooltip title="View Images">
        <IconButton size="small" onClick={() => setOpen(true)} aria-label="View images">
          <PhotoLibraryIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Thumbnail gallery dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 2,
              pt: 1,
            }}
          >
            {imageUrls.map((url, index) => (
              <Box
                key={index}
                component="img"
                src={url}
                alt={`Image ${index + 1}`}
                onClick={() => setLightboxUrl(url)}
                sx={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  '&:hover': { opacity: 0.85 },
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Full-size lightbox */}
      <Dialog
        open={lightboxUrl !== null}
        onClose={() => setLightboxUrl(null)}
        maxWidth={false}
        PaperProps={{
          sx: {
            bgcolor: 'black',
            boxShadow: 'none',
            m: 1,
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setLightboxUrl(null)}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
            }}
          >
            <CloseIcon />
          </IconButton>
          {lightboxUrl && (
            <Box
              component="img"
              src={lightboxUrl}
              alt="Full size"
              sx={{
                display: 'block',
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          )}
        </Box>
      </Dialog>
    </>
  );
};
