import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface ProfilePageProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);

  // Sync formData with profile prop when it changes
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const updateField = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field: keyof UserProfile, index: number, value: any) => {
    setFormData(prev => {
      const arr = [...(prev[field] as any[])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addArrayItem = (field: keyof UserProfile, defaultItem: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as any[]), defaultItem]
    }));
  };

  const removeArrayItem = (field: keyof UserProfile, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onSave(formData);
    // Optional: Add a toast notification here
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom duration-700 pb-20">
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">My Identity Workspace</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activate your unique CareerOS profile to begin.</p>
        </div>
        <div className="flex gap-3">
          {/* Social Connectors - Visual Only based on design */}
          <div className="w-10 h-10 bg-[#0077b5] rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
             <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          </div>
          <div className="w-10 h-10 bg-[#333] rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
             <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Left Column: Personal Details */}
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 block">Full Name</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 placeholder-slate-300 shadow-sm"
              placeholder="Your Full Name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 block">Email</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 placeholder-slate-300 shadow-sm"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 block">Phone</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 placeholder-slate-300 shadow-sm"
                placeholder="+1 234..."
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 block">LinkedIn URL</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 placeholder-slate-300 shadow-sm"
                placeholder="linkedin.com/in/..."
                value={formData.linkedin}
                onChange={(e) => updateField('linkedin', e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 block">Github URL</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 placeholder-slate-300 shadow-sm"
                placeholder="github.com/..."
                value={formData.github}
                onChange={(e) => updateField('github', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Summaries */}
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 block">Professional Summary</label>
            <textarea 
              rows={5}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-xs font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 placeholder-slate-300 shadow-sm resize-none"
              placeholder="Core career value proposition..."
              value={formData.summary}
              onChange={(e) => updateField('summary', e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 block">Academics Meta</label>
            <textarea 
              rows={3}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-xs font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 placeholder-slate-300 shadow-sm resize-none"
              placeholder="Highlight key academic achievements or specializations..."
              value={formData.academicsSummary}
              onChange={(e) => updateField('academicsSummary', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Technical Inventory (Skills)</h3>
          <button 
             onClick={() => {
               const skill = prompt("Add a skill:");
               if(skill) updateField('skills', [...formData.skills, skill]);
             }}
             className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-indigo-700"
          >
            Add Skill
          </button>
        </div>
        <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 min-h-[100px] flex flex-wrap gap-2">
           {formData.skills.map((skill, idx) => (
             <span key={idx} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2">
                {skill}
                <button onClick={() => updateField('skills', formData.skills.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500">×</button>
             </span>
           ))}
           {formData.skills.length === 0 && <span className="text-slate-300 text-xs italic">No skills added yet...</span>}
        </div>
      </div>

      {/* Education Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Academic History (Degrees)</h3>
          <button 
             onClick={() => addArrayItem('education', { institution: '', degree: '', location: '', date: '', grade: '' })}
             className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-indigo-700"
          >
            Add Education
          </button>
        </div>
        <div className="space-y-4">
          {formData.education.map((edu, idx) => (
            <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
               <button onClick={() => removeArrayItem('education', idx)} className="absolute top-4 right-4 text-[10px] font-black text-slate-300 hover:text-rose-500 uppercase tracking-widest">Remove</button>
               <div className="space-y-3 pr-10">
                  <div>
                    <input 
                      className="w-full bg-white border-none rounded-xl py-2 px-4 text-xs font-bold text-slate-800 placeholder-slate-300 mb-2" 
                      placeholder="Institution" 
                      value={edu.institution}
                      onChange={e => updateArrayField('education', idx, { ...edu, institution: e.target.value })}
                    />
                    <input 
                      className="w-full bg-white border-none rounded-xl py-2 px-4 text-xs font-bold text-slate-800 placeholder-slate-300 mb-2" 
                      placeholder="Degree" 
                      value={edu.degree}
                      onChange={e => updateArrayField('education', idx, { ...edu, degree: e.target.value })}
                    />
                     <input 
                      className="w-full bg-white border-none rounded-xl py-2 px-4 text-xs font-bold text-slate-800 placeholder-slate-300 mb-2" 
                      placeholder="CGPA / Percentage" 
                      value={edu.grade}
                      onChange={e => updateArrayField('education', idx, { ...edu, grade: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      className="bg-white border-none rounded-xl py-2 px-4 text-[10px] font-bold text-slate-500 placeholder-slate-300" 
                      placeholder="Location" 
                      value={edu.location}
                      onChange={e => updateArrayField('education', idx, { ...edu, location: e.target.value })}
                    />
                    <input 
                      className="bg-white border-none rounded-xl py-2 px-4 text-[10px] font-bold text-slate-500 placeholder-slate-300" 
                      placeholder="Date Range" 
                      value={edu.date}
                      onChange={e => updateArrayField('education', idx, { ...edu, date: e.target.value })}
                    />
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Professional Narrative (Experience)</h3>
          <button 
             onClick={() => addArrayItem('experience', { company: '', role: '', location: '', date: '', bullets: [''] })}
             className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-indigo-700"
          >
            Add Experience
          </button>
        </div>
        <div className="space-y-4">
          {formData.experience.map((exp, idx) => (
            <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
               <button onClick={() => removeArrayItem('experience', idx)} className="absolute top-4 right-4 text-[10px] font-black text-slate-300 hover:text-rose-500 uppercase tracking-widest">Remove</button>
               <div className="space-y-3 pr-10">
                  <div className="grid grid-cols-2 gap-4">
                     <input 
                        className="w-full bg-white border-none rounded-xl py-3 px-4 text-xs font-bold text-slate-800 placeholder-slate-300" 
                        placeholder="Company" 
                        value={exp.company}
                        onChange={e => updateArrayField('experience', idx, { ...exp, company: e.target.value })}
                     />
                     <input 
                        className="w-full bg-white border-none rounded-xl py-3 px-4 text-xs font-bold text-slate-800 placeholder-slate-300" 
                        placeholder="Role" 
                        value={exp.role}
                        onChange={e => updateArrayField('experience', idx, { ...exp, role: e.target.value })}
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <input 
                        className="w-full bg-white border-none rounded-xl py-3 px-4 text-[10px] font-bold text-slate-500 placeholder-slate-300" 
                        placeholder="Location" 
                        value={exp.location}
                        onChange={e => updateArrayField('experience', idx, { ...exp, location: e.target.value })}
                     />
                     <input 
                        className="w-full bg-white border-none rounded-xl py-3 px-4 text-[10px] font-bold text-slate-500 placeholder-slate-300" 
                        placeholder="Timeline (e.g. 2021 - Present)" 
                        value={exp.date}
                        onChange={e => updateArrayField('experience', idx, { ...exp, date: e.target.value })}
                     />
                  </div>
                  
                  <div className="mt-4">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Impact Bullets</label>
                    <div className="space-y-2">
                       {exp.bullets.map((bullet, bIdx) => (
                         <div key={bIdx} className="flex gap-2">
                           <input 
                             className="flex-1 bg-white border-none rounded-lg py-2 px-4 text-xs text-slate-600 placeholder-slate-300 shadow-sm"
                             placeholder="Did X, resulting in Y..."
                             value={bullet}
                             onChange={e => {
                               const newBullets = [...exp.bullets];
                               newBullets[bIdx] = e.target.value;
                               updateArrayField('experience', idx, { ...exp, bullets: newBullets });
                             }}
                           />
                           <button 
                             onClick={() => {
                               const newBullets = exp.bullets.filter((_, i) => i !== bIdx);
                               updateArrayField('experience', idx, { ...exp, bullets: newBullets });
                             }}
                             className="text-slate-300 hover:text-rose-500 px-2"
                           >
                             ×
                           </button>
                         </div>
                       ))}
                       <button 
                         onClick={() => {
                           const newBullets = [...exp.bullets, ''];
                           updateArrayField('experience', idx, { ...exp, bullets: newBullets });
                         }}
                         className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-2 hover:underline"
                       >
                         + Add Bullet
                       </button>
                    </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

       {/* Projects Section */}
       <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Product Portfolio (Projects)</h3>
          <button 
             onClick={() => addArrayItem('projects', { name: '', description: '', link: '', bullets: [''] })}
             className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-indigo-700"
          >
            Add Project
          </button>
        </div>
        <div className="space-y-4">
          {formData.projects.map((proj, idx) => (
            <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
               <button onClick={() => removeArrayItem('projects', idx)} className="absolute top-4 right-4 text-[10px] font-black text-slate-300 hover:text-rose-500 uppercase tracking-widest">Remove</button>
               <div className="space-y-3 pr-10">
                  <div className="grid grid-cols-2 gap-4">
                     <input 
                        className="w-full bg-white border-none rounded-xl py-3 px-4 text-xs font-bold text-slate-800 placeholder-slate-300" 
                        placeholder="Project Name" 
                        value={proj.name}
                        onChange={e => updateArrayField('projects', idx, { ...proj, name: e.target.value })}
                     />
                     <input 
                        className="w-full bg-white border-none rounded-xl py-3 px-4 text-xs font-bold text-slate-800 placeholder-slate-300" 
                        placeholder="Link (Optional)" 
                        value={proj.link}
                        onChange={e => updateArrayField('projects', idx, { ...proj, link: e.target.value })}
                     />
                  </div>
                  <div>
                     <textarea 
                        rows={2}
                        className="w-full bg-white border-none rounded-xl py-3 px-4 text-xs text-slate-600 placeholder-slate-300 resize-none" 
                        placeholder="Brief description..." 
                        value={proj.description}
                        onChange={e => updateArrayField('projects', idx, { ...proj, description: e.target.value })}
                     />
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Achievements */}
        <div>
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Major Achievements</h3>
              <button 
                 onClick={() => {
                   const item = prompt("Add achievement:");
                   if(item) updateField('achievements', [...formData.achievements, item]);
                 }}
                 className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700"
              >
                +
              </button>
           </div>
           <div className="bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-200 min-h-[100px] space-y-2">
              {formData.achievements.map((ach, idx) => (
                <div key={idx} className="bg-white px-4 py-2 rounded-lg text-xs font-medium text-slate-600 shadow-sm flex justify-between items-center">
                   {ach}
                   <button onClick={() => updateField('achievements', formData.achievements.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-rose-500">×</button>
                </div>
              ))}
           </div>
        </div>

        {/* Extra */}
        <div>
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Extra (Certs, Languages)</h3>
              <button 
                 onClick={() => addArrayItem('extra', { category: '', details: '' })}
                 className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700"
              >
                +
              </button>
           </div>
           <div className="bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-200 min-h-[100px] space-y-2">
             {formData.extra.map((item, idx) => (
                <div key={idx} className="bg-white px-4 py-3 rounded-lg shadow-sm relative group">
                   <button onClick={() => removeArrayItem('extra', idx)} className="absolute top-2 right-2 text-slate-300 hover:text-rose-500">×</button>
                   <input 
                      className="w-full border-none p-0 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 focus:ring-0" 
                      placeholder="Category (e.g. Certification)"
                      value={item.category}
                      onChange={e => updateArrayField('extra', idx, { ...item, category: e.target.value })}
                   />
                   <input 
                      className="w-full border-none p-0 text-xs font-semibold text-slate-700 focus:ring-0" 
                      placeholder="Detail (e.g. AWS Certified)"
                      value={item.details}
                      onChange={e => updateArrayField('extra', idx, { ...item, details: e.target.value })}
                   />
                </div>
              ))}
           </div>
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-indigo-700 shadow-xl shadow-indigo-200 hover:scale-[1.01] active:scale-[0.99] transition-all"
      >
        Finalize & Activate Identity
      </button>

    </div>
  );
};

export default ProfilePage;