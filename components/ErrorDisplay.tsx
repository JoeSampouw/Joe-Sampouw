
import React from 'react';

interface ErrorDisplayProps {
  error: string;
  onReset: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onReset }) => {
  return (
    <div className="text-center bg-red-900/50 border border-red-700 p-8 rounded-2xl shadow-2xl max-w-2xl w-full animate-fade-in">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500 mb-4">
            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        Terjadi Kesalahan
      </h2>
      <p className="text-red-200 mb-8">
        {error}
      </p>
      <button
        onClick={onReset}
        className="bg-slate-200 hover:bg-white text-slate-900 font-bold py-2 px-6 rounded-full text-md transition-all duration-300 ease-in-out"
      >
        Coba Lagi
      </button>
    </div>
  );
};

export default ErrorDisplay;
