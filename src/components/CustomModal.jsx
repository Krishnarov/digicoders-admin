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
import { Loader2 } from "lucide-react";

const CustomModal = ({
  open,
  onClose,
  title,
  children,
  onSubmit,
  isBtnHide,
  boxWidth, loading
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
            {loading && (
              <Loader2 className="animate-spin  mr-2" />
            )} Save
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CustomModal;
