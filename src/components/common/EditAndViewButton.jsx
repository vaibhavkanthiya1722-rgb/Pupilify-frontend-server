import React from "react";
import { Tooltip } from "@mui/material";

const EditAndViewButton = ({
  onClick,
  toolTipTitle = "Edit",
  icon = "✏️",
  className = "cursor_pointer text_edit"
}) => {
  return (
    <Tooltip title={toolTipTitle} placement="top" arrow>
      <span
        onClick={onClick}
        className={className}
        style={{ fontSize: "18px" }}
      >
        {icon}
      </span>
    </Tooltip>
  );
};

export default EditAndViewButton;