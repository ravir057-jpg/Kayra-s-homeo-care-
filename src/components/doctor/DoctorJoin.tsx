import React, { useState } from "react";
import { ArrowLeft, Stethoscope, Globe, ShieldCheck, TrendingUp, Sparkles, UserPlus, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { db } from "../../lib/db";
import { Doctor } from "../../types";

interface Props {
  onBack: () => void;
}

export default function DoctorJoin({ onBack }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "Homeopathy",
    experience: "",
    clinicName: "",
    location: "",
    email: "",
    phone: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const doctors = db.get<Doctor[]>('doctors') || [];
    const nextId = `D${(doctors.length + 1).toString().padStart(3, '0')}`;
    
    const newDoctor: Doctor = {
      ...formData,
      id: nextId,
      createdAt: new Date().toISOString()
    };
    
    db.set('doctors', [...doctors, newDoctor]);
    setStep(3); // Success state
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-emerald-600" />
          <span className="font-bold text-gray-900">Kayra Provider Network</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-8 py-16">
        {step === 1 && (
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-black text-gray-900 tracking-tight">Grow your practice with <span className="text-emerald-600 tracking-tighter italic">Kayra's care.</span></h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">Join the world's most advanced digital homeopathic platform and increase your patient reach globally.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Globe, title: "Global Reach", desc: "Access patients beyond your local city boundaries." },
                { icon: TrendingUp, title: "10x Growth", desc: "Digital visibility leads to consistent patient flow." },
                { icon: ShieldCheck, title: "Verified Trust", desc: "Get established as a trusted Kayra certified doctor." }
              ].map((benefit, i) => (
                <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                  <div className="p-3 bg-emerald-50 rounded-2xl w-fit mb-6 text-emerald-600">
                    <benefit.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button 
                onClick={() => setStep(2)}
                className="bg-emerald-600 text-white px-12 py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-3"
              >
                Join Practitioner Network <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Doctor Registration</h2>
            <p className="text-gray-500 mb-8">Tell us about your practice to get started.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Full Name & Qualifications</label>
                  <div className="relative">
                    <input 
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Dr. Name (B.H.M.S)"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Specialization</label>
                    <input 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="e.g. Skin, Chronic"
                      value={formData.specialization}
                      onChange={e => setFormData({...formData, specialization: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Experience (Years)</label>
                    <input 
                      type="number"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="5+"
                      value={formData.experience}
                      onChange={e => setFormData({...formData, experience: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Clinic Name & Location</label>
                  <input 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Clinic name, City"
                    value={formData.clinicName}
                    onChange={e => setFormData({...formData, clinicName: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Email</label>
                    <input 
                      type="email"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="email@practice.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Phone</label>
                    <input 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="+91"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-600 text-white font-bold py-5 rounded-[24px] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                Submit Application <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 py-20">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Welcome to the Network, Dr. {formData.name.split(' ')[0]}!</h2>
            <p className="text-xl text-gray-500 max-w-md mx-auto leading-relaxed">Your application has been received. Our medical board will verify your details and activate your dashboard within 24 hours.</p>
            <button 
              onClick={onBack}
              className="bg-white border-2 border-emerald-100 text-emerald-600 px-8 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all"
            >
              Back to Homepage
            </button>
          </motion.div>
        )}
      </main>

      <footer className="p-12 text-center text-gray-400 border-t border-gray-50 bg-white">
        <p>&copy; 2026 Kayra's Homeo Care Provider Network. All medical practitioners are verified for clinical excellence.</p>
      </footer>
    </div>
  );
}
