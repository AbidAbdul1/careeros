import React, { useState } from 'react';
import { ResumeData, UserProfile } from '../types';

interface ResumeViewerProps {
  data: ResumeData | null; // Allow null to fallback to profile entirely
  userProfile?: UserProfile; // New optional prop
}

const ResumeViewer: React.FC<ResumeViewerProps> = ({ data, userProfile }) => {
  const [showSource, setShowSource] = useState(false);

  // MERGE LOGIC: 
  // 1. Personal Info: Always prefer UserProfile (Source of Truth)
  // 2. Content (Summary/Exp): Prefer AI Data (Tailored), fallback to UserProfile
  const displayData = {
    personalInfo: {
      name: userProfile?.name || data?.personalInfo?.name || "Your Name",
      email: userProfile?.email || data?.personalInfo?.email || "email@example.com",
      phone: userProfile?.phone || data?.personalInfo?.phone || "",
      linkedin: userProfile?.linkedin || data?.personalInfo?.linkedin || "",
      github: userProfile?.github || data?.personalInfo?.github || "",
    },
    summary: data?.summary || userProfile?.summary || "Professional summary...",
    experience: (data?.experience && data.experience.length > 0) 
      ? data.experience 
      : (userProfile?.experience || []),
    education: (data?.education && data.education.length > 0) 
      ? data.education 
      : (userProfile?.education || []),
    projects: (data?.projects && data.projects.length > 0) 
      ? data.projects 
      : (userProfile?.projects || []),
    skills: (data?.skills && data.skills.length > 0) 
      ? data.skills 
      : (userProfile?.skills || []),
    mimicScore: data?.mimicScore,
    latexCode: data?.latexCode
  };

  const handlePrint = () => window.print();
  const handleCopyLatex = () => { 
    if (displayData.latexCode) { 
      navigator.clipboard.writeText(displayData.latexCode); 
      alert('LaTeX copied!'); 
    } 
  };

  if (!displayData) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 pb-20">
      
      {/* Controls */}
      <div className="flex flex-col items-center gap-4 no-print">
        {displayData.mimicScore !== undefined && (
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-slate-200 shadow-sm">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Mimicry Score</span>
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600" style={{ width: `${displayData.mimicScore}%` }}></div>
            </div>
            <span className="text-[10px] font-black text-slate-900">{displayData.mimicScore}%</span>
          </div>
        )}
        <div className="flex bg-slate-200/50 p-1 rounded-full">
          <button onClick={() => setShowSource(false)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!showSource ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Visual Preview</button>
          <button onClick={() => setShowSource(true)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${showSource ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>LaTeX Source</button>
        </div>
      </div>

      {showSource ? (
        <div className="animate-in slide-in-from-right duration-300">
          <div className="bg-slate-900 text-indigo-300 p-8 rounded-2xl font-mono text-xs overflow-auto h-[600px] border border-slate-800 leading-relaxed shadow-xl">
            <pre className="whitespace-pre-wrap">{displayData.latexCode || "No LaTeX source generated yet."}</pre>
          </div>
          <div className="mt-4 flex justify-end"><button onClick={handleCopyLatex} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Copy Code</button></div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-left duration-300">
          <div className="bg-white border border-slate-200 shadow-2xl p-12 max-w-[850px] mx-auto latex-font w-full relative mb-10" id="printable-resume">
            
            {/* Header */}
            <header className="text-center mb-8 pb-6 border-b border-slate-900">
              <h1 className="text-3xl font-bold uppercase tracking-[0.2em] text-slate-900 mb-2">{displayData.personalInfo.name}</h1>
              <div className="text-[11px] font-medium text-slate-700 space-x-2 uppercase tracking-tight flex justify-center flex-wrap">
                <span>{displayData.personalInfo.email}</span>
                {displayData.personalInfo.phone && <><span>•</span><span>{displayData.personalInfo.phone}</span></>}
                {displayData.personalInfo.linkedin && <><span>•</span><span>{displayData.personalInfo.linkedin.replace('https://', '')}</span></>}
                {displayData.personalInfo.github && <><span>•</span><span>{displayData.personalInfo.github.replace('https://', '')}</span></>}
              </div>
            </header>

            {/* Summary */}
            {displayData.summary && (
              <section className="mb-8">
                <h2 className="text-[11px] font-black border-b-2 border-slate-900 uppercase mb-3 tracking-[0.1em]">Professional Profile</h2>
                <p className="text-[11px] leading-relaxed text-slate-800 italic">{displayData.summary}</p>
              </section>
            )}

            {/* Experience */}
            {displayData.experience.length > 0 && (
              <section className="mb-8">
                <h2 className="text-[11px] font-black border-b-2 border-slate-900 uppercase mb-3 tracking-[0.1em]">Experience</h2>
                {displayData.experience.map((exp, idx) => (
                  <div key={idx} className="mb-4 last:mb-0">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-[12px] uppercase">{exp.company}</span>
                      <span className="text-[10px] font-bold text-slate-600">{exp.date}</span>
                    </div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="italic font-bold text-[11px] text-slate-700">{exp.role}</span>
                      <span className="text-[10px] italic text-slate-500">{exp.location}</span>
                    </div>
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="list-disc list-outside text-[11px] pl-5 space-y-1 text-slate-800">
                        {exp.bullets.map((bullet, bIdx) => <li key={bIdx} className="leading-tight">{bullet}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Projects */}
            {displayData.projects && displayData.projects.length > 0 && (
              <section className="mb-8">
                <h2 className="text-[11px] font-black border-b-2 border-slate-900 uppercase mb-3 tracking-[0.1em]">Technical Projects</h2>
                {displayData.projects.map((proj, idx) => (
                  <div key={idx} className="mb-3">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-[11px] uppercase">{proj.name}</span>
                      <span className="text-[9px] font-bold text-indigo-600">{proj.link}</span>
                    </div>
                    {/* Check if description exists (Profile style) or bullets (Resume style) */}
                    {proj.bullets && proj.bullets.length > 0 ? (
                       <ul className="list-disc list-outside text-[11px] pl-5 space-y-1 text-slate-800 mt-1">
                        {proj.bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                      </ul>
                    ) : (
                      proj.description && <p className="text-[11px] text-slate-800 mt-1">{proj.description}</p>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Education */}
            {displayData.education.length > 0 && (
              <section className="mb-8">
                <h2 className="text-[11px] font-black border-b-2 border-slate-900 uppercase mb-3 tracking-[0.1em]">Education</h2>
                {displayData.education.map((edu, idx) => (
                  <div key={idx} className="mb-2">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-[11px] uppercase">{edu.institution}</span>
                      <span className="text-[10px] font-bold text-slate-600">{edu.date}</span>
                    </div>
                    <div className="text-[11px] flex justify-between">
                      <span className="italic">{edu.degree}</span>
                      {edu.grade && <span className="font-bold">GPA: {edu.grade}</span>}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Skills */}
            {displayData.skills.length > 0 && (
              <section className="mb-8">
                <h2 className="text-[11px] font-black border-b-2 border-slate-900 uppercase mb-3 tracking-[0.1em]">Skills & Tools</h2>
                <div className="text-[11px] text-slate-800 font-medium leading-[1.6] flex flex-wrap gap-x-2">
                  {displayData.skills.map((s, i) => <span key={i}>{s}{i < displayData.skills.length - 1 ? ' •' : ''}</span>)}
                </div>
              </section>
            )}
          </div>
          <div className="flex justify-center no-print">
            <button onClick={handlePrint} className="px-10 py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 transition-all">Download PDF</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeViewer;