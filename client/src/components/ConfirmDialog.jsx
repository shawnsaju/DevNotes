export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Delete', icon = '🗑️' }) {
  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="dialog-box">
        <div className="dialog-icon">{icon}</div>
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
