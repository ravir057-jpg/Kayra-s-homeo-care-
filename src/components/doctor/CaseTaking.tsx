import React, { useState } from "react";
import { 
  Save, 
  History, 
  User, 
  ClipboardList, 
  Brain, 
  Activity, 
  Search,
  ChevronRight,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/db";
import { Patient, CaseRecord } from "../../types";
import { getCaseTakingAI } from "../../lib/gemini";
import { Sparkles } from "lucide-react";

export default function CaseTaking() {
  const [patients] = useState<Patient[]>(db.get<Patient[]>('patients') || []);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [activeCase, setActiveCase] = useState<Partial<CaseRecord>>({
    mentalGenerals: "",
    physicalGenerals: "",
    chiefComplaints: "",
    modalities: "",
    pastHistory: "",
    familyHistory: "",
    miasmaticAnalysis: "",
  });

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const patientCases = db.get<CaseRecord[]>('cases')?.filter(c => c.patientId === selectedPatientId) || [];

  const handleAiAssist = async () => {
    if (!activeCase.chiefComplaints) return alert("Please enter Chief Complaints first for AI analysis.");
    setIsAiLoading(true);
    const suggestions = await getCaseTakingAI(activeCase);
    setAiSuggestions(suggestions);
    setIsAiLoading(false);
  };

  const handleSaveCase = () => {
    if (!selectedPatientId) return alert("Select a patient first.");
    
    const newCase: CaseRecord = {
      ...activeCase as CaseRecord,
      id: `CASE${Date.now()}`,
      patientId: selectedPatientId,
      date: new Date().toISOString()
    };

    const allCases = db.get<CaseRecord[]>('cases') || [];
    db.set('cases', [newCase, ...allCases]);
    alert("Case history saved successfully.");
    setActiveCase({
      mentalGenerals: "",
      physicalGenerals: "",
      chiefComplaints: "",
      modalities: "",
      pastHistory: "",
      familyHistory: "",
      miasmaticAnalysis: "",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-hc-dark serif">Clinical Case Taking</h1>
          <p className="text-sm text-slate-500 italic">Structured Hahnemannian Anamnesis & History Taking</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleAiAssist}
            disabled={isAiLoading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-100 rounded-xl text-purple-700 hover:bg-purple-100 transition-all font-bold text-sm"
          >
            {isAiLoading ? <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div> : <Sparkles className="w-4 h-4" />}
            AI Analysis
          </button>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-hc-dark hover:bg-hc-accent transition-all font-bold text-sm"
          >
            <History className="w-4 h-4" /> History
          </button>
          <button 
            onClick={handleSaveCase}
            className="flex items-center gap-2 px-6 py-2 bg-hc-green text-white rounded-xl hover:bg-hc-dark transition-all font-bold text-sm shadow-lg shadow-hc-green/20"
          >
            <Save className="w-4 h-4" /> Save Case
          </button>
        </div>
      </div>

      <AnimatePresence>
        {aiSuggestions && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-purple-900/5 border border-purple-200 p-8 rounded-[40px]"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-700">
                <Brain className="w-4 h-4" />
                <h4 className="text-xs font-black uppercase tracking-widest">Mental Inquiries</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">{aiSuggestions.mentalSuggestions}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-700">
                <Activity className="w-4 h-4" />
                <h4 className="text-xs font-black uppercase tracking-widest">Physical Inquiries</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">{aiSuggestions.physicalSuggestions}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-hc-green">
                <Sparkles className="w-4 h-4" />
                <h4 className="text-xs font-black uppercase tracking-widest">Miasmatic Insight</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-bold">{aiSuggestions.miasmaticInsight}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Patient Profile & Mental/Generals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Patient Selection
            </h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-hc-green/20"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
              >
                <option value="">Select a patient for anamnesis...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                ))}
              </select>
            </div>
            {selectedPatient && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-hc-accent/30 rounded-2xl flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold text-hc-dark">{selectedPatient.name}</span>
                  <span className="mx-2 text-hc-green opacity-50">|</span>
                  <span className="text-hc-dark/70">{selectedPatient.age} Y • {selectedPatient.gender}</span>
                </div>
                <div className="text-[10px] font-black uppercase text-hc-green">ACTIVE SESSION</div>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-hc-green" />
                <h4 className="font-bold text-hc-dark serif">Mental Generals</h4>
              </div>
              <textarea 
                className="w-full h-40 bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-hc-green/20 resize-none outline-none"
                placeholder="Anger, Fears, Dreams, Memory, Disposition..."
                value={activeCase.mentalGenerals}
                onChange={(e) => setActiveCase({...activeCase, mentalGenerals: e.target.value})}
              />
            </div>
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-hc-green" />
                <h4 className="font-bold text-hc-dark serif">Physical Generals</h4>
              </div>
              <textarea 
                className="w-full h-40 bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-hc-green/20 resize-none outline-none"
                placeholder="Appetite, Thirst, Sweat, Sleep, Thermal, Cravings..."
                value={activeCase.physicalGenerals}
                onChange={(e) => setActiveCase({...activeCase, physicalGenerals: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h4 className="font-bold text-hc-dark serif mb-6 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-hc-green" />
              Chief Complaints & Modalities
            </h4>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Presenting Symptom</label>
                  <textarea 
                    className="w-full h-32 bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-hc-green/20 resize-none outline-none"
                    placeholder="Sensation, Location, Extension..."
                    value={activeCase.chiefComplaints}
                    onChange={(e) => setActiveCase({...activeCase, chiefComplaints: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Modalities (& Concomitants)</label>
                  <textarea 
                    className="w-full h-32 bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-hc-green/20 resize-none outline-none"
                    placeholder="Amelioration (<), Aggravation (>), Time, Weather..."
                    value={activeCase.modalities}
                    onChange={(e) => setActiveCase({...activeCase, modalities: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: History & Miasm */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Past History</label>
              <textarea 
                className="w-full h-24 bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-hc-green/20 resize-none outline-none"
                placeholder="Birth, childhood diseases, vaccination..."
                value={activeCase.pastHistory}
                onChange={(e) => setActiveCase({...activeCase, pastHistory: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Family History</label>
              <textarea 
                className="w-full h-24 bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-hc-green/20 resize-none outline-none"
                placeholder="Chronic ailments in lineage..."
                value={activeCase.familyHistory}
                onChange={(e) => setActiveCase({...activeCase, familyHistory: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-hc-green uppercase tracking-widest ml-1">Miasmatic Analysis</label>
                <button 
                  onClick={handleAiAssist}
                  className="text-[9px] font-black text-purple-600 hover:text-purple-800 transition-colors uppercase"
                >
                  Use AI Insights
                </button>
              </div>
              <textarea 
                className="w-full h-24 bg-hc-accent/20 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-hc-green/20 resize-none outline-none"
                placeholder="Psoric/Sycotic/Syphilitic predominence..."
                value={activeCase.miasmaticAnalysis}
                onChange={(e) => setActiveCase({...activeCase, miasmaticAnalysis: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-hc-dark rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-hc-dark/20">
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-hc-accent" />
              Clinical Reminder
            </h4>
            <p className="text-xs text-hc-accent/70 leading-relaxed italic">
              "The physician's high and only mission is to restore the sick to health, to cure, as it is termed."
              <br/>— Organon of Medicine, Aph. 1
            </p>
            <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
               <p className="text-[10px] font-bold text-hc-accent uppercase">Dynamic Tip</p>
               <p className="text-[10px] text-white/60">Cross-reference mental generals with Materia Medica to confirm the chronic remedy.</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-4xl max-h-[80vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b clinic-border flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-hc-dark serif">Case Records History</h2>
                  <p className="text-sm text-slate-500">{selectedPatient ? `Viewing records for ${selectedPatient.name}` : 'Select a patient to see history'}</p>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-hc-dark transition-all"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {patientCases.length > 0 ? (
                  patientCases.map((record) => (
                    <div key={record.id} className="bg-slate-50 rounded-3xl p-6 relative group border border-slate-200/50">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-hc-green bg-white px-3 py-1 rounded-full border border-hc-green/20">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 capitalize">{record.id}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-2">
                          <p className="font-bold text-hc-dark">Mental Generals:</p>
                          <p className="text-slate-600 line-clamp-3">{record.mentalGenerals}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="font-bold text-hc-dark">Physical Generals:</p>
                          <p className="text-slate-600 line-clamp-3">{record.physicalGenerals}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-slate-400">
                    <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-10" />
                    <p className="font-medium">No case history found for this patient.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
