// src/components/common/table-componets/confirmation-dialog/DeleteButton.jsx

import React, { useState } from "react";
import { Tooltip, IconButton, Button } from "@mui/material";
import ConfirmationDialog from "../common/table-componets/confirmation-dialog";
import { useTranslation } from "react-i18next";

const DeleteButton = ({ 
  objectId, 
  objectName, 
  onDelete, 
  title = "Delete", 
  itemType = "Item",
  showTooltip = true,
  buttonSize = "small",
  icon = "🗑️",
  variant = "icon", // ✅ New prop: "icon" or "text"
  text = "Delete"   // ✅ New prop: text to show
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loader, setLoader] = useState(false);

  const handleConfirm = async () => {
    setLoader(true);
    try {
      await onDelete(objectId);
    } finally {
      setLoader(false);
      setOpen(false);
    }
  };

  // Generate appropriate title based on itemType
  const getDialogTitle = () => {
    if (title !== "Delete") return title;
    
    const typeMap = {
      "Class": t("class"),
      "Section": t("section"),
      "Subject": t("subject"),
      "Teacher": t("teacher"),
      "Student": t("student"),
      "School": t("school"),
      "State Manager": t("stateManager"),
      "District Manager": t("districtManager"),
      "State": t("state"),
      "District": t("district"),
      "Mapping": t("mapping"),
      "Assignment": t("assignment"),
      "Exam": t("exam"),
      "Result": t("result"),
      "Fee": t("fee"),
      "Notice": t("notice"),
      "Event": t("event"),
      "Attendance": t("attendance"),
      "Homework": t("homework"),
      "Timetable": t("timetable"),
    };
    
    const type = typeMap[itemType] || t(itemType.toLowerCase()) || itemType;
    return `${t("delete")} ${type}`;
  };

  // Generate confirmation message
  const getMessage = () => {
    const defaultMessage = t("deleteConfirmationMessage", { name: objectName }) ||
      `${t("deleteConfirmation")} "${objectName}"? ${t("actionCannotBeUndone")}`;
    
    if (itemType === "Class" && objectName) {
      return t("deleteClassWarning", { className: objectName }) || defaultMessage;
    }
    if (itemType === "Section" && objectName) {
      return t("deleteSectionWarning", { sectionName: objectName }) || defaultMessage;
    }
    
    return defaultMessage;
  };

  // Get tooltip text
  const getTooltipText = () => {
    if (!showTooltip) return "";
    const type = getDialogTitle().replace(t("delete"), "").trim();
    return `${t("delete")} ${type}`;
  };

  // ✅ Render button based on variant
  const renderButton = () => {
    if (variant === "text") {
      // ✅ Text button
      return (
        <Button
          size="small"
          onClick={() => setOpen(true)}
          className="delete-button"
          aria-label={getTooltipText()}
          color="error"
          variant="text"
          sx={{
            fontSize: '12px',
            textTransform: 'none',
            padding: '2px 8px',
            minWidth: 'auto',
            fontWeight: 500
          }}
          startIcon={<span style={{ fontSize: '14px' }}>{icon}</span>}
        >
          {text || t('delete')}
        </Button>
      );
    }

    // ✅ Icon button (default)
    return (
      <IconButton
        size={buttonSize}
        onClick={() => setOpen(true)}
        className="delete-button"
        aria-label={getTooltipText()}
      >
        {icon}
      </IconButton>
    );
  };

  const button = renderButton();

  return (
    <>
      {showTooltip ? (
        <Tooltip title={getTooltipText()} arrow>
          {button}
        </Tooltip>
      ) : (
        button
      )}

      <ConfirmationDialog
        open={open}
        handleClose={() => setOpen(false)}
        handleConfirm={handleConfirm}
        loader={loader}
        title={getDialogTitle()}
        message={getMessage()}
        confirmLabel={t("delete") || "Delete"}
        cancelLabel={t("cancel") || "Cancel"}
        confirmButtonColor="error"
      />
    </>
  );
};

export default DeleteButton;