import React, { useEffect } from 'react';

function PriToast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  return <div className={`pri-toast ${type}`}><span>{type === 'success' ? '✓' : '⚠'}</span><span>{msg}</span></div>;
}

export default PriToast;