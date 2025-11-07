import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: (event: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disableBackdropClick?: boolean;
}

const FormModal: React.FC<FormModalProps> = ({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false,
  maxWidth = 'md',
  fullWidth = true,
  disableBackdropClick = false,
}) => {
  const handleClose = (event: object, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (disableBackdropClick && reason === 'backdropClick') {
      return;
    }
    onClose();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (onSubmit) {
      onSubmit(event);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      disableEscapeKeyDown={disableBackdropClick}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          {children}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit" disabled={loading}>
            {cancelLabel}
          </Button>
          {onSubmit && (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : submitLabel}
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default FormModal;
