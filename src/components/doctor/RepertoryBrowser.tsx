import React, { useState } from "react";
import { 
  Search, 
  BookOpen, 
  Filter, 
  Sparkles, 
  ChevronRight,
  Database,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { COMMON_RUBRICS } from "../../lib/homeopathic_data";
import { getRepertoryAI } from "../../lib/gemini";

export default function RepertoryBrowser() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRubric, setSelectedRubric] = useState<any>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState<any>(null);

  const handleAiSearch = async () => {
    if (!searchQuery) return;
    setIsAiSearching(true);
    const results = await getRepertoryAI(searchQuery);
    setAiResults(results);
    setIsAiSearching(false);
  };

  const filteredRubrics = COMMON_RUBRICS.filter(r => 
    r.rubric.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayRubrics = aiResults ? [...filteredRubrics, ...aiResults.rubrics] : filteredRubrics;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-hc-dark serif">Repertory Intelligence</h1>
          <p className="text-sm text-slate-500 italic">Kent, Boericke & Synthesis Cross-Reference</p>
        </div>
        <div className="bg-hc-accent/50 px-4 py-2 rounded-xl flex items-center gap-2 border border-hc-accent">
          <Database className="w-4 h-4 text-hc-green" />
          <span className="text-[10px] font-black text-hc-green uppercase tracking-widest tracking-tighter">Full Database: Active</span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search rubrics (e.g., 'Head pain', 'Mind fear', 'Stomach thirst')..."
          className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-hc-green/20 shadow-sm text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rubrics List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" /> Rubrics Found
            </h3>
            <span className="text-[10px] font-bold text-slate-400">{filteredRubrics.length} Standard Results</span>
          </div>

          <div className="space-y-3">
            {displayRubrics.map((r, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={idx}
                onClick={() => setSelectedRubric(r)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                  selectedRubric === r 
                    ? 'bg-hc-green text-white border-hc-green shadow-lg shadow-hc-green/20' 
                    : 'bg-white border-gray-100 hover:border-hc-green/30 hover:bg-hc-accent/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${selectedRubric === r ? 'bg-white/20' : 'bg-slate-50'}`}>
                    <BookOpen className={`w-4 h-4 ${selectedRubric === r ? 'text-white' : 'text-hc-green'}`} />
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest opacity-60 mb-1`}>{r.section}</p>
                    <p className="font-bold text-sm tracking-tight">{r.rubric}</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${selectedRubric === r ? 'text-white' : 'text-slate-300'}`} />
              </motion.div>
            ))}

            {displayRubrics.length === 0 && searchQuery && (
              <div className="bg-hc-dark/5 rounded-3xl p-12 text-center space-y-4 border-2 border-dashed border-hc-dark/10">
                <Sparkles className="w-12 h-12 text-hc-dark/20 mx-auto" />
                <div>
                  <p className="text-hc-dark font-bold">Rubric not found in static cache</p>
                  <p className="text-xs text-slate-500">Consult the AI Clinical Copilot to explore the Synthesis database.</p>
                </div>
                <button 
                  onClick={handleAiSearch}
                  disabled={isAiSearching}
                  className="bg-hc-dark text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all disabled:opacity-50"
                >
                  {isAiSearching ? "Searching..." : "Consult AI Repertory"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Remedies & Analysis */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {selectedRubric ? (
              <motion.div 
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm flex flex-col h-full sticky top-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-hc-accent rounded-xl flex items-center justify-center text-hc-green">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-hc-dark serif leading-tight">{selectedRubric.rubric}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{selectedRubric.section}</p>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  {selectedRubric.conclusion && (
                    <div className="p-4 bg-hc-accent/20 rounded-2xl border border-hc-accent/50 mb-4">
                      <p className="text-[10px] font-black text-hc-green uppercase tracking-widest mb-1">AI Deduction</p>
                      <p className="text-[11px] text-hc-dark italic leading-relaxed">{selectedRubric.conclusion}</p>
                    </div>
                  )}
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remedies (Grade 1-3)</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRubric.remedies.map((remedy: string, i: number) => (
                      <div 
                        key={i} 
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs border ${
                          i === 0 ? 'bg-hc-green text-white border-hc-green' : 'bg-slate-50 text-hc-dark border-slate-100'
                        }`}
                      >
                        {remedy}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t clinic-border space-y-4">
                    <h4 className="text-xs font-black text-hc-dark uppercase tracking-widest">Quick Referencing</h4>
                    <button className="w-full flex items-center justify-between p-4 bg-hc-accent/30 rounded-2xl text-hc-green text-xs font-bold hover:bg-hc-accent transition-all group">
                      Open Materia Medica <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-hc-accent/20 rounded-[32px] border-2 border-dashed border-hc-accent/50 p-12 text-center space-y-4 flex flex-col justify-center h-[400px] sticky top-8"
              >
                <Search className="w-12 h-12 text-hc-accent mx-auto" />
                <p className="text-hc-green font-bold text-sm italic">Select a rubric to view remedy grades and associations.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isAiSearching && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-hc-dark w-full max-w-lg rounded-[40px] shadow-2xl p-8 text-white space-y-6"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-hc-accent" />
                <h2 className="text-2xl font-bold serif font-bold">AI Repertory Query</h2>
              </div>
              <p className="text-hc-accent/70 text-sm leading-relaxed"> Consulting Gemini for the rubric <span className="text-white font-bold italic">"{searchQuery}"</span> against Synthesis & Kent's databases...</p>
              <div className="py-12 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-hc-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button onClick={() => setIsAiSearching(false)} className="flex-1 py-3 bg-white/10 rounded-xl font-bold text-xs hover:bg-white/20 transition-all uppercase tracking-widest text-white/60">Cancel Search</button>
                <button onClick={() => setIsAiSearching(false)} className="flex-1 py-3 bg-hc-accent text-hc-green rounded-xl font-bold text-xs hover:bg-white transition-all uppercase tracking-widest shadow-lg shadow-hc-accent/20">Fetch Results</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
