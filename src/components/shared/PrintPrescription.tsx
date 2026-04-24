import React from "react";
import { Printer, X } from "lucide-react";
import { motion } from "motion/react";
import { Prescription, Patient, Medicine } from "../../types";

interface Props {
  prescription: Prescription;
  patient: Patient;
  inventory: Medicine[];
  onClose: () => void;
}

export default function PrintPrescription({ prescription, patient, inventory, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-8 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="text-2xl font-bold text-gray-900">Digital Prescription</h3>
          <div className="flex gap-3">
            <button 
              onClick={() => window.print()} 
              className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all"
            >
              <Printer className="w-5 h-5" /> Print / PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-12 bg-gray-50 print:bg-white custom-scrollbar" id="prescription-content">
          <div className="max-w-3xl mx-auto bg-white p-12 shadow-sm print:shadow-none min-h-[1000px] border border-gray-100 print:border-none relative">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-45 select-none">
              <span className="text-9xl font-black text-emerald-900">KAYRA</span>
            </div>

            {/* Clinic Header */}
            <div className="text-center border-b-2 border-emerald-800 pb-6 mb-8 relative z-10">
              <h2 className="text-4xl font-black text-emerald-900 uppercase tracking-tighter serif">Kayra's Homeo Care</h2>
              <p className="text-emerald-700 font-bold tracking-[0.3em] text-[10px] mt-1">GLOBAL MULTI-SPECIALITY HOMEOPATHY</p>
              <div className="flex justify-center gap-6 mt-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <span>Bihar: Jehanabad | Patna</span>
                <span>Delhi: NCR Hub</span>
                <span>Global: Tele-Consult</span>
              </div>
            </div>

            {/* Patient Info Bar */}
            <div className="flex justify-between text-sm mb-12 border-b border-gray-100 pb-6 relative z-10">
              <div className="space-y-2">
                <p><span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest block">Patient Details</span></p>
                <div className="space-y-0.5">
                  <p className="font-bold text-gray-900 leading-none">{patient.name}</p>
                  <p className="text-xs text-gray-500 font-medium">ID: {patient.id} | {patient.phone}</p>
                </div>
              </div>
              <div className="space-y-2 text-right">
                <p><span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest block">Consultation Date</span></p>
                <p className="font-bold text-gray-900">{new Date(prescription.date).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-tighter">{patient.age}Y / {patient.gender}</p>
              </div>
            </div>

            {/* RX Content */}
            <div className="flex gap-12 relative z-10">
              <div className="w-16 shrink-0 flex flex-col items-center">
                <span className="text-7xl font-serif text-emerald-100/50 leading-none">Rx</span>
                <div className="w-0.5 h-full bg-emerald-50 mt-4 rounded-full" />
              </div>
              <div className="flex-1 space-y-12">
                {prescription.complaints && (
                  <div>
                    <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-3">Presenting Complaints</h4>
                    <p className="text-gray-800 leading-relaxed text-sm bg-gray-50/50 p-4 rounded-xl border border-gray-100 italic">"{prescription.complaints}"</p>
                  </div>
                )}

                {prescription.diagnosis && (
                  <div>
                    <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-3">Clinical Diagnosis</h4>
                    <p className="text-gray-900 font-bold text-lg">{prescription.diagnosis}</p>
                  </div>
                )}
                
                <div className="space-y-8">
                  <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-4">Prescribed Remedies</h4>
                  {prescription.medicines.map((m, idx) => {
                    const medInfo = inventory.find(i => i.id === m.medicineId);
                    return (
                      <div key={idx} className="flex justify-between items-start border-b border-gray-50 pb-6 group">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-emerald-200 font-serif italic text-lg">{String(idx + 1).padStart(2, '0')}.</span>
                            <p className="font-black text-xl text-emerald-950 uppercase tracking-tighter">{m.medicineName}</p>
                            {medInfo && <span className="text-xs font-bold text-emerald-600/50">{medInfo.potency}</span>}
                          </div>
                          <div className="flex items-center gap-2 pl-8">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                            <p className="text-sm text-gray-600 font-semibold">{m.dosage}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-emerald-700/30 text-[10px] uppercase tracking-[0.3em]">{m.duration}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {prescription.notes && (
                  <div>
                    <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-3">Specific Instructions</h4>
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">{prescription.notes}</p>
                  </div>
                )}

                <div className="pt-8 border-t border-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">General Homeopathic Advice</h4>
                  <ul className="text-[11px] text-gray-500 space-y-2 list-disc pl-4">
                    <li>Avoid strong smelling substances (Camphor, Menthol, Onions, Garlic) 30 mins before/after dosage.</li>
                    <li>Do not touch medicines with bare hands; use the bottle cap.</li>
                    <li>Avoid coffee and nicotine for at least 1 hour around the time of taking medicine.</li>
                    <li>Keep medicines away from direct sunlight and strong electromagnetic fields (Mobile, Microwave).</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-24 pt-12 flex justify-between items-end relative z-10 border-t border-emerald-800/10">
              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest space-y-1">
                <p>Digitally Signed by Kayra Clinical System</p>
                <p>Verified Practitioner: Dr. Ravi Raj (BHMS)</p>
                <p>Reference: {prescription.id}</p>
              </div>
              <div className="text-center w-56">
                <div className="h-16 flex items-end justify-center mb-2">
                   <span className="font-serif italic text-2xl text-emerald-900 opacity-80">Dr. Ravi Raj</span>
                </div>
                <div className="border-t-2 border-emerald-900 pt-3">
                  <p className="font-black text-emerald-950 text-xs tracking-widest uppercase">Principal Physician</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Reg No: 12345/BIHAR</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
