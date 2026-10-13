import React, { useState } from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
  IconButton,
  Popper,
  Avatar,
  InputAdornment,
} from "@mui/material";
import {
  Clear as ClearIcon,
  Check as CheckIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// ==============================================
// STYLED POPPER
// ==============================================

const StyledPopper = styled(Popper)(({ theme }) => ({
  zIndex: 9999,
  "& .MuiAutocomplete-paper": {
    borderRadius: "12px !important",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12) !important",
    marginTop: "4px !important",
    overflow: "hidden !important",
    backgroundColor: "#ffffff !important",
    border: "1px solid #eef2f6 !important",
  },
  "& .MuiAutocomplete-listbox": {
    padding: "6px !important",
    "& .MuiAutocomplete-option": {
      borderRadius: "8px !important",
      padding: "10px 14px !important",
      marginBottom: "2px !important",
      minHeight: "42px !important",
      fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif !important",
      "&:hover": {
        backgroundColor: "#f5f7fa !important",
      },
      "&[aria-selected='true']": {
        backgroundColor: "#eef2ff !important",
      },
    },
  },
}));

// ==============================================
// MAIN COMPONENT
// ==============================================

const PriAutocompleteSelect = ({
  value,
  data = [],
  optionLabel = "name",
  optionValue = "id",
  onChange,
  placeholder = "Select...",
  label = "",
  loading = false,
  disabled = false,
  error = false,
  helperText = "",
  required = false,
  multiple = false,
  clearable = true,
  size = "medium",
  fullWidth = true,
  className = "",
  optionIcon = null,
  optionSubText = null,
  optionBadge = null,
  optionAvatar = null,
  renderOption = null,
  noOptionsText = "No options available",
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Handle open/close
  const handleOpen = () => {
    if (!disabled && !loading) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Handle input change
  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
  };

  // Handle value change
  const handleChange = (event, newValue) => {
    onChange?.(newValue);
    if (!multiple) {
      handleClose();
    }
  };

  // Handle clear
  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.(multiple ? [] : null);
    setInputValue("");
  };

  // Get option label
  const getOptionLabel = (option) => {
    if (!option) return "";
    return typeof option === "string"
      ? option
      : option[optionLabel] || option.label || option.name || "";
  };

  // Get option value
  const getOptionValue = (option) => {
    if (!option) return null;
    return typeof option === "string"
      ? option
      : option[optionValue] || option.value || option.id || option;
  };

  // Get option icon
  const getOptionIcon = (option) => {
    if (optionIcon && typeof optionIcon === "function") {
      return optionIcon(option);
    }
    if (option.icon) {
      return option.icon;
    }
    if (option.avatar && optionAvatar) {
      return <Avatar src={option.avatar} sx={{ width: 28, height: 28 }} />;
    }
    return null;
  };

  // Get option subtext
  const getOptionSubText = (option) => {
    if (optionSubText && typeof optionSubText === "function") {
      return optionSubText(option);
    }
    return option.subText || option.helperText || null;
  };

  // Get option badge
  const getOptionBadge = (option) => {
    if (optionBadge && typeof optionBadge === "function") {
      return optionBadge(option);
    }
    return option.badge || option.count || null;
  };

  // Default render option
  const defaultRenderOption = (props, option) => {
    const { key, ...restProps } = props;
    const isSelected = multiple
      ? Array.isArray(value) &&
        value.some((v) => getOptionValue(v) === getOptionValue(option))
      : getOptionValue(value) === getOptionValue(option);

    return (
      <Box
        component="li"
        key={key}
        {...restProps}
        className="pri-autocomplete-option"
      >
        <Box className="pri-autocomplete-option-content">
          {getOptionIcon(option) && (
            <Box className="pri-autocomplete-option-icon-wrapper">
              {getOptionIcon(option)}
            </Box>
          )}

          <Box className="pri-autocomplete-option-text-wrapper">
            <Box className="pri-autocomplete-option-label-wrapper">
              <Typography
                variant="body2"
                className={`pri-autocomplete-option-label ${
                  isSelected ? "selected" : ""
                }`}
              >
                {getOptionLabel(option)}
              </Typography>

              {getOptionBadge(option) && (
                <Box className="pri-autocomplete-option-badge">
                  {getOptionBadge(option)}
                </Box>
              )}

              {isSelected && (
                <CheckIcon className="pri-autocomplete-option-check" />
              )}
            </Box>

            {getOptionSubText(option) && (
              <Typography
                variant="caption"
                className="pri-autocomplete-option-subtext"
              >
                {getOptionSubText(option)}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : value !== null && value !== undefined && value !== "";

  // Get size class
  const getSizeClass = () => {
    switch (size) {
      case "small":
        return "pri-autocomplete-small";
      case "large":
        return "pri-autocomplete-large";
      default:
        return "pri-autocomplete-medium";
    }
  };

  return (
    <Box
      className={`pri-autocomplete-wrapper ${getSizeClass()} ${
        fullWidth ? "full-width" : ""
      } ${className}`}
    >
      <Autocomplete
        value={value}
        options={data}
        multiple={multiple}
        disabled={disabled}
        loading={loading}
        open={open}
        onOpen={handleOpen}
        onClose={handleClose}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        isOptionEqualToValue={(option, val) =>
          getOptionValue(option) === getOptionValue(val)
        }
        getOptionLabel={getOptionLabel}
        renderOption={renderOption || defaultRenderOption}
        PopperComponent={StyledPopper}
        noOptionsText={noOptionsText}
        clearOnBlur={false}
        className={`pri-autocomplete ${error ? "error" : ""}`}
        componentsProps={{
          popper: {
            placement: "bottom-start",
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, 4],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  boundary: "viewport",
                },
              },
            ],
          },
          paper: {
            elevation: 0,
            className: "pri-autocomplete-paper",
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={!hasValue ? placeholder : ""}
            error={error}
            helperText={helperText}
            disabled={disabled}
            required={required}
            className="pri-autocomplete-textfield"
            onClick={() => {
              if (!disabled && !loading) {
                setOpen(true);
              }
            }}
            InputProps={{
              ...params.InputProps,
              className: "pri-autocomplete-input-root",
              endAdornment: (
                <>
                  {/* 🔥 Arrow Icon - Custom */}
                  <InputAdornment position="end" className="pri-autocomplete-arrow-adornment">
                    <ArrowDropDownIcon 
                      className={`pri-autocomplete-arrow-icon ${open ? "open" : ""}`}
                    />
                  </InputAdornment>
                  
                  {/* Loading Spinner */}
                  {loading && (
                    <InputAdornment position="end" className="pri-autocomplete-loading-adornment">
                      <CircularProgress size={18} className="pri-autocomplete-spinner" />
                    </InputAdornment>
                  )}
                  
                  {/* Clear Button */}
                  {hasValue && clearable && !loading && (
                    <InputAdornment position="end" className="pri-autocomplete-clear-adornment">
                      <IconButton
                        size="small"
                        onClick={handleClear}
                        className="pri-autocomplete-clear-btn"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )}
                </>
              ),
            }}
          />
        )}
      />
    </Box>
  );
};

export default PriAutocompleteSelect;