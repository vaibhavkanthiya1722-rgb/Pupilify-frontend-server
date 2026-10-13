// forgotPasswordController.js
import { useState, useCallback, useEffect, useRef } from "react";
import AuthService from "../../../services/AuthService";
import { 
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateOtp
} from "../../../utils/validation";
import { useTranslation } from "react-i18next";

const ForgotPasswordController = (onToast) => {
  const { t } = useTranslation(); // ✅ Add this
  
  // State
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [timer, setTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  
  // Validation errors
  const [forgotEmailError, setForgotEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const timerIntervalRef = useRef(null);

  // Helper functions
  const getErrorMessage = useCallback((error) => {
    if (!error) return t('unknownError') || "An unknown error occurred";
    if (typeof error === 'string') return error;
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === 'string') return data;
      if (data.message) return data.message;
      if (data.error) return data.error;
      return JSON.stringify(data);
    }
    if (error.message) return error.message;
    return t('unknownError') || "An error occurred";
  }, [t]);

  const getSuccessMessage = useCallback((response) => {
    if (!response) return t('operationSuccess') || "Operation successful";
    const data = response.data || response;
    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.success && typeof data.success === 'string') return data.success;
    return t('operationSuccess') || "Operation successful";
  }, [t]);

  // ✅ Validation functions using common validation with language support
  const validateForgotEmail = useCallback((value) => {
    const error = validateEmail(value, {
      isRequired: true,
      reqMessage: t('validEmailRequired'),
      patternMessage: t('emailInvalid')
    });
    setForgotEmailError(error);
    return !error;
  }, [t]);

  const validateOtpField = useCallback((value) => {
    const error = validateOtp(value, {
      isRequired: true,
      reqMessage: t('otpRequired'),
      invalidMessage: t('otpInvalid'),
      length: 6
    });
    setOtpError(error);
    return !error;
  }, [t]);

  const validateNewPasswordField = useCallback((value) => {
    const error = validatePassword(value, {
      minLength: 6,
      isRequired: true,
      reqMessage: t('passwordIsRequired'),
      minLengthMessage: t('passwordMinLength', { minLength: 6 })
    });
    setNewPasswordError(error);
    return !error;
  }, [t]);

  const validateConfirmPasswordField = useCallback((value, password) => {
    const error = validateConfirmPassword(value, password, {
      reqMessage: t('confirmPasswordRequired'),
      mismatchMessage: t('passwordMismatch')
    });
    setConfirmPasswordError(error);
    return !error;
  }, [t]);

  // Timer functions
  const startResendTimer = useCallback(() => {
    setResendDisabled(true);
    setTimer(30);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setForgotError("");
    setForgotSuccess("");
    setForgotEmailError("");
    setOtpError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
  }, []);

  // Open modal
  const handleForgotOpen = useCallback((email = "") => {
    setForgotOpen(true);
    setForgotStep(0);
    setForgotEmail(email);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    clearErrors();
  }, [clearErrors]);

  // Close modal
  const handleForgotClose = useCallback(() => {
    setForgotOpen(false);
    setForgotStep(0);
    setForgotEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    clearErrors();
    setTimer(0);
    setResendDisabled(false);
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  }, [clearErrors]);

  // Send OTP
  const handleSendOtp = useCallback(async () => {
    if (!validateForgotEmail(forgotEmail)) return;

    setForgotLoading(true);
    clearErrors();

    try {
      const res = await AuthService.forgotPassword(forgotEmail.trim());
      const successMsg = getSuccessMessage(res);
      setForgotSuccess(successMsg);
      if (onToast) onToast(successMsg, "success");
      setForgotStep(1);
      startResendTimer();
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setForgotError(errorMsg);
      if (onToast) onToast(errorMsg, "error");
      console.error("Send OTP Error:", err);
    } finally {
      setForgotLoading(false);
    }
  }, [forgotEmail, validateForgotEmail, clearErrors, getSuccessMessage, onToast, startResendTimer, getErrorMessage]);

  // Verify OTP
  const handleVerifyOtp = useCallback(async () => {
    if (!validateOtpField(otp)) return;

    setForgotLoading(true);
    clearErrors();

    try {
      // For demo - verify OTP
      if (otp.length === 6 || otp === "123456") {
        const successMsg = t('otpVerified') || "OTP verified successfully!";
        setForgotSuccess(successMsg);
        if (onToast) onToast(successMsg, "success");
        setForgotStep(2);
      } else {
        throw new Error(t('invalidOtp') || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setForgotError(errorMsg);
      if (onToast) onToast(errorMsg, "error");
    } finally {
      setForgotLoading(false);
    }
  }, [otp, validateOtpField, clearErrors, onToast, getErrorMessage, t]);

  // Reset password
  const handleResetPassword = useCallback(async () => {
    const isNewPasswordValid = validateNewPasswordField(newPassword);
    const isConfirmPasswordValid = validateConfirmPasswordField(confirmPassword, newPassword);
    
    if (!isNewPasswordValid || !isConfirmPasswordValid) return;

    setForgotLoading(true);
    clearErrors();

    try {
      const res = await AuthService.resetPassword({
        email: forgotEmail.trim(),
        otp: otp.trim(),
        newPassword: newPassword.trim()
      });

      const successMsg = getSuccessMessage(res);
      setForgotSuccess(successMsg);
      if (onToast) onToast(successMsg, "success");

      setTimeout(() => {
        handleForgotClose();
      }, 2000);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setForgotError(errorMsg);
      if (onToast) onToast(errorMsg, "error");
    } finally {
      setForgotLoading(false);
    }
  }, [newPassword, confirmPassword, forgotEmail, otp, validateNewPasswordField, validateConfirmPasswordField, clearErrors, getSuccessMessage, onToast, handleForgotClose, getErrorMessage]);

  // Resend OTP
  const handleResendOtp = useCallback(async () => {
    if (resendDisabled) {
      if (onToast) onToast(t('waitBeforeResend', { seconds: timer }) || `Please wait ${timer} seconds before resending`, "warning");
      return;
    }

    if (!validateForgotEmail(forgotEmail)) return;

    setForgotLoading(true);
    clearErrors();

    try {
      const res = await AuthService.forgotPassword(forgotEmail.trim());
      const successMsg = getSuccessMessage(res);
      setForgotSuccess(successMsg);
      if (onToast) onToast(successMsg, "success");
      startResendTimer();
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setForgotError(errorMsg);
      if (onToast) onToast(errorMsg, "error");
    } finally {
      setForgotLoading(false);
    }
  }, [resendDisabled, timer, forgotEmail, validateForgotEmail, clearErrors, getSuccessMessage, onToast, startResendTimer, getErrorMessage, t]);

  // Handlers with validation
  const handleForgotEmailChange = useCallback((value) => {
    setForgotEmail(value);
    if (forgotEmailError) validateForgotEmail(value);
  }, [forgotEmailError, validateForgotEmail]);

  const handleOtpChange = useCallback((value) => {
    setOtp(value);
    if (otpError) validateOtpField(value);
  }, [otpError, validateOtpField]);

  const handleNewPasswordChange = useCallback((value) => {
    setNewPassword(value);
    if (newPasswordError) validateNewPasswordField(value);
    if (confirmPassword) validateConfirmPasswordField(confirmPassword, value);
  }, [newPasswordError, confirmPassword, validateNewPasswordField, validateConfirmPasswordField]);

  const handleConfirmPasswordChange = useCallback((value) => {
    setConfirmPassword(value);
    if (confirmPasswordError) validateConfirmPasswordField(value, newPassword);
  }, [confirmPasswordError, validateConfirmPasswordField, newPassword]);

  return {
    // State
    forgotOpen,
    forgotEmail,
    forgotStep,
    otp,
    newPassword,
    confirmPassword,
    forgotLoading,
    forgotError,
    forgotSuccess,
    timer,
    resendDisabled,
    
    // Validation errors
    forgotEmailError,
    otpError,
    newPasswordError,
    confirmPasswordError,
    
    // Setters with validation
    setForgotEmail: handleForgotEmailChange,
    setOtp: handleOtpChange,
    setNewPassword: handleNewPasswordChange,
    setConfirmPassword: handleConfirmPasswordChange,
    
    setForgotStep,
    
    // Handlers
    handleForgotOpen,
    handleForgotClose,
    handleSendOtp,
    handleVerifyOtp,
    handleResetPassword,
    handleResendOtp,
    
    // Validation functions
    validateForgotEmail,
    validateOtp: validateOtpField,
    validateNewPassword: validateNewPasswordField,
    validateConfirmPassword: validateConfirmPasswordField
  };
};

export default ForgotPasswordController;