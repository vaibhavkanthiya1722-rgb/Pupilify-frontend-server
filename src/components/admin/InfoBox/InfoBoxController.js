// components/common/InfoBoxController.js
import { useState } from 'react';
import FileService from '../../../services/FileService';

export default function InfoBoxController({ label, val, isFile = false, folder = 'students', teacherId = null, docType = null, onToast = null }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const getFileIcon = (filename) => {
    if (!filename) return '📎';
    const ext = filename?.split('.').pop()?.toLowerCase();
    switch(ext) {
      case 'pdf': return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp': return '🖼️';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      default: return '📎';
    }
  };

  const isImageFile = (filename) => {
    if (!filename) return false;
    const ext = filename?.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  const handleDownload = async () => {
    if (!val) {
      console.warn('No file path provided');
      if (onToast) onToast('No file to download', 'warning');
      return;
    }
    
    setDownloading(true);
    setError(false);
    
    try {
      console.log('🟡 Downloading file:', val, 'Folder:', folder);
      
      let blob;
      
      // Handle teacher documents with special endpoint
      if (folder === 'teachers' && teacherId && docType) {
        console.log('🟡 Downloading teacher document:', teacherId, docType);
        blob = await FileService.downloadTeacherDocument(teacherId, docType, 'download');
      } else {
        blob = await FileService.downloadFile(val, folder);
      }
      
      if (!blob) {
        throw new Error('No response from server');
      }
      
      if (blob.size === 0) {
        throw new Error('File is empty');
      }
      
      console.log('🟢 File downloaded, size:', blob.size);
      
      const fileName = val.split('/').pop() || 'document';
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      if (onToast) onToast('File downloaded successfully', 'success');
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      setError(true);
      if (onToast) onToast(error.message || 'Failed to download file', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handlePreview = async () => {
    if (!val || !isImageFile(val)) return;
    
    setDownloading(true);
    setError(false);
    
    try {
      let blob;
      
      if (folder === 'teachers' && teacherId && docType) {
        blob = await FileService.downloadTeacherDocument(teacherId, docType, 'view');
      } else {
        blob = await FileService.downloadFile(val, folder);
      }
      
      if (!blob || blob.size === 0) {
        throw new Error('Empty file received');
      }
      
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      setShowPreview(true);
      
    } catch (error) {
      console.error('❌ Preview failed:', error);
      setError(true);
      if (onToast) onToast('Failed to preview file', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setShowPreview(false);
  };

  const fileName = val?.split('/').pop() || 'Document';
  const fileIcon = getFileIcon(fileName);
  const fileExt = fileName.split('.').pop()?.toUpperCase() || 'FILE';
  const isImage = isImageFile(fileName);

  return {
    // State
    downloading,
    error,
    previewUrl,
    showPreview,
    
    // Data
    fileName,
    fileIcon,
    fileExt,
    isImage,
    
    // Functions
    handleDownload,
    handlePreview,
    closePreview,
    
    // Original props
    label,
    val,
    isFile,
    folder,
    teacherId,
    docType
  };
}