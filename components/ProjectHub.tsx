import React, { useState, useEffect } from 'react';
import { ProjectFramework, ProjectModule } from '../types';

interface ProjectHubProps {
  framework: ProjectFramework;
  currentStep: number;
  isGenerating: boolean;
  isRefining: boolean;
  onGenerateNext: () => void;
  onRefine: (moduleIndex: number, instruction: string) => void;
  onReset: () => void;
  error: string | null;
}

const FormattedText: React.FC<{ content: string }> = ({ content }) => {
    const format = (text: string) => {
        if (!text) return '';
        const escapedText = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        
        return escapedText
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
            .replace(/\n/g, '<br />');
    };
    return <div className="text-slate-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: format(content) }} />;
};

const RefineForm: React.FC<{
  isRefining: boolean;
  onSubmit: (instruction: string) => void;
  onCancel: () => void;
}> = ({ isRefining, onSubmit, onCancel }) => {
  const [instruction, setInstruction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(instruction.trim()){
      onSubmit(instruction);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-slate-900/50 rounded-lg space-y-3 animate-fade-in">
      <label htmlFor="refine-instruction" className="block text-sm font-medium text-slate-300">Instruksi Penyempurnaan</label>
      <textarea
        id="refine-instruction"
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder="Contoh: Buat analisis ini lebih ringkas dan fokus pada aspek finansial."
        rows={3}
        className="w-full bg-slate-700 border-slate-600 text-white rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200"
        disabled={isRefining}
      />
      <div className="flex items-center justify-end space-x-3">
        <button type="button" onClick={onCancel} disabled={isRefining} className="text-sm text-slate-400 hover:text-white transition">Batal</button>
        <button type="submit" disabled={isRefining || !instruction.trim()} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-md text-sm transition disabled:bg-slate-600 disabled:cursor-not-allowed">
          {isRefining ? 'Memperbaiki...' : 'Perbaiki dengan AI'}
        </button>
      </div>
    </form>
  );
}


const Section: React.FC<{ title: string; children: React.ReactNode; isCompleted: boolean; onRefineClick: () => void; showRefineForm: boolean; isRefining: boolean; onRefineSubmit: (instruction: string) => void; onRefineCancel: () => void; }> = 
({ title, children, isCompleted, onRefineClick, showRefineForm, isRefining, onRefineSubmit, onRefineCancel }) => (
    <div className={`bg-slate-800/70 p-6 rounded-xl border-slate-700 border transition-all duration-500 ${isCompleted ? 'opacity-100' : 'opacity-50'}`}>
        <h3 className="font-bold text-lg text-amber-400 mb-3">{title}</h3>
        {children}
        {isCompleted && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
                { !showRefineForm && (
                    <div className="flex justify-end">
                        <button onClick={onRefineClick} disabled={isRefining} className="text-xs text-amber-400 border border-amber-400/50 rounded-full px-3 py-1 hover:bg-amber-400/10 transition disabled:opacity-50 disabled:cursor-not-allowed">
                            Sempurnakan dengan AI
                        </button>
                    </div>
                )}
                {showRefineForm && <RefineForm isRefining={isRefining} onSubmit={onRefineSubmit} onCancel={onRefineCancel} />}
            </div>
        )}
    </div>
);

