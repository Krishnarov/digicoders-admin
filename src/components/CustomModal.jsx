// components/CustomModal.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const CustomModal = ({
  open,
  onClose,
  title,
  children,
  onSubmit,
  isBtnHide,
  boxWidth
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={boxWidth}>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {title}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>{children}</DialogContent>
      {!isBtnHide && (
        <DialogActions>
          <Button onClick={onClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button onClick={onSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CustomModal;
