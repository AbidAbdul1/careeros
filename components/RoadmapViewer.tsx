import React from 'react';
import { RoadmapStep, Resource } from '../types';

interface RoadmapViewerProps {
  steps: RoadmapStep[];
  resources?: Resource[];
}

const RoadmapViewer: React.FC<RoadmapViewerProps> = ({ steps, resources = [] }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom duration-500 space-y-10">
      {/* Roadmap Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 card-shadow overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Learning Curriculum</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">A structured path to master required job skills.</p>
          </div>
          <div className="bg-slate-50 px-5 py-2 rounded-lg border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
            {steps?.length || 0} Modules
          </div>
        </div>
        
        <div className="p-10 space-y-0 relative">
          {/* Vertical path connector line */}
          <div className="absolute left-[3.2rem] top-12 bottom-12 w-0.5 bg-slate-100 hidden md:block"></div>
          
          {(steps || []).map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = step.status === 'in-progress';
            
            return (
              <div key={idx} className="flex gap-10 relative group mb-12 last:mb-0">
                {/* Visual Step Indicator */}
                <div className="flex-shrink-0 z-10 hidden md:flex items-start pt-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-100' : 
                    isInProgress ? 'bg-white border-indigo-600 text-indigo-600 ring-4 ring-indigo-50' : 
                    'bg-white border-slate-200 text-slate-300'
                  }`}>
                    {isCompleted ? (
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    ) : (
                      <span className="text-sm font-black">{idx + 1}</span>
                    )}
                  </div>
                </div>
                
                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                    <h4 className={`font-black text-xl tracking-tight leading-tight ${isCompleted ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {step.title}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap mt-1 md:mt-0">
                      Timeline: {step.timeline}
                    </span>
                  </div>
                  
                  <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 max-w-2xl">
                    {step.description}
                  </p>
                  
                  {/* Topics Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {(step.topics || []).map((topic, tidx) => (
                        <div key={tidx} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                           <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                           <span className="text-xs font-bold text-slate-700">{topic}</span>
                        </div>
                     ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended YouTube/Learning Resources */}
      {resources && resources.length > 0 && (
        <div className="bg-slate-900 p-10 rounded-2xl shadow-xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-8">Recommended YouTube Playlists</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map((res, i) => (
                <a 
                  key={i} 
                  href={res.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${res.platform === 'YouTube' ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                    {res.platform === 'YouTube' ? (
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                    ) : (
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    )}
                  </div>
                  <div>
                    <h5 className="font-black text-sm text-white group-hover:text-indigo-300 transition-colors mb-2 leading-tight">{res.title}</h5>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{res.platform}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                      <span className="text-[10px] font-bold text-indigo-400">View Resource</span>
                    </div>
                    {res.description && <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">{res.description}</p>}
                  </div>
                </a>
              ))}
            </div>
          </div>
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -mr-40 -mt-40 blur-[100px]"></div>
        </div>
      )}
    </div>
  );
};

export default RoadmapViewer;