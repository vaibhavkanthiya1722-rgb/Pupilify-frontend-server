// loginController.js
import { useState, useCallback } from "react";
import AuthService from "../../../services/AuthService";
import { 
  validateEmail,
  validatePassword
} from "../../../utils/validation";
import { useTranslation } from "react-i18next";

const LoginController = (onLogin, onToast) => {
  const { t } = useTranslation(); // ✅ Add this
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Validate email using common validation with language support
  const validateEmailField = useCallback((value) => {
    const error = validateEmail(value, {
      isRequired: true,
      reqMessage: t('validEmailRequired'),
      patternMessage: t('emailInvalid')
    });
    setEmailError(error);
    return !error;
  }, [t]);

  // Validate password using common validation with language support
  const validatePasswordField = useCallback((value) => {
    const error = validatePassword(value, {
      minLength: 6,
      isRequired: true,
      reqMessage: t('passwordIsRequired'),
      minLengthMessage: t('passwordMinLength', { minLength: 6 })
    });
    setPasswordError(error);
    return !error;
  }, [t]);

  // Handle email change with validation
  const handleEmailChange = useCallback((value) => {
    setEmail(value);
    if (emailError) validateEmailField(value);
  }, [emailError, validateEmailField]);

  // Handle password change with validation
  const handlePasswordChange = useCallback((value) => {
    setPassword(value);
    if (passwordError) validatePasswordField(value);
  }, [passwordError, validatePasswordField]);

  // Handle login
  const handleLogin = useCallback(async () => {
    console.log("LOGIN STARTED");

    const isEmailValid = validateEmailField(email);
    const isPasswordValid = validatePasswordField(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      let response = null;

      // 1. DEPARTMENT LOGIN
      try {
        response = await AuthService.departmentLogin({
          username: email.trim(),
          password: password
        });

        onToast?.(t('departmentLoginSuccess') || "Department login successful!", "success");
        onLogin({
          ...response,
          role: response.role || response.user?.role || "ROLE_DEPARTMENT",
          departmentId: response.department?.id,
          departmentType: response.department?.type,
          departmentName: response.department?.name,
          schoolId: response.department?.schoolId,
          loginType: "department"
        });
        return;
      } catch (deptErr) {
        console.log("Department login failed");
      }

      // 2. ADMIN LOGIN
      try {
        response = await AuthService.login({
          username: email.trim(),
          password: password
        });

        onToast?.(t('adminLoginSuccess') || "Admin login successful!", "success");
        onLogin({
          ...response,
          role: response.role || response.user?.role || "ROLE_ADMIN",
          schoolId: response.schoolId,
          loginType: "admin"
        });
        return;
      } catch (adminErr) {
        console.log("Admin login failed");
      }

      // 3. MANAGER LOGIN
      try {
        response = await AuthService.managerLogin({
          username: email.trim(),
          password: password
        });

        onToast?.(t('managerLoginSuccess') || "Manager login successful!", "success");
        onLogin({
          ...response,
          role: response.role || "ROLE_MANAGER",
          loginType: "manager"
        });
        return;
      } catch (managerErr) {
        console.log("Manager login failed");
      }

      // ALL FAILED
      throw new Error(t('invalidCredentials') || "Invalid username or password");

    } catch (err) {
      let errorMsg = t('loginFailed') || "Login failed";
      
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }

      onToast?.(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }, [email, password, validateEmailField, validatePasswordField, onLogin, onToast, t]);

  return {
    email,
    password,
    emailError,
    passwordError,
    loading,
    setEmail: handleEmailChange,
    setPassword: handlePasswordChange,
    handleLogin,
    validateEmail: validateEmailField,
    validatePassword: validatePasswordField
  };
};

export default LoginController;