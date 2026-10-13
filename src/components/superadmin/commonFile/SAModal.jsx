import React from 'react';

function SAModal({ title, children, footer, onClose, wide }) {
  return (
    <div className="sa-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`sa-modal${wide ? ' wide' : ''}`}>
        <div className="sa-modal-header">
          <div className="sa-modal-title">{title}</div>
          <button className="sa-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="sa-modal-body">{children}</div>
        {footer && <div className="sa-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export default SAModal;