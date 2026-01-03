import React from 'react';
import { ATSResult } from '../types';

interface ATSAnalysisProps {
  data: ATSResult;
  isOptimizing?: boolean;
}

const ATSAnalysis: React.FC<ATSAnalysisProps> = ({ data, isOptimizing = false }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8 relative">
      {/* Optimization Overlay */}
      {isOptimizing && (
        <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center border-2 border-indigo-400/50 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-6">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center">
              <h4 className="text-lg font-black text-slate-900 tracking-tight">Self-Correction Mode Active</h4>
              <p className="text-sm text-slate-500 font-medium mt-1">Refining resume to meet 80% benchmark...</p>
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-10 rounded-2xl border border-slate-200 card-shadow flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="flex-1">
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">ATS Compatibility</h3>
          <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-lg">How an automated parsing system views your resume against this job description.</p>
        </div>
        
        <div className="text-center">
           <div className={`text-6xl font-black ${getScoreColor(data.score)} tracking-tighter`}>{data.score || 0}%</div>
           <div className="w-48 h-2 bg-slate-100 rounded-full mt-4 overflow-hidden border border-slate-100">
              <div className={`h-full ${getProgressColor(data.score)} transition-all duration-1000`} style={{ width: `${data.score}%` }}></div>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Resume Strength</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 card-shadow">
          <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            Keyword Matches
          </h4>
          <div className="flex flex-wrap gap-2">
            {(data.matchingSkills || []).map((skill, i) => (
              <span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">{skill}</span>
            ))}
            {(!data.matchingSkills || data.matchingSkills.length === 0) && (
              <span className="text-xs text-slate-400 italic">No significant matches detected yet.</span>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 card-shadow">
          <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
            Missing Keywords
          </h4>
          <div className="flex flex-wrap gap-2">
            {(data.missingSkills || []).map((skill, i) => (
              <span key={i} className="px-4 py-2 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg border border-rose-100">{skill}</span>
            ))}
            {(!data.missingSkills || data.missingSkills.length === 0) && (
              <span className="text-xs text-emerald-600 font-bold">Comprehensive match found!</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-10 rounded-2xl shadow-xl text-white relative overflow-hidden">
        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Optimization Checklist</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {(data.suggestions || []).map((suggestion, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-5 h-5 bg-white/10 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
              </div>
              <p className="text-sm font-medium text-slate-300 leading-snug">{suggestion}</p>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full -mb-24 -mr-24 blur-3xl"></div>
      </div>
    </div>
  );
};

export default ATSAnalysis;