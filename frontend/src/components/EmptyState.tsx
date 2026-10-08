import { Database } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface EmptyStateProps {
  message?: string;
  isLoading?: boolean;
}

export default function EmptyState({ 
  message = "Upload a CSV or load the demo dataset to get started.",
  isLoading = false
}: EmptyStateProps) {
  if (isLoading) {
    return (
      <div className="py-24 flex flex-col justify-center items-center">
        <LoadingSpinner />
        <p className="mt-4 text-sm text-slate-500">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="text-center py-24 px-6">
      <Database className="mx-auto h-12 w-12 text-slate-300 mb-4" />
      <h3 className="text-lg font-medium text-slate-900 mb-1">No leads found</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto">{message}</p>
    </div>
  );
}
