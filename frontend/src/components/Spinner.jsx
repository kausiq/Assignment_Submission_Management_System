const Spinner = ({ size = 'md' }) => {
  const dims = size === 'sm' ? 'h-4 w-4 border-2' : 'h-8 w-8 border-[3px]';
  return (
    <div
      className={`${dims} animate-spin rounded-full border-ink-200 border-t-teal-500`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
