import React, { useState } from "react";
import { ArrowLeft, UserPlus, ShieldCheck, Sparkles, ChevronRight, Phone, User, Home, Calendar } from "lucide-react";
import { motion } from "motion/react";
import { db } from "../../lib/db";
import { Patient } from "../../types";

interface Props {
  onBack: () => void;
  onSuccess: (patientId: string) => void;
}

export default function PatientRegister({ onBack, onSuccess }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male" as "Male" | "Female" | "Other",
    phone: "",
    address: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate new Patient ID
    const patients = db.get<Patient[]>('patients') || [];
    const nextId = `P${(patients.length + 1).toString().padStart(3, '0')}`;
    
    const newPatient: Patient = {
      id: nextId,
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      phone: formData.phone,
      address: formData.address,
      createdAt: new Date().toISOString()
    };
    
    db.set('patients', [...patients, newPatient]);
    setStep(2);
    setTimeout(() => onSuccess(nextId), 3000);
  };

  return (
    <div className="min-h-screen bg-hc-light flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b clinic-border bg-white sticky top-0 z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-hc-green transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-hc-green" />
          <span className="font-bold text-hc-dark serif">Kayra Patient Registration</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-8 py-16">
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white p-10 rounded-[40px] border clinic-border shadow-xl shadow-hc-green/5"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-hc-dark mb-2 serif">Start Your Healing Journey</h2>
              <p className="text-slate-500">Create your digital health profile for global consultations.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Full Name / पूरा नाम</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      required
                      className="w-full bg-hc-light/50 border clinic-border rounded-2xl pl-12 pr-5 py-4 outline-none focus:ring-2 focus:ring-hc-green/20"
                      placeholder="e.g. Rajesh Kumar"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Age / उम्र</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="number"
                        required
                        className="w-full bg-hc-light/50 border clinic-border rounded-2xl pl-12 pr-5 py-4 outline-none focus:ring-2 focus:ring-hc-green/20"
                        placeholder="25"
                        value={formData.age}
                        onChange={e => setFormData({...formData, age: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Gender / लिंग</label>
                    <select 
                      className="w-full bg-hc-light/50 border clinic-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-hc-green/20 appearance-none"
                      value={formData.gender}
                      onChange={e => setFormData({...formData, gender: e.target.value as any})}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Phone Number / फ़ोन</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      required
                      className="w-full bg-hc-light/50 border clinic-border rounded-2xl pl-12 pr-5 py-4 outline-none focus:ring-2 focus:ring-hc-green/20"
                      placeholder="+91"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Address / पता</label>
                  <div className="relative">
                    <Home className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <textarea 
                      required
                      rows={3}
                      className="w-full bg-hc-light/50 border clinic-border rounded-2xl pl-12 pr-5 py-4 outline-none focus:ring-2 focus:ring-hc-green/20 resize-none"
                      placeholder="Street, City, State"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-hc-green text-white font-bold py-5 rounded-2xl hover:bg-hc-dark transition-all shadow-lg shadow-hc-green/20 flex items-center justify-center gap-2 text-lg active:scale-95 transform"
              >
                Create My Account <UserPlus className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="text-center space-y-8 py-20 bg-white rounded-[40px] border clinic-border shadow-2xl"
          >
            <div className="w-24 h-24 bg-hc-accent text-hc-green rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-hc-dark tracking-tight serif">Registration Successful!</h2>
              <p className="text-xl text-slate-500 max-w-md mx-auto leading-relaxed">
                Welcome to Kayra Health. Your digital records are being initialized.
              </p>
            </div>
            
            <div className="p-6 bg-hc-accent/30 rounded-2xl border border-hc-accent inline-block">
              <p className="text-[10px] font-bold text-hc-green uppercase tracking-widest mb-1">Your Patient ID</p>
              <p className="text-4xl font-black text-hc-dark mono tracking-tighter">
                {db.get<Patient[]>('patients')?.slice(-1)[0]?.id}
              </p>
            </div>

            <p className="text-xs text-slate-400 animate-pulse">Redirecting to your dashboard...</p>
          </motion.div>
        )}
      </main>

      <footer className="p-12 text-center text-slate-400 border-t clinic-border bg-white/50">
        <p>&copy; 2026 Kayra's Homeo Care. Your healthcare data is protected by end-to-end encryption.</p>
      </footer>
    </div>
  );
}
