import React, { useState } from 'react';

function FileUpload({ label, fileKey, files, onChange, maxSize = 2 }) {
  const [error, setError] = useState('');
  const currentFile = files[fileKey];
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('');
    
    if (file) {
      // Check file size (maxSize in MB)
      const maxSizeBytes = maxSize * 1024 * 1024;
      
      if (file.size > maxSizeBytes) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        setError(`File size (${fileSizeMB}MB) exceeds ${maxSize}MB limit`);
        onChange(fileKey, null);
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPG, PNG, GIF, or PDF files are allowed');
        onChange(fileKey, null);
        return;
      }
      
      // File is valid
      onChange(fileKey, file);
    } else {
      onChange(fileKey, null);
    }
  };

  const handleRemove = () => {
    onChange(fileKey, null);
    setError('');
  };

  return (
    <div className="pri-form-field">
      <label>{label}</label>
      <div className={`pri-file-wrap${currentFile ? ' has-file' : ''}`}>
        <input 
          type="file" 
          className="pri-file-input" 
          accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf"
          onChange={handleFileChange} 
        />
        <div className="pri-file-label">
          <span className="pri-file-icon">{currentFile ? '✅' : '📎'}</span>
          <div style={{ flex: 1 }}>
            {currentFile ? (
              <>
                <div className="pri-file-name" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{currentFile.name}</span>
                  <button
                    type="button"
                    onClick={handleRemove}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      padding: '2px 8px',
                      cursor: 'pointer',
                      fontSize: 11,
                      marginLeft: 8
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
                <div className="pri-file-size">
                  {(currentFile.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              </>
            ) : (
              <div className="pri-file-text">
                Click to upload (JPG, PNG, GIF, PDF) • Max {maxSize}MB
              </div>
            )}
          </div>
        </div>
      </div>
      {error && (
        <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default FileUpload;