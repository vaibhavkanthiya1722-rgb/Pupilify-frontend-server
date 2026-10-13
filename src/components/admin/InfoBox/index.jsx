// components/common/InfoBox.js
import React from 'react';
import InfoBoxController from './InfoBoxController';

const InfoBox = (props) => {
  const {
    downloading,
    error,
    fileName,
    fileIcon,
    fileExt,
    handleDownload,
    label,
    val,
    isFile,
   
  } = InfoBoxController(props);

  // Add spinner animation style
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  if (isFile && val) {
    return (
      <div style={{
        background: '#f8fafc',
        padding: '12px 14px',
        borderRadius: 12,
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              background: '#e0f2fe',
              color: '#0369a1',
              padding: '4px 10px',
              borderRadius: 16,
              fontSize: 12,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <span>{fileIcon}</span>
              <span style={{
                maxWidth: 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {fileName}
              </span>
            </span>
            <span style={{
              background: '#f1f5f9',
              padding: '2px 6px',
              borderRadius: 4,
              fontSize: 10,
              color: '#64748b'
            }}>
              {fileExt}
            </span>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              background: error ? '#ef4444' : '#1e3a5f',
              color: 'white',
              border: 'none',
              padding: '4px 12px',
              borderRadius: 6,
              fontSize: 12,
              cursor: downloading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s',
              opacity: downloading ? 0.8 : 1
            }}
          >
            {downloading ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                Downloading...
              </>
            ) : error ? (
              <>
                <span>❌</span>
                Retry
              </>
            ) : (
              <>
                <span>⬇️</span>
                Download
              </>
            )}
          </button>
        </div>
        {error && (
          <div className="pri-empty">
            <span>⚠️</span>
            Download failed. Click retry.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className='pri-info-box '>
      <div className='pri-info-label'>
        {label}
      </div>
      <div className='pri-info-val'>
        {val || '—'}
      </div>
    </div>
  );
};

export default InfoBox;