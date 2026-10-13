// index.js - Only UI/Design with Language Support
import React from 'react';
import {
  Box, Grid, Paper, Typography, TextField, Button,
  InputAdornment, IconButton, CircularProgress,
  Dialog, DialogContent, DialogActions,
  Alert
} from '@mui/material';
import LoginController from "./loginController";
import ForgotPasswordController from './forgotPasswordController';
import Toast from '../../../components/common/Toast';
import LanguageSwitcher from '../../../components/common/LanguageSwitcher';
import { useTranslation } from "react-i18next";

export default function Login({ onLogin }) {
  // Language
  const { t } = useTranslation();

  // Toast state
  const [toast, setToast] = React.useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const showToast = (message, severity = 'info') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => setToast({ ...toast, open: false });

  // Login Controller
  const {
    email,
    setEmail,
    emailError,
    password,
    setPassword,
    passwordError,
    loading,
    handleLogin
  } = LoginController(onLogin, showToast);

  // Forgot Password Controller
  const {
    forgotOpen,
    forgotEmail,
    setForgotEmail,
    forgotEmailError,
    forgotStep,
    setForgotStep,
    otp,
    setOtp,
    otpError,
    newPassword,
    setNewPassword,
    newPasswordError,
    confirmPassword,
    setConfirmPassword,
    confirmPasswordError,
    forgotLoading,
    forgotError,
    forgotSuccess,
    timer,
    resendDisabled,
    handleForgotOpen,
    handleForgotClose,
    handleSendOtp,
    handleVerifyOtp,
    handleResetPassword,
    handleResendOtp
  } = ForgotPasswordController(showToast);

  const [showPass, setShowPass] = React.useState(false);

  // ✅ Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Box className="login-page">

      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
        <LanguageSwitcher variant="button" />
      </Box>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleCloseToast}
      />

      <Grid container className="login-grid login-container">
        {/* Left Side - Branding */}
        <Grid item xs={12} md={6} lg={6} className="login-left">
          <Box className="brand-section">
            <Box className="brand-icon">
              <img src="/images/logo.png" alt="School Logo" />
            </Box>
            <Box>
              <Typography variant="h5" className="brand-name">{t('smartSchool') || 'SmartSchool'}</Typography>
              <Typography variant="caption" className="brand-tagline">
                {t('schoolManagementSystem') || 'School Management System'}
              </Typography>
            </Box>
          </Box>
          <Box className="hero-section">
            <Box className="book-wrapper">
              <Box className="open-book">
                <Box className="left-cover"></Box>
                <Box className="right-cover"></Box>
                <Box className="page page1"></Box>
                <Box className="page page2"></Box>
                <Box className="page page3"></Box>
                <Box className="page page4"></Box>
              </Box>
            </Box>
            <Typography variant="h3" className="hero-title">
              {t('completeSchoolManagementPlatform') || 'Complete School Management Platform'}
            </Typography>
            <Typography variant="body1" className="hero-text">
              {t('heroText') || 'Manage classes, teachers, students, attendance, timetables, and fees — all from one powerful dashboard.'}
            </Typography>
          </Box>
          <Box className="features-section">
            {[
              ['🛡️', t('superAdmin') || 'Super Admin', t('superAdminDesc') || 'Full system control over all schools'],
              ['🏫', t('principal') || 'Principal', t('principalDesc') || 'Manage your school end-to-end'],
              ['🔐', t('secure') || 'Secure', t('secureDesc') || 'JWT authenticated sessions'],
            ].map(([icon, title, desc]) => (
              <Paper key={title} className="feature-badge" elevation={0}>
                <span className="feature-icon">{icon}</span>
                <Box>
                  <Typography variant="subtitle2" className="feature-title">{title}</Typography>
                  <Typography variant="caption" className="feature-desc">{desc}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Grid>

        {/* Right Side - Login Form */}
        <Grid item xs={12} md={6} lg={6} sx={{ minWidth: { xs: '100%', md: '392px' } }}>
          <Paper elevation={6} className="login-card">
            <Box className="brand-icon">
              <img src="/images/logofil.png" alt="School Logo" />
            </Box>
            <Box className="login-header">
              <Typography variant="h4" className="login-title">
                {t('welcomeBackIcon') || 'Welcome Back 👋'}
              </Typography>
              <Typography variant="body2" className="login-subtitle">
                {t('subtitle') || 'Sign in to continue – auto‑detects your role'}
              </Typography>
            </Box>

            <Box className="input-wrapper">
              <Typography variant="subtitle2" className="input-label">
                {t('emailAddress') || 'Email Address'}
              </Typography>
              <TextField
                fullWidth
                placeholder={t('emailPlaceholder') || 'admin@school.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyPress} // ✅ Enter key support
                error={!!emailError}
                helperText={(emailError && t(emailError)) || emailError}
                size="small"
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><span>✉️</span></InputAdornment>)
                }}
                sx={{
                  width: '100%',
                  maxWidth: '305px',
                  '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' }
                }}
              />
            </Box>

            <Box className="input-wrapper">
              <Typography variant="subtitle2" className="input-label">
                {t('password') || 'Password'}
              </Typography>
              <TextField
                fullWidth
                type={showPass ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder') || 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyPress} // ✅ Enter key support
                error={!!passwordError}
                helperText={(passwordError && t(passwordError)) || passwordError}
                size="small"
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><span>🔑</span></InputAdornment>),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass(!showPass)} edge="end" size="small">
                        {showPass ? '🙈' : '👁️'}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  width: '100%',
                  maxWidth: '305px',
                  '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc' }
                }}
              />
            </Box>

            <Box className="forgot-password-container">
              <Button
                onClick={() => handleForgotOpen(email)}
                className="forgot-password-link"
                sx={{ textTransform: 'none', color: '#3b82f6', fontSize: '14px', fontWeight: 500 }}
              >
                {t('forgotPassword') || 'Forgot Password?'}
              </Button>
            </Box>

            {/* ✅ FIXED: Correct onClick handler */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              className="login-button"
              onClick={handleLogin} // ✅ Correct - calling handleLogin
              disabled={loading}
              sx={{
                maxWidth: '305px',
                py: 1.2,
                bgcolor: '#1e3a5f',
                '&:hover': { bgcolor: '#2c4a7f' },
                '&:disabled': { bgcolor: '#94a3b8' },
                textTransform: 'none'
              }}
            >
              {loading ? (
                <Box className="loading-content" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  <span>{t('signingIn') || 'Signing in...'}</span>
                </Box>
              ) : (
                t('signIn') || 'Sign In →'
              )}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Forgot Password Dialog */}
      <Dialog
        open={forgotOpen}
        onClose={handleForgotClose}
        maxWidth="sm"
        fullWidth
        className="forgot-password-dialog"
      >
        {/* Gradient Header */}
        <Box className="forgot-password-header">
          <Box className="forgot-password-icon-wrapper">
            <span className="forgot-password-icon">🔐</span>
          </Box>
          <Typography variant="h5" className="forgot-password-title">
            {t('resetPasswordKey') || 'Reset Password'}
          </Typography>
          <Typography variant="body2" className="forgot-password-subtitle">
            {forgotStep === 0 && (t('enterEmail') || "Enter your email to receive OTP")}
            {forgotStep === 1 && (t('enterOtp') || "Enter the OTP sent to your email")}
            {forgotStep === 2 && (t('setPassword') || "Set your new password")}
          </Typography>
        </Box>

        <DialogContent className="forgot-password-content">
          {/* Step Indicator */}
          <Box className="step-indicator">
            <Box className="step-indicator-track">
              {['Email', 'OTP', 'Password'].map((label, idx) => (
                <Box key={idx} className="step-item">
                  <Box className={`step-circle ${forgotStep > idx ? 'completed' :
                      forgotStep === idx ? 'active' : 'inactive'
                    }`}>
                    {forgotStep > idx ? '✓' : idx + 1}
                  </Box>
                  <Typography variant="caption" className={`step-label ${forgotStep >= idx ? 'active' : 'inactive'
                    }`}>
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Step 1: Email */}
          {forgotStep === 0 && (
            <Box className="step-container">
              <label className="form-label">
                {t('emailAddress') || 'Email Address'}
              </label>
              <TextField
                fullWidth
                placeholder={t('emailPlaceholder') || 'admin@school.com'}
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                disabled={forgotLoading}
                error={!!forgotEmailError}
                helperText={(forgotEmailError && t(forgotEmailError)) || forgotEmailError}
                size="medium"
                className="form-field mb-10"
                InputProps={{
                  startAdornment: (<InputAdornment position="start">✉️</InputAdornment>),
                }}
              />
              <Button
                variant="contained"
                fullWidth
                onClick={handleSendOtp}
                disabled={forgotLoading || !forgotEmail || !!forgotEmailError}
                className="action-button action-button-primary"
              >
                {forgotLoading ? (
                  <Box className="loading-spinner" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={24} color="inherit" />
                    <span>Sending...</span>
                  </Box>
                ) : (t('sendOtp') || 'Send OTP →')}
              </Button>
            </Box>
          )}

          {/* Step 2: Verify OTP */}
          {forgotStep === 1 && (
            <Box className="step-container">
              <Box className="info-card email">
                <span className="info-card-icon">📧</span>
                <Typography variant="body2" className="info-card-text">
                  {t('otpSent') || 'OTP sent to'} <strong>{forgotEmail}</strong>
                </Typography>
              </Box>

              <label className="form-label">
                {t('enterOtp') || 'Enter OTP'}
              </label>
              <TextField
                fullWidth
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={forgotLoading}
                error={!!otpError}
                helperText={(otpError && t(otpError)) || otpError}
                size="medium"
                className="form-field otp-field"
                InputProps={{
                  startAdornment: (<InputAdornment position="start">🔢</InputAdornment>),
                }}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleVerifyOtp}
                disabled={forgotLoading || !otp || !!otpError}
                className="action-button action-button-primary"
              >
                {forgotLoading ? (
                  <Box className="loading-spinner" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={24} color="inherit" />
                    <span>Verifying...</span>
                  </Box>
                ) : (t('forgotPassword.verify') || 'Verify OTP →')}
              </Button>

              <Box className="resend-link">
                <Button
                  onClick={handleResendOtp}
                  disabled={resendDisabled || forgotLoading}
                  className="resend-button"
                >
                  {resendDisabled ? (
                    <span>{t('forgotPassword.resendIn') || 'Resend in'} {timer}s</span>
                  ) : (
                    t('resendOtp') || '↻ Resend OTP'
                  )}
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 3: Reset Password */}
          {forgotStep === 2 && (
            <Box className="step-container">
              <Box className="info-card success">
                <span className="info-card-icon">✅</span>
                <Typography variant="body2" className="info-card-text success">
                  {t('otpVerified') || 'OTP verified successfully! Create your new password.'}
                </Typography>
              </Box>

              <label className="form-label">
                {t('newPassword') || 'New Password'}
              </label>
              <TextField
                fullWidth
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={forgotLoading}
                error={!!newPasswordError}
                helperText={(newPasswordError && t(newPasswordError)) || newPasswordError}
                size="medium"
                className="form-field"
                InputProps={{
                  startAdornment: (<InputAdornment position="start">🔑</InputAdornment>),
                }}
              />

              <label className="form-label">
                {t('confirmPassword') || 'Confirm Password'}
              </label>
              <TextField
                fullWidth
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={forgotLoading}
                error={!!confirmPasswordError}
                helperText={(confirmPasswordError && t(confirmPasswordError)) || confirmPasswordError}
                size="medium"
                className="form-field"
                InputProps={{
                  startAdornment: (<InputAdornment position="start">✅</InputAdornment>),
                }}
              />

              {/* Password Strength Indicator */}
              {newPassword && newPassword.length > 0 && (
                <Box className="password-strength">
                  <Box className="strength-bars">
                    <Box className={`strength-bar ${newPassword.length >= 2 ?
                        (newPassword.length >= 6 ? 'strong' : 'medium') : 'weak'
                      }`} />
                    <Box className={`strength-bar ${newPassword.length >= 4 ?
                        (newPassword.length >= 8 ? 'strong' : 'medium') : 'inactive'
                      }`} />
                    <Box className={`strength-bar ${newPassword.length >= 6 ? 'strong' : 'inactive'
                      }`} />
                  </Box>
                  <Typography className={`strength-text ${newPassword.length >= 8 ? 'strong' :
                      newPassword.length >= 6 ? 'medium' : 'weak'
                    }`}>
                    {newPassword.length < 6 ? 'Weak - Use at least 6 characters' :
                      newPassword.length < 8 ? 'Medium - Good start!' :
                        'Strong - Great password!'}
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={handleResetPassword}
                disabled={forgotLoading || !newPassword || !confirmPassword || !!newPasswordError || !!confirmPasswordError}
                className="action-button action-button-primary"
              >
                {forgotLoading ? (
                  <Box className="loading-spinner" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={24} color="inherit" />
                    <span>Resetting...</span>
                  </Box>
                ) : (t('resetPassword') || 'Reset Password →')}
              </Button>
            </Box>
          )}

          {/* Error and Success Messages */}
          {forgotError && (
            <Alert
              severity="error"
              className="alert-message"
            >
              {(typeof forgotError === 'string' && t(forgotError)) || forgotError || JSON.stringify(forgotError)}
            </Alert>
          )}
          {forgotSuccess && (
            <Alert
              severity="success"
              className="alert-message"
            >
              {(typeof forgotSuccess === 'string' && t(forgotSuccess)) || forgotSuccess || JSON.stringify(forgotSuccess)}
            </Alert>
          )}
        </DialogContent>

        <DialogActions className="forgot-password-footer">
          <Button
            onClick={handleForgotClose}
            variant="text"
            className="footer-button-cancel"
          >
            {t('cancel') || 'Cancel'}
          </Button>
          {forgotStep > 0 && (
            <Button
              onClick={() => setForgotStep(forgotStep - 1)}
              variant="outlined"
              className="footer-button-back"
            >
              ← {t('back') || 'Back'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}