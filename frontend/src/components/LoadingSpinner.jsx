import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
      <p className="mt-4 text-slate-700 font-semibold">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
