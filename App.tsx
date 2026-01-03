import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppView, ChatMessage, JobData, ResumeData, RoadmapStep, RoadmapData, ATSResult, InterviewPrepData, VoiceSessionState, PPTContent, UserProfile, ResumeTemplate } from './types';
import { processChat, getGenAI, TOOLS_LIST } from './services/gemini';
import { LiveServerMessage } from '@google/genai';
import ResumeViewer from './components/ResumeViewer';
import RoadmapViewer from './components/RoadmapViewer';
import ATSAnalysis from './components/ATSAnalysis';
import InterviewPrep from './components/InterviewPrep';
import PPTGenerator from './components/PPTGenerator';
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';

// --- Audio Helpers ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

// --- Main Component ---

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOptimizingATS, setIsOptimizingATS] = useState(false);

  // Data States
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null); // For Reference Upload
  const [selectedStyle, setSelectedStyle] = useState<string>('modern'); // For Style Selection
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [interviewData, setInterviewData] = useState<InterviewPrepData | null>(null);
  const [pptContent, setPptContent] = useState<PPTContent | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceSessionState>({ isActive: false, isListening: false, isSpeaking: false, mode: 'chat' });
  
  const optimizationAttemptRef = useRef(0);

  // Initialize Profile with Error Handling
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const defaultProfile = {
      isAuthenticated: false,
      profileId: '',
      name: '', email: '', phone: '', linkedin: '', github: '', portfolio: '', summary: '',
      academicsSummary: '',
      experience: [], education: [], skills: [], projects: [],
      achievements: [], extra: []
    };
    try {
      const saved = localStorage.getItem('career_os_profile');
      if (saved) return JSON.parse(saved);
      return defaultProfile;
    } catch (e) {
      console.error("Failed to load profile from local storage", e);
      return defaultProfile;
    }
  });

  useEffect(() => {
    localStorage.setItem('career_os_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Job Post Upload
  const resumeBuilderFileInputRef = useRef<HTMLInputElement>(null); // Resume Reference Upload
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);

  // Auto-scroll chat
  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Profile Validator
  const isProfileComplete = useCallback((profile: UserProfile): boolean => {
    if (!profile.name || !profile.email || !profile.summary || profile.summary.trim() === '') return false;
    // Allow if at least one experience OR education is present for flexibility, though experience is preferred
    if (profile.experience.length === 0 && profile.education.length === 0) return false;
    return true;
  }, []);

  // Handlers
  const handleLoginSuccess = (userData: any) => {
    const updatedProfile = { ...userProfile, ...userData, isAuthenticated: true };
    setUserProfile(updatedProfile);
    if (!isProfileComplete(updatedProfile)) setActiveView('profile');
  };

  const handleProfileSave = (profile: UserProfile) => {
    setUserProfile(profile);
    if (isProfileComplete(profile)) setActiveView('dashboard');
  };

  const handleLogout = () => {
    if (confirm("Sign out of CareerOS? This will reset your current AI context.")) {
      localStorage.removeItem('career_os_profile');
      // @ts-ignore
      if (window.google && window.google.accounts) {
        // @ts-ignore
        google.accounts.id.disableAutoSelect();
      }
      window.location.reload();
    }
  };

  const addMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = { ...msg, id: Math.random().toString(36).substring(7), timestamp: new Date() };
    setMessages(prev => [...prev, newMsg]);
  };

  const handleFunctionCall = (fc: any) => {
    const args = fc.args;
    switch (fc.name) {
      case 'navigateApp':
        setActiveView(args.targetView as AppView);
        break;
      case 'analyzeJob':
        setJobData(args as JobData);
        setActiveView('dashboard');
        addMessage({ role: 'assistant', text: `Analyzing opportunity at ${args.company}...`, type: 'result' });
        break;
      case 'generateResume':
        setResumeData(args as ResumeData);
        setActiveView('resume');
        addMessage({ role: 'assistant', text: "Resume generated. Running automatic ATS screening...", type: 'text' });
        sendMessage("Perform an ATS check for this newly generated resume based on the job description.", undefined, true);
        break;
      case 'generateRoadmap':
        setRoadmapData({ steps: args.steps, recommendedResources: args.recommendedResources || [] });
        setActiveView('roadmap');
        break;
      case 'checkATS':
        setAtsResult(args as ATSResult);
        setActiveView('ats');
        if (args.score < 80 && optimizationAttemptRef.current < 2) {
          optimizationAttemptRef.current += 1;
          setIsOptimizingATS(true);
          addMessage({ role: 'assistant', text: `ATS score is ${args.score}%. Auto-optimizing keywords...`, type: 'text' });
          sendMessage(`The current resume has an ATS score of ${args.score}%. Regenerate the resume with keywords: ${args.missingSkills.join(', ')}.`, undefined, true);
        } else {
          setIsOptimizingATS(false);
          optimizationAttemptRef.current = 0;
        }
        break;
      case 'prepareInterview':
        setInterviewData(args as InterviewPrepData);
        setActiveView('interview');
        break;
      case 'generateProjectsPPT':
        setPptContent(args as PPTContent);
        setActiveView('projects');
        break;
    }
  };

  const sendMessage = async (text: string, fileData?: { data: string; mimeType: string }, isSilent: boolean = false) => {
    if (!text && !fileData) return;
    if (text && !isSilent) addMessage({ role: 'user', text, type: 'text' });
    setInput('');
    setIsProcessing(true);

    try {
      const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }));
      const response = await processChat(text, history, fileData);
      if (response.text) addMessage({ role: 'assistant', text: response.text, type: 'text' });
      if (response.functionCalls) response.functionCalls.forEach(handleFunctionCall);
    } catch (error) {
      console.error(error);
      addMessage({ role: 'assistant', text: "Service error. Please try again.", type: 'text' });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Resume Generator Logic ---
  const handleGenerateResume = () => {
    // 1. Validation
    if (!userProfile.name) {
      alert("Please complete your profile in the 'Profile' tab first.");
      setActiveView('profile');
      return;
    }

    // 2. Base Prompt with User Data (Source of Truth)
    const profileContext = JSON.stringify({
      personalInfo: {
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
        linkedin: userProfile.linkedin,
        github: userProfile.github
      },
      summary: userProfile.summary,
      experience: userProfile.experience,
      education: userProfile.education,
      skills: userProfile.skills,
      projects: userProfile.projects
    });

    let prompt = `
      ACT AS A RESUME ARCHITECT.
      
      TASK: Generate a resume using the data provided below.
      
      DATA SOURCE (Use this content EXACTLY):
      ${profileContext}
    `;

    // 3. Logic: If File Uploaded -> Mimic Layout. If No File -> Use Selected Style.
    if (resumeFile) {
      prompt += `
      VISUAL INSTRUCTION: I have uploaded an image of a resume.
      GOAL: Write LaTeX code that mimics the VISUAL LAYOUT of the uploaded image exactly.
      - Use the same header style (left/right/center aligned).
      - Use the same font styles (serif vs sans-serif).
      - Use the same section spacing and lines.
      - BUT replace the text content with the DATA SOURCE provided above.
      - Also return a JSON representation of the resume structure for the web preview.
      `;

      // Convert file to Base64 for Gemini
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string)?.split(',')[1];
        if (base64) {
          addMessage({ role: 'assistant', text: `Analyzing layout of ${resumeFile.name} and injecting your profile data...`, type: 'text' });
          sendMessage(prompt, { data: base64, mimeType: resumeFile.type }, true); // true = silent user message
        }
      };
      reader.readAsDataURL(resumeFile);

    } else {
      prompt += `
      VISUAL INSTRUCTION: Create a ${selectedStyle} style resume.
      - Generate professional LaTeX code for this style.
      - Return the JSON structure for web preview.
      `;
      sendMessage(prompt);
    }
  };


  const startVoiceSession = async () => {
    if (voiceState.isActive) {
      sessionRef.current?.close();
      setVoiceState(prev => ({ ...prev, isActive: false }));
      return;
    }
    const ai = getGenAI();
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          setVoiceState({ isActive: true, isListening: true, isSpeaking: false, mode: 'chat' });
          const source = inputCtx.createMediaStreamSource(stream);
          const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            sessionPromise.then(s => s.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputCtx.destination);
        },
        onmessage: async (m: LiveServerMessage) => {
          const base64 = m.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
            const buf = await decodeAudioData(decode(base64), outputCtx, 24000, 1);
            const src = outputCtx.createBufferSource();
            src.buffer = buf;
            src.connect(outputCtx.destination);
            src.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buf.duration;
          }
        }
      }
    });
    sessionRef.current = await sessionPromise;
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'resume', label: 'Resume', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'roadmap', label: 'Roadmap', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3' },
    { id: 'ats', label: 'ATS Score', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2' },
    { id: 'interview', label: 'Interviews', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6' },
    { id: 'projects', label: 'Projects', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18' },
  ];

  const getViewLabel = (view: AppView) => {
    if (view === 'projects') return 'PROJECTS';
    return view.toUpperCase();
  };

  // --- Render ---

  if (!userProfile.isAuthenticated) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-50">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-100 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">CareerOS</h1>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => setActiveView(item.id as AppView)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-semibold ${activeView === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                </svg>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-3 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={startVoiceSession}
            className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${voiceState.isActive ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-200'}`}
          >
            <div className={`w-2 h-2 rounded-full ${voiceState.isActive ? 'bg-white animate-pulse' : 'bg-slate-300'}`}></div>
            {voiceState.isActive ? 'Voice Live' : 'Voice Agent'}
          </button>
          
          <button 
            onClick={handleLogout}
            className="group w-full py-4 px-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all duration-300 active:scale-95 shadow-sm"
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            End Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <header className="h-16 px-8 border-b border-slate-200 bg-white flex items-center justify-between z-40">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] leading-none mb-1">{getViewLabel(activeView)}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 leading-none">{userProfile.name}</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Status: Active Agent</p>
            </div>
            {userProfile.picture ? (
              <img src={userProfile.picture} alt="Profile" className="w-10 h-10 rounded-full border-2 border-slate-100 shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm">
                 <span className="text-xs font-black text-slate-400">{userProfile.name.charAt(0)}</span>
              </div>
            )}
          </div>
        </header>

        {/* View Container */}
        <div className="flex-1 overflow-auto p-8 lg:p-12" ref={scrollRef}>
          <div className="max-w-5xl mx-auto h-full space-y-10">
            
            {activeView === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 bg-indigo-600 p-10 rounded-2xl shadow-indigo-100 shadow-xl text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Accelerate your career, {userProfile.name.split(' ')[0]}.</h2>
                      <p className="text-indigo-100 text-base font-medium mb-8 max-w-md">The CareerOS agent is ready. Upload a job post to generate tailored assets instantly.</p>
                      <div className="flex gap-3">
                        <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-white text-indigo-600 rounded-lg text-sm font-bold shadow-md hover:bg-slate-50 transition-all">Upload Job Context</button>
                        <input type="file" ref={fileInputRef} hidden onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (re) => {
                              const base64 = (re.target?.result as string)?.split(',')[1];
                              if (base64) sendMessage(`Analyze this job post screenshot.`, { data: base64, mimeType: file.type });
                            };
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 bg-white p-8 rounded-2xl border border-slate-200 card-shadow flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Target Role</span>
                      <h4 className="text-xl font-bold text-slate-900 leading-tight">{jobData?.title || 'No Job Selected'}</h4>
                      <p className="text-indigo-600 font-semibold text-sm mt-1">{jobData?.company || 'Waiting for Data'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 card-shadow overflow-hidden flex flex-col h-[500px]">
                   <div className="flex-1 overflow-auto p-8 space-y-6 bg-slate-50/20" ref={chatScrollRef}>
                      {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                          <p className="text-sm font-semibold">Initiate protocol with a message or job post.</p>
                        </div>
                      )}
                      {messages.map(m => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-4 rounded-xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 shadow-sm'}`}>
                            {m.text}
                          </div>
                        </div>
                      ))}
                      {isProcessing && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-2">
                            <div className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce"></div>
                            <span className="text-[10px] font-black text-indigo-600 uppercase ml-2">Assistant is thinking...</span>
                          </div>
                        </div>
                      )}
                   </div>
                   <div className="p-6 bg-white border-t border-slate-100">
                      <div className="relative flex items-center gap-4 bg-slate-50 p-2 pl-6 rounded-xl border border-slate-200">
                        <input 
                          type="text" 
                          value={input} 
                          onChange={e => setInput(e.target.value)} 
                          onKeyDown={e => e.key === 'Enter' && sendMessage(input)} 
                          placeholder="How can Assistant help today?" 
                          className="flex-1 bg-transparent py-3 text-sm font-semibold outline-none"
                        />
                        <button onClick={() => sendMessage(input)} disabled={isProcessing} className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7-7 7"></path></svg>
                        </button>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeView === 'resume' && (
              <div className="space-y-12 animate-in fade-in duration-500">
                <div className="bg-white p-10 rounded-2xl border border-slate-200 card-shadow flex flex-col gap-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-2xl font-extrabold mb-2 tracking-tight">Resume Studio</h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">
                        Upload a reference resume to copy its layout, or choose a style below.
                        <br/>
                        <span className="text-indigo-600 font-bold">We will inject your Profile Data automatically.</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Upload Section */}
                  <div 
                    onClick={() => resumeBuilderFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      resumeFile ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <input type="file" ref={resumeBuilderFileInputRef} hidden onChange={e => setResumeFile(e.target.files?.[0] || null)} />
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                      {resumeFile ? (
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      ) : (
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                      )}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                      {resumeFile ? resumeFile.name : 'Upload Reference PDF/Image'}
                    </span>
                    {resumeFile && <span className="text-[10px] text-indigo-600 font-bold mt-1">Layout Reference Loaded</span>}
                  </div>

                  {/* Style Selector (Only show if no file uploaded) */}
                  {!resumeFile && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Modern', 'Executive', 'Minimal', 'Creative'].map((style) => (
                        <button
                          key={style}
                          onClick={() => setSelectedStyle(style.toLowerCase())}
                          className={`p-4 rounded-xl border-2 text-sm font-bold transition-all duration-200 flex flex-col items-center gap-2 ${
                            selectedStyle === style.toLowerCase()
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md transform scale-105'
                              : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full ${selectedStyle === style.toLowerCase() ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                          {style}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button 
                      onClick={handleGenerateResume} 
                      disabled={isProcessing} 
                      className="px-8 py-4 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        resumeFile ? 'Mimic Layout & Inject Data' : `Generate ${selectedStyle} Resume`
                      )}
                    </button>
                  </div>
                </div>
                
                {(resumeData || userProfile) && (
                  <ResumeViewer 
                    data={resumeData} 
                    userProfile={userProfile}
                  />
                )}
              </div>
            )}

            {activeView === 'profile' && (
              <ProfilePage profile={userProfile} onSave={handleProfileSave} />
            )}

            {activeView === 'roadmap' && roadmapData && <RoadmapViewer steps={roadmapData.steps} resources={roadmapData.recommendedResources} />}
            {activeView === 'ats' && atsResult && <ATSAnalysis data={atsResult} isOptimizing={isOptimizingATS} />}
            {activeView === 'interview' && <InterviewPrep jobTitle={jobData?.title || 'Active Role'} data={interviewData || undefined} />}
            
            {activeView === 'projects' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">PROJECTS</h2>
                  {pptContent && (
                    <button 
                      onClick={() => sendMessage("Regenerate project PPT with more detail.")}
                      className="px-6 py-2 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                    >
                      Regenerate PPT
                    </button>
                  )}
                </div>
                
                {pptContent ? (
                  <PPTGenerator data={pptContent} />
                ) : (
                  <div className="bg-white p-20 rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-300">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Visual Project Studio</h3>
                    <p className="text-slate-500 text-sm max-w-sm mb-8 font-medium">I can turn your project ideas into a professional PPT deck instantly. Ask me to generate a project visualization in the chat.</p>
                    <button 
                      onClick={() => sendMessage("Generate a professional project presentation about building a career operating system.")}
                      className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
                    >
                      Create First Project
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}