import React, { useState } from "react";
import { 
  Search, 
  Book, 
  FlaskConical, 
  History, 
  Sparkles,
  ChevronRight,
  Info,
  ArrowLeft,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { REMEDY_DATABASE } from "../../lib/homeopathic_data";
import { getRepertoryAI } from "../../lib/gemini";

export default function MateriaMedica() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRemedy, setSelectedRemedy] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const filteredRemedies = REMEDY_DATABASE.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsAiLoading(true);
    setAiResult(null);
    setSelectedRemedy(null);
    
    try {
      const result = await getRepertoryAI(searchQuery);
      setAiResult(result);
    } catch (error) {
      console.error("AI Search Error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-hc-dark serif">Materia Medica Digitalis</h1>
          <p className="text-sm text-slate-500 italic">Boericke, Allen & Phatak Reference</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-hc-green uppercase tracking-widest bg-hc-accent/30 px-4 py-2 rounded-xl border border-hc-accent">
           <Book className="w-4 h-4" /> 2000+ Remedias Index
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 font-bold" />
        <input 
          type="text" 
          placeholder="Search remedy by name (e.g., 'Arsenic', 'Sulphur', 'Thuja')..."
          className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-hc-green/20 shadow-sm text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 ml-2">
            <FlaskConical className="w-3.5 h-3.5 text-hc-green" /> Common Index
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredRemedies.map((remedy, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={idx}
                onClick={() => setSelectedRemedy(remedy)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedRemedy === remedy 
                    ? 'bg-hc-dark text-white border-hc-dark shadow-xl shadow-hc-dark/20' 
                    : 'bg-white border-gray-100 hover:border-hc-green/30 hover:bg-hc-accent/10 text-hc-dark'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm tracking-tight">{remedy.name}</p>
                    <p className={`text-[9px] font-black uppercase tracking-tighter opacity-50`}>{remedy.type}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${selectedRemedy === remedy ? 'text-white' : 'text-slate-200'}`} />
                </div>
              </motion.div>
            ))}
            
            {filteredRemedies.length === 0 && searchQuery && (
              <div 
                onClick={handleAiSearch}
                className="bg-purple-50 p-6 rounded-2xl border-2 border-dashed border-purple-200 text-center cursor-pointer hover:bg-purple-100 transition-all group"
              >
                <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3 animate-pulse" />
                <p className="text-purple-900 font-bold text-xs uppercase tracking-widest">Consult AI MM</p>
                <p className="text-[10px] text-purple-600 mt-1">Found nothing in static list. Search global database?</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {aiResult ? (
              <motion.div 
                key="ai-result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-hc-dark rounded-[40px] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-hc-green/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-hc-accent ring-4 ring-white/5">
                      <Sparkles className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold serif">AI Repertory Insights</h3>
                      <p className="text-xs text-hc-accent tracking-widest uppercase font-black opacity-70">Gemini Clinical Engine</p>
                   </div>
                </div>

                <div className="space-y-6 relative z-10">
                   {aiResult.rubrics.map((r: any, i: number) => (
                      <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-3">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-hc-green uppercase tracking-widest">{r.section}</span>
                         </div>
                         <h4 className="text-lg font-bold italic serif tracking-tight text-hc-accent">"{r.rubric}"</h4>
                         <div className="flex flex-wrap gap-2">
                            {r.remedies.map((rem: string, j: number) => (
                               <span key={j} className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-bold border border-white/5">{rem}</span>
                            ))}
                         </div>
                      </div>
                   ))}
                   
                   <div className="bg-hc-green/20 p-6 rounded-3xl border border-hc-green/30">
                      <h4 className="text-xs font-black text-hc-accent uppercase tracking-widest mb-2">Clinical Reasoning</h4>
                      <p className="text-sm leading-relaxed text-hc-accent/90">{aiResult.conclusion}</p>
                   </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                   <p className="text-[10px] text-white/30 italic">AI suggestions are for synthesis lookup. Final clinical matching required.</p>
                   <button 
                    onClick={() => {
                      setAiResult(null);
                      setSearchQuery("");
                    }}
                    className="w-full md:w-auto px-8 py-3 bg-white text-hc-dark font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-hc-accent transition-all"
                   >
                     Reset Search
                   </button>
                </div>
              </motion.div>
            ) : selectedRemedy ? (
              <motion.div 
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm space-y-8"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-4xl font-bold text-hc-dark serif mb-2">{selectedRemedy.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-hc-accent/30 text-hc-green text-[10px] font-black uppercase rounded-full">Kingdom: {selectedRemedy.type}</span>
                      <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase rounded-full tracking-widest">Digital Entry #MM-{(selectedRemedy.name.length * 7)}</span>
                    </div>
                  </div>
                  <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors">
                    <History className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <section className="space-y-3">
                      <h4 className="text-xs font-black text-hc-dark uppercase tracking-widest flex items-center gap-2">
                        <Info className="w-4 h-4 text-hc-green" /> Keynotes & Mentals
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-all hover:shadow-inner">
                        {selectedRemedy.keynotes}
                      </p>
                    </section>
                  </div>

                  <div className="space-y-6">
                    <section className="space-y-4">
                      <h4 className="text-xs font-black text-hc-dark uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4 text-red-500" /> Modalities
                      </h4>
                      <div className="space-y-3">
                        <div className="bg-red-50 p-6 rounded-3xl border border-red-100 relative overflow-hidden group">
                          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Aggravation (&lt;)</p>
                          <p className="text-sm text-red-900 font-medium relative z-10">{selectedRemedy.modalities.agg}</p>
                          <ArrowLeft className="absolute -right-4 -bottom-4 w-16 h-16 text-red-100 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                        </div>
                        <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 relative overflow-hidden group">
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Amelioration (&gt;)</p>
                          <p className="text-sm text-emerald-900 font-medium relative z-10">{selectedRemedy.modalities.amel}</p>
                          <Sparkles className="absolute -right-4 -bottom-4 w-16 h-16 text-emerald-100 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      </div>
                    </section>
                  </div>
                </div>

                <div className="pt-8 border-t clinic-border flex items-center justify-between">
                   <div className="flex gap-4">
                      <button className="px-6 py-3 bg-hc-green text-white font-bold rounded-2xl text-xs hover:bg-hc-dark transition-all shadow-lg shadow-hc-green/20">Prescribe Medicine</button>
                      <button className="px-6 py-3 bg-white text-hc-dark border border-gray-100 font-bold rounded-2xl text-xs hover:bg-hc-accent transition-all">Compare with...</button>
                   </div>
                   <p className="text-[10px] text-slate-400 italic">Last Updated: Boericke Repertory 9th Edition</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty-detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-[40px] border border-gray-100 p-20 text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]"
              >
                <div className="w-20 h-20 bg-hc-accent rounded-full flex items-center justify-center text-hc-green mb-4 shadow-inner">
                  <Book className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-hc-dark serif">Materia Medica Library</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto">Select a remedy from the index or search to view its characteristics, keynotes, and modalities.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isAiLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm text-white">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-hc-dark w-full max-w-xl rounded-[40px] p-10 flex flex-col items-center text-center space-y-6 shadow-2xl"
            >
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-hc-accent mb-2">
                <Sparkles className="w-10 h-10 animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold serif font-bold">Consulting Global AI Database</h2>
              <p className="text-hc-accent leading-relaxed max-w-md">Gemini is searching 200+ Materia Medicae for <span className="text-white font-bold underline decoration-hc-accent tracking-widest">{searchQuery}</span>. Generating keynote analysis...</p>
              <div className="py-8">
                <div className="w-12 h-12 border-4 border-hc-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
              <button 
                onClick={() => setIsAiLoading(false)}
                className="w-full py-4 bg-white/10 rounded-2xl font-bold text-xs hover:bg-white/20 transition-all uppercase tracking-widest"
              >
                Cancel AI Request
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
