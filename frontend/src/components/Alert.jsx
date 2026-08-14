const VARIANTS = {
  error: 'bg-rose-100 border-rose-100 text-rose-600',
  success: 'bg-teal-50 border-teal-100 text-teal-700',
  info: 'bg-ink-50 border-ink-100 text-ink-600'
};

const Alert = ({ variant = 'info', children }) => {
  if (!children) return null;
  return (
    <div className={`mb-4 rounded border px-4 py-2.5 text-sm ${VARIANTS[variant]}`} role="alert">
      {children}
    </div>
  );
};

export default Alert;
