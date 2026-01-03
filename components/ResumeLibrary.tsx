import React from 'react';
import { ResumeTemplate } from '../types';

interface ResumeLibraryProps {
  onSelect: (template: ResumeTemplate) => void;
  selectedId?: string;
}

const TEMPLATES: ResumeTemplate[] = [
  {
    id: 'modern-standard',
    name: 'Modern Standard',
    category: 'Modern',
    description: 'Clean, single-column layout with bold typography. Best for tech roles.',
    previewStyle: 'bg-white border-t-8 border-indigo-600 shadow-sm'
  },
  {
    id: 'executive-classic',
    name: 'Executive Classic',
    category: 'Professional',
    description: 'Traditional serif-based layout for high-level management and legal roles.',
    previewStyle: 'bg-white border-t-8 border-slate-900 shadow-sm font-serif'
  },
  {
    id: 'tech-minimal',
    name: 'Tech Minimalist',
    category: 'Technical',
    description: 'A compact layout focusing on high skill density and project links.',
    previewStyle: 'bg-slate-50 border-l-8 border-indigo-500 shadow-sm'
  },
  {
    id: 'creative-folio',
    name: 'Creative Folio',
    category: 'Creative',
    description: 'Dynamic spacing and clear headers for designers and storytellers.',
    previewStyle: 'bg-indigo-50 border-r-8 border-indigo-600 shadow-sm'
  }
];

const ResumeLibrary: React.FC<ResumeLibraryProps> = ({ onSelect, selectedId }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Layout Library</h4>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{TEMPLATES.length} Archetypes Available</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {TEMPLATES.map((template) => (
          <div 
            key={template.id}
            className={`group cursor-pointer flex flex-col h-full rounded-xl overflow-hidden border-2 transition-all ${selectedId === template.id ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
            onClick={() => onSelect(template)}
          >
            {/* Visual Preview */}
            <div className={`h-40 relative flex flex-col p-4 ${template.previewStyle} overflow-hidden`}>
              <div className="w-1/2 h-2 bg-slate-200 rounded mb-2 opacity-50"></div>
              <div className="w-1/3 h-1.5 bg-slate-100 rounded mb-4 opacity-50"></div>
              <div className="space-y-2">
                <div className="w-full h-1 bg-slate-50 rounded opacity-50"></div>
                <div className="w-full h-1 bg-slate-50 rounded opacity-50"></div>
                <div className="w-full h-1 bg-slate-50 rounded opacity-50"></div>
              </div>
              
              {/* Overlay Label */}
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-indigo-600 text-[8px] font-black text-white rounded uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Select
              </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col bg-white">
              <span className="text-[8px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">{template.category}</span>
              <h5 className="text-xs font-bold text-slate-900 mb-2">{template.name}</h5>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed flex-1">
                {template.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeLibrary;