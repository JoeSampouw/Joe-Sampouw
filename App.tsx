import React, { useState, useCallback } from 'react';
import { FormData, ProjectFramework, AppStep } from './types';
import { 
  generateSituationalAnalysis,
  generateProjectModules,
  generateImplementationSteps,
  generatePotentialRisks,
  generateProposal
} from './services/geminiService';
import WelcomeScreen from './components/WelcomeScreen';
import BusinessForm from './components/BusinessForm';
import LoadingIndicator from './components/LoadingIndicator';
import ProjectHub from './components/ProjectHub';
import ErrorDisplay from './components/ErrorDisplay';
import Header from './components/Header';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.Welcome);
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    industry: '',
    companySize: 'Startup (< 10 Karyawan)',
    challenge: '',
    focusArea: 'Pusat Penilaian (Assessment Center)',
  });
  const [projectFramework, setProjectFramework] = useState<ProjectFramework>({});
  const [error, setError] = useState<string | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  const handleStart = () => {
    setStep(AppStep.Form);
  };
  
  const handleReset = () => {
    setFormData({
        businessName: '',
        industry: '',
        companySize: 'Startup (< 10 Karyawan)',
        challenge: '',
        focusArea: 'Pusat Penilaian (Assessment Center)',
    });
    setProjectFramework({});
    setError(null);
    setStep(AppStep.Welcome);
    setCurrentModuleIndex(0);
    setIsGenerating(false);
    setIsRefining(false);
  };

  const handleSubmit = useCallback(async (currentFormData: FormData) => {
    setStep(AppStep.Loading);
    setError(null);
    try {
      if (!process.env.API_KEY) {
        throw new Error("API Key tidak ditemukan. Mohon atur variabel lingkungan API_KEY.");
      }
      const analysis = await generateSituationalAnalysis(currentFormData);
      setProjectFramework({ situationalAnalysis: analysis });
      setCurrentModuleIndex(1);
      setStep(AppStep.ProjectBuilder);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan yang tidak diketahui.');
      setStep(AppStep.Error);
    }
  }, []);

  const handleGenerateNextModule = async () => {
    if (isGenerating || isRefining) return;
    setIsGenerating(true);
    setError(null);
    try {
      let newFramework = { ...projectFramework };
      switch (currentModuleIndex) {
        case 1:
          if(projectFramework.situationalAnalysis) {
            const modules = await generateProjectModules(formData, projectFramework.situationalAnalysis);
            newFramework.projectModules = modules;
          }
          break;
        case 2:
          if(projectFramework.situationalAnalysis && projectFramework.projectModules) {
            const steps = await generateImplementationSteps(formData, projectFramework.situationalAnalysis, projectFramework.projectModules);
            newFramework.implementationSteps = steps;
          }
          break;
        case 3:
           if(projectFramework.situationalAnalysis && projectFramework.projectModules && projectFramework.implementationSteps) {
            const risks = await generatePotentialRisks(formData, projectFramework.situationalAnalysis, projectFramework.projectModules, projectFramework.implementationSteps);
            newFramework.potentialRisks = risks;
          }
          break;
        case 4:
          if(projectFramework.situationalAnalysis && projectFramework.projectModules && projectFramework.implementationSteps && projectFramework.potentialRisks) {
            const proposal = await generateProposal(formData, projectFramework);
            newFramework.proposal = proposal;
          }
          break;
      }
      setProjectFramework(newFramework);
      setCurrentModuleIndex(prev => prev + 1);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Gagal menghasilkan modul berikutnya.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefineModule = useCallback(async (moduleIndex: number, instruction: string) => {
    if (isGenerating || isRefining) return;
    setIsRefining(true);
    setError(null);
    try {
      let newFramework = { ...projectFramework };
      switch(moduleIndex) {
        case 0: {
          const refinedAnalysis = await generateSituationalAnalysis(formData, instruction, projectFramework.situationalAnalysis);
          newFramework.situationalAnalysis = refinedAnalysis;
          break;
        }
        case 1: {
          const refinedModules = await generateProjectModules(formData, projectFramework.situationalAnalysis!, instruction, projectFramework.projectModules);
          newFramework.projectModules = refinedModules;
          break;
        }
        case 2: {
          const refinedSteps = await generateImplementationSteps(formData, projectFramework.situationalAnalysis!, projectFramework.projectModules!, instruction, projectFramework.implementationSteps);
          newFramework.implementationSteps = refinedSteps;
          break;
        }
        case 3: {
          const refinedRisks = await generatePotentialRisks(formData, projectFramework.situationalAnalysis!, projectFramework.projectModules!, projectFramework.implementationSteps!, instruction, projectFramework.potentialRisks);
          newFramework.potentialRisks = refinedRisks;
          break;
        }
        case 4: {
          const refinedProposal = await generateProposal(formData, projectFramework, instruction, projectFramework.proposal);
          newFramework.proposal = refinedProposal;
          break;
        }
      }
      setProjectFramework(newFramework);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : `Gagal menyempurnakan modul.`);
    } finally {
      setIsRefining(false);
    }
  }, [formData, projectFramework, isGenerating, isRefining]);

  const renderStep = () => {
    switch (step) {
      case AppStep.Welcome:
        return <WelcomeScreen onStart={handleStart} />;
      case AppStep.Form:
        return <BusinessForm initialData={formData} onSubmit={handleSubmit} />;
      case AppStep.Loading:
        return <LoadingIndicator />;
      case AppStep.ProjectBuilder:
        return <ProjectHub
                  framework={projectFramework}
                  currentStep={currentModuleIndex}
                  onGenerateNext={handleGenerateNextModule}
                  onRefine={handleRefineModule}
                  isGenerating={isGenerating}
                  isRefining={isRefining}
                  onReset={handleReset}
                  error={error}
               />;
      case AppStep.Error:
        return <ErrorDisplay error={error || 'Terjadi kesalahan.'} onReset={handleReset} />;
      default:
        return <WelcomeScreen onStart={handleStart} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <Header onReset={handleReset}/>
      <main className="w-full max-w-5xl flex-grow flex flex-col items-center justify-center">
        {renderStep()}
      </main>
      <footer className="w-full max-w-5xl text-center p-4 mt-8">
         <p className="text-sm text-slate-500">
           &copy; {new Date().getFullYear()} Joe Sampouw. Didukung oleh Magnapenta's AI.
         </p>
      </footer>
    </div>
  );
};

export default App;