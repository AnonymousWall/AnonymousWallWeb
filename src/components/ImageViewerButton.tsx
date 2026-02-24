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
  CircularProgress,
  Typography,
} from '@mui/material';
import { PhotoLibrary as PhotoLibraryIcon } from '@mui/icons-material';
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
 * Reusable button that lazily fetches and displays images for an entity.
 * Images are only fetched when the dialog is opened (on-demand).
 */
export const ImageViewerButton: React.FC<ImageViewerButtonProps> = ({
  entityId,
  fetchImages,
  queryKey,
  dialogTitle = 'Images',
}) => {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, entityId],
    queryFn: () => fetchImages(entityId),
    enabled: open,
  });

  const imageUrls = data?.imageUrls ?? [];

  return (
    <>
      <Tooltip title="View Images">
        <IconButton size="small" onClick={() => setOpen(true)} aria-label="View images">
          <PhotoLibraryIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : imageUrls.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              No images available for this item.
            </Typography>
          ) : (
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
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
