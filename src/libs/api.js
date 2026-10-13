import axios from "axios";
import { API_URL } from "./constants";

const baseURL = API_URL;

const instance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("ss_token");
  }
  return null;
};

// ✅ Attach token in every request
instance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For FormData, let browser set Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔥 Refresh handling
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

instance.interceptors.response.use(
  (response) => {
    // ✅ For blob responses, return the full response object
    if (response.config.responseType === 'blob') {
      return response;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // ❌ Ignore auth APIs
    const requestUrl = originalRequest?.url || "";
    const ignoreAuthUrls = [
      "/api/auth/login",
      "/api/auth/manager-login",
      "/api/department-login/login",
      "/api/auth/forgot-password",
      "/api/auth/reset-password",
      "/api/auth/refresh-token",
    ];

    const isAuthRequest = ignoreAuthUrls.some((url) =>
      requestUrl.includes(url)
    );

    if (error.response?.status === 401 && !isAuthRequest) {

      if (originalRequest._retry) {
        localStorage.removeItem("ss_token");
        localStorage.removeItem("ss_role");

        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            };
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const token = getToken();

        const res = await axios.post(
          `${API_URL}/api/auth/refresh-token`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const newToken = res.data.token;

        localStorage.setItem("ss_token", newToken);

        instance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newToken}`;

        processQueue(null, newToken);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return instance(originalRequest);

      } catch (err) {
        processQueue(err, null);

        localStorage.removeItem("ss_token");
        localStorage.removeItem("ss_role");

        window.location.href = "/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ✅ API methods - FIXED
const API = {
  get: async (url, config = {}) => {
    // Check if this is a blob request
    const isBlobRequest = config.responseType === 'blob';
    
    try {
      const response = await instance.get(url, config);
      
      // For blob requests, return the full response
      if (isBlobRequest) {
        return response;
      }
      
      // For JSON requests, return the data
      return response.data;
    } catch (error) {
      // For blob requests with errors, we need to handle differently
      if (isBlobRequest && error.response) {
        // Try to read error message from blob
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          error.response.data = errorData;
        } catch {
          // If not JSON, keep as is
        }
      }
      throw error;
    }
  },

  post: async (url, data = {}, config = {}) => {
    const response = await instance.post(url, data, config);
    return response.data;
  },

  postFormData: async (url, formData, permission = "") => {
    const response = await instance.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        permission,
      },
    });
    return response.data;
  },

  putFormData: async (url, formData, permission = "") => {
    const response = await instance.put(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        permission,
      },
    });
    return response.data;
  },

  put: async (url, data = {}, permission = "") => {
    const response = await instance.put(url, data, {
      headers: { permission },
    });
    return response.data;
  },

  delete: async (url, permission = "") => {
    const response = await instance.delete(url, {
      headers: { permission },
    });
    return response.data;
  },

  deleteWithBody: async (url, permission = "", body = {}) => {
    const response = await instance.delete(url, {
      headers: { permission },
      data: body,
    });
    return response.data;
  },

  fetchFile: async (url) => {
    console.log('🟡 Fetching file from:', url);

    try {
      const token = getToken();

      const response = await fetch(`${baseURL}${url}`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'text/html'
        }
      });

      console.log('🟢 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const htmlText = await response.text();
      console.log('🟢 HTML received, length:', htmlText.length);

      return new Blob([htmlText], { type: 'text/html' });

    } catch (error) {
      console.error('🔴 File fetch error:', error);
      throw error;
    }
  },
};

export default API;