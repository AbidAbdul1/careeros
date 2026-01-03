
export type AppView = 'dashboard' | 'resume' | 'roadmap' | 'ats' | 'projects' | 'interview' | 'profile';

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Modern' | 'Professional' | 'Creative' | 'Technical';
  previewStyle: string;
}

export interface UserProfile {
  isAuthenticated: boolean;
  profileId: string;
  name: string;
  email: string;
  picture?: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
  academicsSummary: string;
  experience: {
    company: string;
    role: string;
    location: string;
    date: string;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    location: string;
    date: string;
    grade: string;
  }[];
  skills: string[];
  projects: {
    name: string;
    description: string;
    link: string;
    bullets: string[];
  }[];
  achievements: string[];
  extra: {
    category: string;
    details: string;
  }[];
}

export interface JobData {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  tools: string[];
  experienceLevel: string;
  roleSummary: string;
  keywords: string[];
}

export interface Resource {
  title: string;
  url: string;
  platform: 'YouTube' | 'Article' | 'Course';
  description?: string;
}

export interface InterviewPrepData {
  questions: { question: string; category: string; hint?: string }[];
  technicalTopics: string[];
  resources: Resource[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  type: 'text' | 'action' | 'result' | 'voice';
  actionType?: 'job_analysis' | 'resume' | 'roadmap' | 'ats' | 'interview' | 'navigate' | 'projects';
  data?: any;
  timestamp: Date;
  isFast?: boolean;
}

export interface RoadmapStep {
  title: string;
  description: string;
  topics: string[];
  timeline: string;
  status?: 'pending' | 'completed' | 'in-progress';
}

export interface RoadmapData {
  steps: RoadmapStep[];
  recommendedResources: Resource[];
}

export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary: string;
  experience: {
    company: string;
    role: string;
    location: string;
    date: string;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    location: string;
    date: string;
    grade?: string;
  }[];
  skills: string[];
  projects?: {
    name: string;
    description: string;
    link: string;
    bullets: string[];
  }[];
  achievements?: string[];
  extra?: {
    category: string;
    details: string;
  }[];
  latexCode?: string;
  referenceHighlights?: string[];
  mimicScore?: number;
}

export interface ATSResult {
  score: number;
  matchingSkills: string[];
  missingSkills: string[];
  suggestions: string[];
}

export interface Slide {
  header: string;
  content: string[];
  speakerNotes?: string;
  imagePrompt?: string;
  imageType: 'AI' | 'BROWSER' | 'NONE';
  imageUrl?: string;
}

export interface PPTContent {
  title: string;
  theme: 'modern' | 'dark' | 'professional' | 'creative';
  font: 'sans' | 'serif' | 'mono';
  slides: Slide[];
}

export interface VoiceSessionState {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  mode: 'chat' | 'mock-interview';
}
