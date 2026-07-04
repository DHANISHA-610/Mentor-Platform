import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-4">
        <FiAlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {message && <p className="mt-2 max-w-sm text-sm text-slate-500">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <FiRefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
