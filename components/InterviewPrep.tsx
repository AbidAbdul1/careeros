import React from 'react';
import { InterviewPrepData } from '../types';

interface InterviewPrepProps {
  jobTitle: string;
  data?: InterviewPrepData;
}

const InterviewPrep: React.FC<InterviewPrepProps> = ({ jobTitle, data }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 bg-white p-8 rounded-2xl border border-slate-200 card-shadow">
          <h4 className="font-extrabold text-slate-900 mb-6 flex items-center gap-3 text-lg tracking-tight">
            Target Scenarios
          </h4>
          <div className="space-y-4">
            {data?.questions ? data.questions.map((q, i) => (
              <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-xl group hover:border-indigo-300 transition-all">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{q.category}</span>
                   {q.hint && <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>}
                </div>
                <p className="text-sm font-bold text-slate-800 leading-snug">{q.question}</p>
                {q.hint && <p className="mt-3 text-[11px] text-slate-500 italic">Hint: {q.hint}</p>}
              </div>
            )) : (
              <div className="py-20 text-center opacity-40">
                <p className="text-sm font-bold">Waiting for Interview context...</p>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-5 space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 card-shadow">
            <h4 className="font-extrabold text-slate-900 mb-6 text-lg tracking-tight">Key Concepts</h4>
            <div className="flex flex-wrap gap-2">
              {(data?.technicalTopics || []).map(c => (
                <span key={c} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 uppercase tracking-tight">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 card-shadow">
            <h4 className="font-extrabold text-slate-900 mb-6 text-lg tracking-tight">Prep Assets</h4>
            <div className="space-y-3">
              {data?.resources && data.resources.length > 0 ? data.resources.map((res, i) => (
                <a 
                  key={i} 
                  href={res.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-indigo-400 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${res.platform === 'YouTube' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {res.platform === 'YouTube' ? '▶' : '📄'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{res.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{res.platform}</p>
                  </div>
                </a>
              )) : (
                <p className="text-xs text-slate-400 italic py-4">Context-specific resources will appear here.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPrep;