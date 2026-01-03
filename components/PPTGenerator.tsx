
import React, { useEffect, useState } from 'react';
import { PPTContent, Slide } from '../types';
import { generateAIImage } from '../services/gemini';

interface PPTGeneratorProps {
  data: PPTContent;
}

const PPTGenerator: React.FC<PPTGeneratorProps> = ({ data }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(data.slides);

  useEffect(() => {
    // Generate AI images for slides that request them
    const loadImages = async () => {
      const updatedSlides = await Promise.all(data.slides.map(async (slide) => {
        if (slide.imageType === 'AI' && slide.imagePrompt && !slide.imageUrl) {
          const url = await generateAIImage(slide.imagePrompt);
          return { ...slide, imageUrl: url };
        }
        return slide;
      }));
      setSlides(updatedSlides);
    };
    loadImages();
  }, [data]);

  const getThemeStyles = () => {
    switch (data.theme) {
      case 'dark': return 'bg-slate-900 text-white border-slate-800';
      case 'professional': return 'bg-white text-slate-900 border-indigo-200';
      case 'creative': return 'bg-indigo-600 text-white border-indigo-400';
      default: return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  const getFontStyles = () => {
    switch (data.font) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      default: return 'font-sans';
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className={`flex flex-col h-[700px] rounded-[3rem] overflow-hidden border-8 ${getThemeStyles()} shadow-2xl transition-all duration-1000 animate-in fade-in`}>
      {/* Gamma Header */}
      <div className="h-16 flex items-center justify-between px-10 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-red-400"></div>
          <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
          <div className="w-4 h-4 rounded-full bg-green-400"></div>
          <h3 className="ml-4 font-black text-xs uppercase tracking-widest opacity-60">{data.title}</h3>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Slide {currentSlide + 1} / {slides.length}</span>
          <button className="px-6 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">Export Gamma Pro</button>
        </div>
      </div>

      {/* Slide Workspace */}
      <div className={`flex-1 flex flex-col md:flex-row p-12 gap-12 ${getFontStyles()}`}>
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8 leading-[1.1] tracking-tighter">{slide.header}</h2>
          <ul className="space-y-6">
            {slide.content.map((point, idx) => (
              // Fix: Changed 'delay' to 'animationDelay' to adhere to React.CSSProperties
              <li key={idx} className="flex gap-4 items-start animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="w-2 h-2 rounded-full bg-current mt-2 opacity-40"></div>
                <p className="text-lg md:text-xl font-medium leading-relaxed opacity-90">{point}</p>
              </li>
            ))}
          </ul>
        </div>

        {slide.imageType !== 'NONE' && (
          <div className="flex-1 flex items-center justify-center relative">
            <div className="w-full aspect-video rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl relative group">
              {slide.imageUrl ? (
                <img src={slide.imageUrl} alt="Slide Visual" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin mb-4 opacity-40"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Orchestrating AI Visuals...</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/60">Generated via Gemini Vision</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Speaker Notes Drawer (Mini) */}
      {slide.speakerNotes && (
        <div className="px-10 py-4 bg-black/10 border-t border-white/5 text-[10px] font-bold italic opacity-60">
          Note: {slide.speakerNotes}
        </div>
      )}

      {/* Gamma Navigation Bar */}
      <div className="h-20 bg-black/20 flex items-center justify-center gap-12 border-t border-white/5 no-print">
        <button 
          onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
          disabled={currentSlide === 0}
          className="p-4 hover:bg-white/10 rounded-2xl transition-all disabled:opacity-20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-white w-8' : 'bg-white/20'}`}
            />
          ))}
        </div>

        <button 
          onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
          disabled={currentSlide === slides.length - 1}
          className="p-4 hover:bg-white/10 rounded-2xl transition-all disabled:opacity-20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default PPTGenerator;
