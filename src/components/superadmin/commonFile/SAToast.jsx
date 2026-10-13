
import React, { useEffect } from 'react';

function SAToast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className={`sa-toast ${type}`}>
      <span>{type === 'success' ? '✓' : '⚠'}</span>
      <span>{msg}</span>
    </div>
  );
}

export default SAToast;