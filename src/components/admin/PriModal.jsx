import React from 'react';

function PriModal({ title, children, footer, onClose, wide, danger }) {
  return (
    <div className="pri-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`pri-modal${wide ? ' wide' : ''}${danger ? ' danger-modal' : ''}`}>
        <div className="pri-modal-header" style={danger ? { background: 'linear-gradient(135deg, #fff7ed, #fef2f2)', borderBottom: '1px solid #fecaca' } : {}}>
          <div className="pri-modal-title" style={danger ? { color: '#dc2626' } : {}}>{title}</div>
          <button className="pri-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="pri-modal-body">{children}</div>
        {footer && <div className="pri-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export default PriModal;