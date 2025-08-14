import React from 'react';

interface HeaderProps {
    onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="w-full max-w-5xl flex justify-between items-center p-4 mb-4 md:mb-8">
      <div 
        className="flex items-center space-x-3 cursor-pointer"
        onClick={onReset}
        title="Kembali ke Halaman Utama"
      >
        <div className="p-2 bg-amber-500 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Magnapenta's <span className="text-amber-400">AI</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;