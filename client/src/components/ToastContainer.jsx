export default function ToastContainer({ toasts }) {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`} role="alert">
          <span>
            {t.type === 'success' && '✅'}
            {t.type === 'error'   && '❌'}
            {t.type === 'info'    && 'ℹ️'}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
