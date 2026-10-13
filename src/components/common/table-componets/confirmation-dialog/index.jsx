import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress
} from "@mui/material";

const ConfirmationDialog = ({
  open,
  handleClose,
  handleConfirm,
  message = "Are you sure?",
  loader = false,
  confirmLabel = "Yes",
  cancelLabel = "No",
  title = "Confirm Action"
}) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <DialogContentText>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={loader}
          variant="outlined"
        >
          {cancelLabel}
        </Button>

        <Button
          onClick={handleConfirm}
          disabled={loader}
          color="error"
          variant="contained"
        >
          {loader ? <CircularProgress size={18} color="inherit" /> : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;