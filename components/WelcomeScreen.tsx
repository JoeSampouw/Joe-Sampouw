import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="relative text-center bg-slate-800/50 p-8 rounded-2xl shadow-2xl max-w-3xl w-full animate-fade-in-up overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0 opacity-10">
            <img
                src="/assets/images/hero.jpg"
                alt="Background"
                className="w-full h-full object-cover"
            />
        </div>

        <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
                Akselerator Proyek <span className="text-amber-400">Internal Magnapenta</span>
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                Masukkan detail kebutuhan klien untuk menghasilkan draf modul proyek secara instan. Percepat pembuatan proposal, laporan, dan materi presentasi Anda dengan bantuan AI.
            </p>
            <button
                onClick={onStart}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-400/50"
            >
                Buat Draf Proyek Baru
            </button>
        </div>
    </div>
  );
};

export default WelcomeScreen;