// src/components/common/LanguageSwitcher.jsx
import React, { useState } from 'react';
import { Button, Menu, MenuItem, Box, Typography, IconButton, Tooltip } from '@mui/material';
import { useTranslation } from "react-i18next";

const LanguageSwitcher = ({ variant = 'icon' }) => {
  const { i18n} = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // Get current language from i18n
  const currentLanguage = i18n.language;
  
  // Define languages array
  const languages = [
    { code: 'en', name: 'English'},
    { code: 'hi', name: 'हिंदी' }
  ];
  
  // Change language function
  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    handleClose();
  };

  // Button variant (with text)
  if (variant === 'button') {
    return (
      <>
        <Button
          onClick={handleClick}
          variant="outlined"
          size="small"
          startIcon="🌐"
          className='sa-btn-ghost languagebtn'
          sx={{
            minWidth: 'auto',
            padding: '4px 10px',
            fontSize: '13px',
            textTransform: 'none'
          }}
        >
          {currentLanguage === 'hi' ? 'भाषा' : 'Language'}
        </Button>

        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          {languages.map((lang) => (
            <MenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              selected={currentLanguage === lang.code}
            >
              <Box className="d-flex align-items-center gap-1">
                <span>{lang.flag}</span>
                <Typography>{lang.name}</Typography>
                {currentLanguage === lang.code && (
                  <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                    ✓
                  </Typography>
                )}
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  // Icon variant (default - just flags)
  return (
    <>
      <Tooltip title={currentLanguage === 'hi' ? 'भाषा चुनें' : 'Select Language'}>
        <IconButton onClick={handleClick} size="small">
          <span style={{ fontSize: '1.2rem' }}>
            {currentLanguage === 'en' ? '🇬🇧' : '🇮🇳'}
          </span>
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={currentLanguage === lang.code}
          >
            <Box className="d-flex align-items-center gap-1">
              <span>{lang.flag}</span>
              <Typography>{lang.name}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;