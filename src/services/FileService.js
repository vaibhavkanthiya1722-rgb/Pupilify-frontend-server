
import { API_URL } from "../libs/constants";

const FileService = {

  /**
   * Download any file using the fetchFile method
   */
  downloadFile: async (filePath, folder = 'students') => {
    console.log('🟡 DownloadFile called:', filePath, folder);
    
    // Extract filename from path
    let filename = filePath;
    if (filePath.includes('/')) {
      filename = filePath.split('/').pop();
    }
    
    // Clean the filename
    let cleanFilename;
    try {
      cleanFilename = decodeURIComponent(filename);
    } catch (e) {
      cleanFilename = filename;
    }
    
    // ✅ Get token
    const token = localStorage.getItem('ss_token');
    console.log('🟡 Token present:', !!token);
    
    let url = '';
    
    if (folder === 'teachers') {
      console.error('For teacher documents, please use downloadTeacherDocument method');
      throw new Error('Use downloadTeacherDocument for teacher files');
    } else {
      // ✅ URL encode properly
      const encodedFilename = encodeURIComponent(cleanFilename);
      url = `/api/admin/students/files/${encodedFilename}`;
    }
    
    console.log('🟡 Request URL:', url);
    
    try {
      // ✅ Method 1: Use fetch directly with token
      const fullUrl = `${API_URL}${url}`;
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      console.log('🟢 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('🟢 Blob received, size:', blob.size);
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = cleanFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);
      
      return blob;
      
    } catch (error) {
      console.error('🔴 File download failed:', error);
      throw error;
    }
  },

  /**
   * Download teacher document with proper endpoint
   */
  downloadTeacherDocument: async (teacherId, docType, mode = 'download') => {
    const token = localStorage.getItem('ss_token');
    const url = `${API_URL}/api/admin/teachers/${teacherId}/document/${docType}?mode=${mode}`;
    
    console.log('🟡 Downloading teacher document:', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${docType}_${teacherId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);
      
      return blob;
      
    } catch (error) {
      console.error('Teacher document download failed:', error);
      throw error;
    }
  },

  /**
   * Get file URL with authentication token
   */
  getFileUrl: (filename, folder = 'students') => {
    if (!filename) return null;
    
    let cleanFilename = filename;
    if (filename.includes('/')) {
      cleanFilename = filename.split('/').pop();
    }
    
    try {
      cleanFilename = decodeURIComponent(cleanFilename);
    } catch (e) {
      // Keep as is
    }
    
    const token = localStorage.getItem('ss_token');
    
    if (folder === 'teachers') {
      return null;
    }
    
    const encodedFilename = encodeURIComponent(cleanFilename);
    // ✅ Add token to URL
    return `${API_URL}/api/admin/students/files/${encodedFilename}?token=${token}`;
  },

  /**
   * Get teacher document URL
   */
  getTeacherDocumentUrl: (teacherId, docType, mode = 'view') => {
    const token = localStorage.getItem('ss_token');
    return `${API_URL}/api/admin/teachers/${teacherId}/document/${docType}?mode=${mode}&token=${token}`;
  },

  /**
   * Upload file with FormData
   */
  uploadFile: async (file, folder = 'students', additionalData = {}) => {
    const formData = new FormData();
    
    const sanitizedFile = sanitizeFileForUpload(file);
    formData.append('file', sanitizedFile);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const token = localStorage.getItem('ss_token');
    let url = '';
    
    if (folder === 'teachers') {
      url = `${API_URL}/api/admin/upload/teachers`;
    } else {
      url = `${API_URL}/api/admin/upload/${folder}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Delete file
   */
  deleteFile: async (filename, folder = 'students') => {
    let cleanFilename = filename;
    if (filename.includes('/')) {
      cleanFilename = filename.split('/').pop();
    }
    
    try {
      cleanFilename = decodeURIComponent(cleanFilename);
    } catch (e) {
      // Keep as is
    }
    
    const token = localStorage.getItem('ss_token');
    const encodedFilename = encodeURIComponent(cleanFilename);
    const url = `${API_URL}/api/admin/files/${folder}/${encodedFilename}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    return response.json();
  }
};

// Helper function to sanitize file before upload
function sanitizeFileForUpload(file) {
  if (!file) return file;
  
  const cleanName = file.name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  
  return new File([file], cleanName, { type: file.type });
}

export default FileService;