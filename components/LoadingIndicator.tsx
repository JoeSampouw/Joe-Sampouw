import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Menganalisis kebutuhan klien...",
  "Merancang modul proyek berdasarkan metodologi Magnapenta...",
  "Menyusun draf kerangka kerja...",
  "Memformat output untuk penggunaan internal...",
  "Finalisasi draf proyek...",
];

const LoadingIndicator: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center text-center p-8 animate-fade-in">
            <svg className="animate-spin h-16 w-16 text-amber-500 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">AI sedang menyusun draf...</h2>
            <p className="text-slate-300 text-lg transition-opacity duration-500">{loadingMessages[messageIndex]}</p>
        </div>
    );
};

export default LoadingIndicator;