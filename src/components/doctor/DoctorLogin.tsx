import React, { useState } from "react";
import { 
  Stethoscope, 
  ArrowLeft, 
  Mail, 
  Lock,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/db";
import { Doctor } from "../../types";

interface DoctorLoginProps {
  onBack: () => void;
  onLogin: (doctor: Doctor) => void;
}

export default function DoctorLogin({ onBack, onLogin }: DoctorLoginProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    setError("");
    
    // Simulate network delay
    setTimeout(() => {
      const doctors = db.get<Doctor[]>('doctors') || [];
      const doctor = doctors.find(d => 
        d.email.toLowerCase() === email.toLowerCase() && d.phone === phone
      );

      if (doctor) {
        onLogin(doctor);
      } else {
        setError("Invalid credentials. Please verify your practitioner email and phone mapping.");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-hc-light flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 border clinic-border"
      >
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-hc-green transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Secure Area
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-hc-dark text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-hc-dark/20 ring-8 ring-hc-accent/30">
            <Stethoscope className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-hc-dark serif mb-2">Practitioner Login</h2>
          <p className="text-slate-500 text-sm italic">Access secure clinical systems & records</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="email"
                placeholder="doctor@kayra.com"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-hc-green/20 font-medium text-sm transition-all shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Phone</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="tel"
                placeholder="Contact Number"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-hc-green/20 font-medium text-sm transition-all shadow-inner"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-red-50 rounded-2xl border border-red-100"
              >
                <p className="text-xs text-red-600 font-medium leading-relaxed">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={handleLogin}
            disabled={isLoading || !email || !phone}
            className="w-full bg-hc-dark text-white font-bold py-5 rounded-[24px] hover:bg-black transition-all active:scale-95 transform shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" /> Secure Authentication
              </>
            )}
            {!isLoading && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
          </button>
        </div>

        <div className="mt-10 pt-6 border-t clinic-border text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Biometric & 2FA system integrated
            </p>
        </div>
      </motion.div>
    </div>
  );
}
