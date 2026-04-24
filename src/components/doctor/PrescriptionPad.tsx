import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Save, 
  Sparkles, 
  Search, 
  Printer, 
  ChevronRight,
  Info,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/db";
import { Patient, Medicine, Prescription } from "../../types";
import { getPrescriptionAI, getDiagnosisAI } from "../../lib/gemini";
import { COMMON_RUBRICS } from "../../lib/homeopathic_data";
import PrintPrescription from "../shared/PrintPrescription";

export default function PrescriptionPad() {
  const [patients] = useState<Patient[]>(db.get<Patient[]>('patients') || []);
  const [inventory] = useState<Medicine[]>(db.get<Medicine[]>('inventory') || []);
  
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [complaints, setComplaints] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescribedMedicines, setPrescribedMedicines] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [diagSuggestions, setDiagSuggestions] = useState<string | null>(null);
  const [suggestedRubrics, setSuggestedRubrics] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isDiagLoading, setIsDiagLoading] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);

  useEffect(() => {
    if (complaints.length > 2) {
      const words = complaints.toLowerCase().split(/[ ,.]+/);
      const matched = COMMON_RUBRICS.filter(r => 
        words.some(word => 
          r.rubric.toLowerCase().includes(word) || 
          r.section.toLowerCase().includes(word)
        )
      );
      setSuggestedRubrics(matched.slice(0, 5));
    } else {
      setSuggestedRubrics([]);
    }
  }, [complaints]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const addMedicineRow = (med?: Medicine) => {
    setPrescribedMedicines([
      ...prescribedMedicines,
      {
        medicineId: med?.id || "",
        medicineName: med?.name || "",
        dosage: "5 drops tid",
        duration: "7 days"
      }
    ]);
  };

  const removeMedicineRow = (index: number) => {
    setPrescribedMedicines(prescribedMedicines.filter((_, i) => i !== index));
  };

  const handleAiAssist = async () => {
    if (!complaints) return alert("Please enter complaints first.");
    setIsAiLoading(true);
    const info = selectedPatient ? `Age: ${selectedPatient.age}, Gender: ${selectedPatient.gender}` : "Unknown";
    const suggestion = await getPrescriptionAI(complaints, info);
    setAiSuggestions(suggestion);
    setIsAiLoading(false);
  };

  const handleSuggestDiagnosis = async () => {
    if (!complaints) return alert("Please enter complaints first.");
    setIsDiagLoading(true);
    const suggestion = await getDiagnosisAI(complaints);
    setDiagSuggestions(suggestion);
    setIsDiagLoading(false);
  };

  const calculateTotal = () => {
    return prescribedMedicines.reduce((acc, curr) => {
      const med = inventory.find(m => m.id === curr.medicineId);
      return acc + (med?.price || 0);
    }, 0);
  };

  const handleSave = () => {
    if (!selectedPatientId || prescribedMedicines.length === 0) return alert("Select patient and add medicines.");
    
    const presc: Prescription = {
      id: `RX${Date.now()}`,
      patientId: selectedPatientId,
      date: new Date().toISOString(),
      complaints,
      diagnosis,
      medicines: prescribedMedicines,
      amount: calculateTotal(),
      isPaid: false
    };

    const allPresc = db.get<Prescription[]>('prescriptions') || [];
    db.set('prescriptions', [...allPresc, presc]);

    // Update stock
    const updatedInventory = inventory.map(item => {
      const prescribed = prescribedMedicines.find(p => p.medicineId === item.id);
      if (prescribed) return { ...item, stock: Math.max(0, item.stock - 1) };
      return item;
    });
    db.set('inventory', updatedInventory);

    setShowPrintView(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 line-clamp-1">Digital Prescription Pad</h1>
          <p className="text-sm text-gray-500">Create professional prescriptions with AI support.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button 
            onClick={handleAiAssist}
            disabled={isAiLoading}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 lg:px-6 py-2.5 lg:py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border border-purple-200 text-sm"
          >
            {isAiLoading ? <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div> : <Sparkles className="w-4 h-4 lg:w-5 lg:h-5" />}
            AI Remedy Suggest
          </button>
          <button 
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 lg:px-6 py-2.5 lg:py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 text-sm"
          >
            <Printer className="w-4 h-4 lg:w-5 lg:h-5" /> Generate RX
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Selection */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">Select Patient</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select 
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
              >
                <option value="">Choose a registered patient...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
            {selectedPatient && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 bg-emerald-50 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-emerald-700">
                  {selectedPatient.name[0]}
                </div>
                <div>
                  <p className="font-bold text-emerald-900">{selectedPatient.name}</p>
                  <p className="text-xs text-emerald-700">{selectedPatient.age} yrs • {selectedPatient.gender} • {selectedPatient.phone}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Clinical Findings */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Presenting Complaints</label>
              <textarea 
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[120px] resize-none"
                placeholder="List patient symptoms, duration, and modalities..."
                value={complaints}
                onChange={(e) => setComplaints(e.target.value)}
              />
              <AnimatePresence>
                {suggestedRubrics.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 flex flex-wrap gap-2"
                  >
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-full mb-1">Suggested Rubrics (Repertory)</span>
                    {suggestedRubrics.map((r, i) => (
                      <div 
                        key={i}
                        className="bg-gray-100 hover:bg-hc-accent border border-gray-200 rounded-lg px-3 py-1.5 cursor-pointer transition-all flex flex-col"
                        onClick={() => {
                          const suggestion = `Suggest remedy for rubric: ${r.rubric} (${r.section})`;
                          setAiSuggestions(suggestion);
                          handleAiAssist();
                        }}
                      >
                        <span className="text-[8px] font-bold text-hc-green uppercase">{r.section}</span>
                        <span className="text-[10px] text-hc-dark font-medium">{r.rubric}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-400 uppercase block">Diagnosis / Miasmatic Analysis</label>
                <button 
                  onClick={handleSuggestDiagnosis}
                  disabled={isDiagLoading}
                  className="text-hc-dark hover:text-hc-green text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-all"
                >
                  {isDiagLoading ? <div className="w-3 h-3 border-2 border-hc-dark border-t-transparent rounded-full animate-spin"></div> : <Sparkles className="w-3 h-3" />}
                  Suggest Diagnosis
                </button>
              </div>
              <input 
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Provisional diagnosis or miasm..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
              {diagSuggestions && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="mt-4 p-5 bg-hc-accent/30 rounded-3xl border border-hc-green/10 relative group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold text-hc-green uppercase tracking-[0.2em]">Diagnostic Intelligence</p>
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => {
                          const mainDiagnosis = diagSuggestions.match(/Possible Diagnoses: (.*)/)?.[1] || diagSuggestions.split('\n')[0];
                          setDiagnosis(mainDiagnosis);
                        }}
                        className="text-[9px] font-bold bg-hc-green text-white px-2 py-1 rounded-lg hover:bg-hc-dark transition-all"
                      >
                        Apply Diagnosis
                      </button>
                      <button 
                        onClick={() => setDiagSuggestions(null)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Plus className="w-4 h-4 rotate-45" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-hc-dark leading-relaxed space-y-2 font-medium">
                    {diagSuggestions.split('\n').map((line, i) => (
                      <p key={i} className={line.startsWith('Possible Diagnoses:') ? 'font-black text-sm text-hc-dark' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Medicines List */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg">Medicines & Dosage</h3>
              <button 
                onClick={() => addMedicineRow()}
                className="text-emerald-600 font-bold flex items-center gap-2 hover:bg-emerald-50 px-3 py-1 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Row
              </button>
            </div>
            <div className="space-y-4">
              {prescribedMedicines.map((item, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap gap-4 items-end bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Medicine</label>
                    <select 
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={item.medicineId}
                      onChange={(e) => {
                        const med = inventory.find(m => m.id === e.target.value);
                        const updated = [...prescribedMedicines];
                        updated[idx].medicineId = e.target.value;
                        updated[idx].medicineName = med?.name || "";
                        setPrescribedMedicines(updated);
                      }}
                    >
                      <option value="">Select from inventory...</option>
                      {inventory.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.potency})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Dosage</label>
                    <input 
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="e.g. 5 drops"
                      value={item.dosage}
                      onChange={(e) => {
                        const updated = [...prescribedMedicines];
                        updated[idx].dosage = e.target.value;
                        setPrescribedMedicines(updated);
                      }}
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Duration</label>
                    <input 
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="7 days"
                      value={item.duration}
                      onChange={(e) => {
                        const updated = [...prescribedMedicines];
                        updated[idx].duration = e.target.value;
                        setPrescribedMedicines(updated);
                      }}
                    />
                  </div>
                  <button 
                    onClick={() => removeMedicineRow(idx)}
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {prescribedMedicines.length === 0 && (
                <div onClick={() => addMedicineRow()} className="border-2 border-dashed border-gray-100 rounded-3xl p-12 text-center cursor-pointer hover:border-emerald-200 transition-colors">
                  <Plus className="w-10 h-10 mx-auto mb-4 text-gray-200" />
                  <p className="text-gray-400 font-medium">Click to add your first medicine</p>
                </div>
              )}
            </div>
            {prescribedMedicines.length > 0 && (
              <div className="mt-8 flex justify-end">
                <div className="bg-emerald-50 px-6 py-4 rounded-3xl">
                  <p className="text-sm text-emerald-600 font-bold">Estimated Total Billing</p>
                  <p className="text-3xl font-black text-emerald-900">₹{calculateTotal()}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* AI Helper Sidebar */}
          <div className="bg-purple-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-purple-900/20">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-300" />
                <h3 className="text-xl font-bold">Clinical AI Intelligence</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                   <p className="text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-2">Remedy Analysis</p>
                   <p className="text-xs text-purple-100/70 mb-4">Matches symptoms with Materia Medica.</p>
                   <button 
                     onClick={handleAiAssist}
                     disabled={isAiLoading}
                     className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                   >
                     {isAiLoading ? "Analyzing..." : "Analyze Symptoms"}
                   </button>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                   <p className="text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-2">Diagnostic Engine</p>
                   <p className="text-xs text-purple-100/70 mb-4">Identifies provisional diagnosis and miasms.</p>
                   <button 
                     onClick={handleSuggestDiagnosis}
                     disabled={isDiagLoading}
                     className="w-full bg-white text-purple-900 font-bold py-2.5 rounded-xl text-xs hover:bg-purple-50 transition-colors"
                   >
                     {isDiagLoading ? "Diagnosing..." : "Suggest Diagnosis"}
                   </button>
                </div>
              </div>

              {aiSuggestions && (
                <div className="pt-6 border-t border-white/10">
                   <div className="flex items-center justify-between mb-4">
                     <p className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">Remedy Insights</p>
                     <button onClick={() => setAiSuggestions(null)} className="text-[10px] text-purple-400 hover:text-white uppercase font-bold">Clear</button>
                   </div>
                   <div className="text-sm leading-relaxed text-purple-100 font-light max-h-[300px] overflow-y-auto pr-2 custom-scrollbar-white">
                    {aiSuggestions.split('\n').map((line, i) => (
                      <p key={i} className="mb-2">{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Sparkles className="absolute -bottom-10 -left-10 w-48 h-48 text-white/5" />
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-600" />
              Guidelines
            </h4>
            <ul className="text-sm text-gray-500 space-y-3">
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
                Deducts medicine stock automatically after generating RX.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
                AI is trained on Materia Medica and Repertory.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
                Prescriptions are saved to patient history.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Print View Modal */}
      <AnimatePresence>
        {showPrintView && selectedPatient && (
          <PrintPrescription 
            prescription={{
              id: `PX-LAST`, // Dummy ID for immediate display
              patientId: selectedPatientId,
              date: new Date().toISOString(),
              complaints,
              diagnosis,
              medicines: prescribedMedicines,
              isPaid: false,
              amount: calculateTotal()
            }}
            patient={selectedPatient}
            inventory={inventory}
            onClose={() => setShowPrintView(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
