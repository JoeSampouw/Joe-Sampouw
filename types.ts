export interface FormData {
  businessName: string;
  industry: string;
  companySize: string;
  challenge: string;
  focusArea: string;
}

export interface ProjectModule {
  title: string;
  description:string;
}

export interface ProjectFramework {
  situationalAnalysis?: string;
  projectModules?: ProjectModule[];
  implementationSteps?: string[];
  potentialRisks?: string[];
  proposal?: string;
}

export enum AppStep {
  Welcome,
  Form,
  Loading,
  ProjectBuilder,
  Error,
}