const ProjectHub: React.FC<ProjectHubProps> = ({ framework, currentStep, isGenerating, isRefining, onGenerateNext, onRefine, onReset, error }) => {
  const [refiningIndex, setRefiningIndex] = useState<number | null>(null);
  const [proposalCopied, setProposalCopied] = useState(false);

  useEffect(() => {
    if (!isRefining) {
        setRefiningIndex(null);
    }
  }, [isRefining]);

  const handleRefineSubmit = (instruction: string) => {
    if (refiningIndex !== null) {
      onRefine(refiningIndex, instruction);
    }
  };

  const handleCopyProposal = () => {
    if (framework.proposal) {
      // Create a temporary textarea to preserve line breaks
      const textArea = document.createElement("textarea");
      // Replace **bold** with nothing for plain text copy, and preserve line breaks
      textArea.value = framework.proposal.replace(/\*\*(.*?)\*\*/g, '$1');
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setProposalCopied(true);
        setTimeout(() => setProposalCopied(false), 2000);
      } catch (err) {
        console.error('Gagal menyalin proposal', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDownloadProposal = () => {
    if (framework.proposal) {
      // Replace **bold** with nothing for plain text download
      const plainTextProposal = framework.proposal.replace(/\*\*(.*?)\*\*/g, '$1');
      const blob = new Blob([plainTextProposal], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Proposal-Magnapenta.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const sections = [
    { 
      title: '1. Analisis Situasi',
      content: framework.situationalAnalysis,
      isCompleted: currentStep >= 1
    },
    { 
      title: '2. Modul Proyek',
      content: framework.projectModules,
      isCompleted: currentStep >= 2
    },
    { 
      title: '3. Langkah Implementasi',
      content: framework.implementationSteps,
      isCompleted: currentStep >= 3
    },
    { 
      title: '4. Manajemen Risiko',
      content: framework.potentialRisks,
      isCompleted: currentStep >= 4
    },
    {
      title: '5. Draf Proposal Resmi',
      content: framework.proposal,
      isCompleted: currentStep >= 5
    }
  ];

  const nextActionText = () => {
      switch (currentStep) {
          case 1: return "Lanjutkan: Hasilkan Modul Proyek";
          case 2: return "Lanjutkan: Hasilkan Langkah Implementasi";
          case 3: return "Lanjutkan: Hasilkan Manajemen Risiko";
          case 4: return "Lanjutkan: Hasilkan Draf Proposal";
          default: return "Selesai";
      }
  }

  return (
    <div className="w-full max-w-4xl space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-extrabold text-center text-white">Project Builder</h2>
        <p className="text-center text-slate-400 mt-2">Kerangka proyek Anda dibangun langkah demi langkah. Sempurnakan setiap modul sesuai kebutuhan.</p>
      </div>
      
      <div className="space-y-6">
        {sections.map((sec, index) => (
          <Section 
            key={sec.title} 
            title={sec.title} 
            isCompleted={sec.isCompleted}
            onRefineClick={() => setRefiningIndex(index)}
            showRefineForm={refiningIndex === index}
            isRefining={isRefining && refiningIndex === index}
            onRefineSubmit={handleRefineSubmit}
            onRefineCancel={() => setRefiningIndex(null)}
          >
            {sec.isCompleted ? (
              sec.content ? (
                Array.isArray(sec.content) ? (
                  sec.title === '2. Modul Proyek' ? (
                    <div className="space-y-4">
                      {(sec.content as ProjectModule[]).map((mod, i) => (
                         <div key={i} className="p-4 bg-slate-900/50 rounded-lg">
                            <FormattedText content={`**${mod.title}**\n${mod.description}`} />
                         </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="list-disc list-inside space-y-2 pl-2">
                      {(sec.content as string[]).map((item, i) => <li key={i}><FormattedText content={item} /></li>)}
                    </ul>
                  )
                ) : (
                  <>
                    <FormattedText content={sec.content as string} />
                    {index === 4 && sec.isCompleted && sec.content && (
                      <div className="mt-6 flex items-center space-x-4">
                          <button
                            onClick={handleCopyProposal}
                            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition disabled:opacity-50"
                            disabled={proposalCopied}
                          >
                            {proposalCopied ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                            <span>{proposalCopied ? 'Tersalin!' : 'Salin Proposal'}</span>
                          </button>
                          <button
                            onClick={handleDownloadProposal}
                            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              <span>Unduh (.txt)</span>
                          </button>
                      </div>
                    )}
                  </>
                )
              ) : <p className="text-slate-500 text-sm">Menunggu generasi konten...</p>
            ) : (
              <p className="text-slate-500 text-sm">Menunggu langkah sebelumnya selesai...</p>
            )}
          </Section>
        ))}
      </div>
      
      {error && <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm text-center">{error}</div>}

      <div className="text-center pt-4">
        {currentStep < 5 ? (
          <button
            onClick={onGenerateNext}
            disabled={isGenerating || isRefining}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-400/50 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isGenerating ? 'AI sedang bekerja...' : nextActionText()}
          </button>
        ) : (
          <button
            onClick={onReset}
            disabled={isRefining}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-green-400/50 disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            Buat Proyek Baru
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectHub;