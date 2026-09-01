export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Delete', icon }) {
  const defaultIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--danger)' }}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
  );

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="dialog-box">
        <div className="dialog-icon">{icon || defaultIcon}</div>
        <h2 id="dialog-title">{title}</h2>
        <p>{message}</p>
        <div className="dialog-actions">
          <button className="btn btn-ghost" onClick={onCancel} id="dialog-cancel-btn">
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} id="dialog-confirm-btn">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
