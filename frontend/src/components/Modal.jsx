const Modal = ({ open, title, onClose, children, width = 'max-w-lg' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4">
      <div className={`card w-full ${width} max-h-[90vh] overflow-y-auto p-6`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink-800">{title}</h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate hover:bg-ink-50 hover:text-ink-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
