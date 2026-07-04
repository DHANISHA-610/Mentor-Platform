const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
};

export default function LoadingSpinner({ size = 'md' }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-brand-200 border-t-brand-600 ${sizeMap[size]}`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
