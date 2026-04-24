import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  MessageCircle, 
  FileText, 
  Calendar, 
  ChevronRight, 
  Send, 
  Globe, 
  ArrowLeft,
  Sparkles,
  User,
  LogOut,
  Clock,
  ExternalLink,
  Video,
  CreditCard,
  Printer,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/db";
import { Prescription, Patient, Appointment, CallSession, Medicine, Doctor } from "../../types";
import { chatWithHealthBot } from "../../lib/gemini";
import VideoConsultation from "../shared/VideoConsultation";
import PaymentGateway from "../shared/PaymentGateway";
import PrintPrescription from "../shared/PrintPrescription";

const T = {
  en: {
    welcome: "Welcome to Kayra's Homeo Care",
    login_prompt: "Enter your Patient ID to access global homeopathic care",
    id_placeholder: "e.g. P001",
    login_btn: "Access Records",
    prescriptions: "My Prescriptions",
    appointments: "Upcoming Visits",
    find_doctors: "Find Specialists",
    chat_ai: "AI Health Assistant",
    chat_placeholder: "Ask about your symptoms or homeopathy...",
    logout: "Exit Portal",
    no_presc: "No prescriptions found.",
    no_appt: "No upcoming appointments.",
    language: "Hindi (हिंदी)",
    forgot_id: "Forgot Patient ID?",
    find_id_title: "Find My Patient ID",
    find_id_prompt: "Enter your registered phone number",
    find_btn: "Find ID",
    found_msg: "Your Patient ID is:",
    not_found: "Phone number not registered.",
    back_to_login: "Back to Login"
  },
  hi: {
    welcome: "Kayra's होम्यो केयर में स्वागत है",
    login_prompt: "अपनी रिपोर्ट देखने के लिए आईडी दर्ज करें",
    id_placeholder: "जैसे: P001",
    login_btn: "रिकॉर्ड देखें",
    prescriptions: "मेरी दवा पर्ची",
    appointments: "अगली मुलाकात",
    find_doctors: "डॉक्टर खोजें",
    chat_ai: "AI स्वास्थ्य सलाहकार",
    chat_placeholder: "अपने लक्षणों के बारे में पूछें...",
    logout: "बाहर निकलें",
    no_presc: "कोई दवा पर्ची नहीं मिली।",
    no_appt: "कोई निर्धारित मुलाकात नहीं है।",
    language: "English",
    forgot_id: "आईडी भूल गए?",
    find_id_title: "आईडी खोजें",
    find_id_prompt: "अपना पंजीकृत फोन नंबर दर्ज करें",
    find_btn: "खोजें",
    found_msg: "आपकी पेशेंट आईडी है:",
    not_found: "फोन नंबर पंजीकृत नहीं है।",
    back_to_login: "लॉगिन पर वापस जाएं"
  }
};

export default function PatientPortal({ onBack }: { onBack?: () => void }) {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [patientId, setPatientId] = useState("");
  const [loggedInPatient, setLoggedInPatient] = useState<Patient | null>(null);
  const [activeView, setActiveView] = useState<'home' | 'prescriptions' | 'chat' | 'video' | 'doctors'>('home');
  const [showPayment, setShowPayment] = useState<{ amount: number; id: string } | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const inventory = db.get<Medicine[]>('inventory') || [];
  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
  const [showFindId, setShowFindId] = useState(false);
  const [searchPhone, setSearchPhone] = useState("");
  const [foundId, setFoundId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState(false);
  
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const t = T[lang];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Global call listener for patient
  useEffect(() => {
    if (loggedInPatient && activeView !== 'video') {
      const interval = setInterval(() => {
        const sessions = db.get<CallSession[]>('call_sessions') || [];
        const active = sessions.find(s => s.patientId === loggedInPatient.id && s.status === 'waiting');
        setIncomingCall(active || null);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loggedInPatient, activeView]);

  const handleLogin = () => {
    const patients = db.get<Patient[]>('patients') || [];
    const patient = patients.find(p => p.id.toLowerCase() === patientId.toLowerCase());
    if (patient) {
      setLoggedInPatient(patient);
    } else {
      alert(lang === 'hi' ? "आईडी गलत है" : "Invalid Patient ID");
    }
  };

  const handleChat = async () => {
    if (!currentQuery.trim() || isChatLoading) return;
    const query = currentQuery;
    setCurrentQuery("");
    setChatHistory(prev => [...prev, { role: 'user', content: query }]);
    setIsChatLoading(true);

    const response = await chatWithHealthBot(query, chatHistory, lang);
    setChatHistory(prev => [...prev, { role: 'model', content: response }]);
    setIsChatLoading(false);
  };

  const logout = () => {
    setLoggedInPatient(null);
    setPatientId("");
    setActiveView('home');
    setChatHistory([]);
    setShowPayment(null);
    setShowFindId(false);
    setSearchPhone("");
    setFoundId(null);
  };

  const handleFindId = () => {
    const patients = db.get<Patient[]>('patients') || [];
    const patient = patients.find(p => p.phone === searchPhone);
    if (patient) {
      setFoundId(patient.id);
      setSearchError(false);
    } else {
      setFoundId(null);
      setSearchError(true);
    }
  };

  if (!loggedInPatient) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 h-full flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-white rounded-3xl p-8 shadow-xl shadow-emerald-900/5 border border-emerald-50 text-center"
        >
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-hc-green transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
            <button 
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full"
            >
              <Globe className="w-3 h-3" /> {t.language}
            </button>
          </div>
          
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-emerald-600" />
          </div>

          <AnimatePresence mode="wait">
            {!showFindId ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold text-hc-dark mb-2 serif">{t.welcome}</h2>
                  <p className="text-slate-500 text-sm">{t.login_prompt}</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      className="w-full bg-hc-light/50 border clinic-border rounded-2xl pl-12 pr-5 py-4 outline-none focus:ring-2 focus:ring-hc-green/20 font-bold tracking-widest uppercase text-center"
                      placeholder={t.id_placeholder}
                      value={patientId}
                      onChange={e => setPatientId(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleLogin}
                    className="w-full bg-hc-green text-white font-bold py-5 rounded-[24px] hover:bg-hc-dark shadow-lg shadow-hc-green/20 transition-all active:scale-95 transform text-lg"
                  >
                    {t.login_btn}
                  </button>
                  <button 
                    onClick={() => {
                      setShowFindId(true);
                      setSearchError(false);
                      setFoundId(null);
                    }}
                    className="text-xs font-bold text-hc-green/70 hover:text-hc-green tracking-wide uppercase mt-4"
                  >
                    {t.forgot_id}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="find-id"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold text-hc-dark mb-2 serif">{t.find_id_title}</h2>
                  <p className="text-slate-500 text-sm">{t.find_id_prompt}</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Send className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="tel"
                      className="w-full bg-hc-light/50 border clinic-border rounded-2xl pl-12 pr-5 py-4 outline-none focus:ring-2 focus:ring-hc-green/20 font-bold text-center"
                      placeholder="e.g. 9876543210"
                      value={searchPhone}
                      onChange={e => setSearchPhone(e.target.value)}
                    />
                  </div>

                  {foundId && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-4 bg-hc-accent/50 rounded-2xl border border-hc-accent text-center"
                    >
                      <p className="text-[10px] font-bold text-hc-green uppercase tracking-widest mb-1">{t.found_msg}</p>
                      <p className="text-3xl font-extrabold text-hc-dark tracking-tighter">{foundId}</p>
                    </motion.div>
                  )}

                  {searchError && (
                    <p className="text-xs font-bold text-red-500 animate-pulse">{t.not_found}</p>
                  )}

                  {!foundId && (
                    <button 
                      onClick={handleFindId}
                      className="w-full bg-hc-green text-white font-bold py-5 rounded-[24px] hover:bg-hc-dark shadow-lg shadow-hc-green/20 transition-all active:scale-95 transform"
                    >
                      {t.find_btn}
                    </button>
                  )}

                  <button 
                    onClick={() => {
                      setShowFindId(false);
                      setPatientId(foundId || "");
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-hc-green/70 hover:text-hc-green tracking-wide uppercase mx-auto mt-4"
                  >
                    <ArrowLeft className="w-3 h-3" /> {t.back_to_login}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  const allPrescriptions = db.get<Prescription[]>('prescriptions') || [];
  const myPrescriptions = allPrescriptions.filter(p => p.patientId === loggedInPatient.id).sort((a,b) => b.date.localeCompare(a.date));

  if (activeView === 'video') {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="absolute top-8 left-8 z-[110]">
          <button onClick={() => setActiveView('home')} className="flex items-center gap-2 text-white bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl hover:bg-white/20 transition-all">
             <ArrowLeft className="w-5 h-5" /> Return to Dashboard
          </button>
        </div>
        <VideoConsultation role="patient" patientId={loggedInPatient.id} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-6">
      <AnimatePresence>
        {incomingCall && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[120] w-full max-w-md"
          >
            <div className="bg-emerald-900 text-white p-6 rounded-[32px] shadow-2xl border border-emerald-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
                  <Video className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold">Incoming Consultation</p>
                  <p className="text-xs text-emerald-300/80">Dr. Ravi Raj is calling you...</p>
                </div>
              </div>
              <div className="flex gap-2">
                 <button 
                  onClick={() => {
                    setIncomingCall(null);
                    setActiveView('video');
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                 >
                   Join
                 </button>
                 <button 
                  onClick={() => {
                    const sessions = db.get<CallSession[]>('call_sessions') || [];
                    const updated = sessions.map(s => s.id === incomingCall.id ? { ...s, status: 'ended' as const } : s);
                    db.set('call_sessions', updated);
                    setIncomingCall(null);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                 >
                   Decline
                 </button>
              </div>
            </div>
          </motion.div>
        )}

        {showPayment && (
          <PaymentGateway 
            amount={showPayment.amount}
            patientName={loggedInPatient.name}
            onCancel={() => setShowPayment(null)}
            onSuccess={() => {
              const prescriptions = db.get<Prescription[]>('prescriptions') || [];
              const updated = prescriptions.map(p => p.id === showPayment.id ? { ...p, isPaid: true } : p);
              db.set('prescriptions', updated);
              setShowPayment(null);
            }}
          />
        )}
      </AnimatePresence>
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold">
            {loggedInPatient.name[0]}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{loggedInPatient.name}</h3>
            <p className="text-xs text-gray-500">ID: {loggedInPatient.id} • {loggedInPatient.phone}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Globe className="w-5 h-5" />
          </button>
          <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-xl">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col gap-6">
        {activeView === 'home' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
            <div className="space-y-6 flex flex-col h-full">
              <div 
                onClick={() => setActiveView('prescriptions')}
                className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex-1 group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="p-4 bg-emerald-50 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t.prescriptions}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">View and download your digital prescriptions from your last visits.</p>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-50 rounded-full opacity-50"></div>
              </div>

              <div 
                onClick={() => setActiveView('video')}
                className="bg-slate-900 p-8 rounded-[32px] border border-slate-800 shadow-xl hover:shadow-2xl transition-all cursor-pointer flex-1 group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="p-4 bg-white/10 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform">
                    <Video className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Video Consulting</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">Connect live with your doctor from the comfort of your home.</p>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-400/10 rounded-full opacity-50"></div>
              </div>
            </div>

            <div 
              onClick={() => setActiveView('doctors')}
              className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full"
            >
              <div className="relative z-10">
                <div className="p-4 bg-hc-accent/30 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform">
                  <User className="w-8 h-8 text-hc-green" />
                </div>
                <h3 className="text-xl font-bold text-hc-dark mb-2">{t.find_doctors}</h3>
                <p className="text-xs text-slate-500">Choose from our global network of registered হোমিওপ্যাথিক practitioners.</p>
                <div className="mt-8 space-y-3">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-hc-green uppercase tracking-widest bg-hc-accent/20 p-2 rounded-lg border border-hc-green/5">
                      <div className="w-1.5 h-1.5 bg-hc-green rounded-full animate-pulse"></div>
                      Experts Available Now
                   </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-hc-accent/10 rounded-full opacity-50"></div>
            </div>

            <div 
              onClick={() => setActiveView('chat')}
              className="bg-emerald-900 p-8 rounded-[32px] text-white cursor-pointer hover:bg-emerald-950 transition-all group relative overflow-hidden h-full flex flex-col"
            >
              <div className="relative z-10 h-full flex flex-col">
                <div className="p-4 bg-white/10 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8 text-emerald-300" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{t.chat_ai}</h3>
                <p className="text-emerald-100/70 mb-8">{t.chat_placeholder}</p>
                
                <div className="mt-auto bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-sm font-bold tracking-widest uppercase opacity-60">Open Assistant</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <Sparkles className="absolute -top-12 -right-12 w-64 h-64 text-white/5 rotate-12" />
            </div>
          </div>
        )}

        {activeView === 'doctors' && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col h-full bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 flex items-center gap-4 shrink-0">
              <button onClick={() => setActiveView('home')} className="p-2 hover:bg-gray-50 rounded-xl"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <h3 className="font-bold text-gray-900">{t.find_doctors}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(db.get<Doctor[]>('doctors') || []).map((doc) => (
                  <div key={doc.id} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-hc-green transition-all group">
                    <div className="flex gap-4 mb-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border clinic-border shadow-sm">
                         <User className="w-8 h-8 text-hc-green" />
                      </div>
                      <div>
                        <h4 className="font-bold text-hc-dark text-lg italic serif">{doc.name}</h4>
                        <p className="text-xs text-hc-green font-bold uppercase tracking-widest">{doc.specialization}</p>
                        <p className="text-[10px] text-slate-500 font-bold">{doc.experience} Years Experience • {doc.location}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
                       <button 
                        onClick={() => {
                          const appointments = db.get<Appointment[]>('appointments') || [];
                          const newAppt: Appointment = {
                            id: `APP-${Date.now()}`,
                            patientId: loggedInPatient.id,
                            patientName: loggedInPatient.name,
                            doctorId: doc.id,
                            doctorName: doc.name,
                            date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                            time: '10:00',
                            type: 'Regular',
                            status: 'Pending'
                          };
                          db.set('appointments', [...appointments, newAppt]);
                          setLang(lang); // trigger re-render
                          alert(`Appointment booked with ${doc.name} for tomorrow at 10:00 AM.`);
                          setActiveView('home');
                        }}
                        className="w-full py-3 bg-hc-green text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-hc-dark shadow-lg shadow-hc-green/10 transition-all"
                       >
                         Book Appointment
                       </button>
                       <button 
                         onClick={() => setActiveView('video')}
                         className="w-full py-3 bg-white text-hc-green border border-hc-green/20 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-hc-accent transition-all flex items-center justify-center gap-2"
                       >
                         <Video className="w-4 h-4" /> Direct Tele-Consult
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeView === 'prescriptions' && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col h-full bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 flex items-center gap-4 shrink-0">
              <button onClick={() => setActiveView('home')} className="p-2 hover:bg-gray-50 rounded-xl"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <h3 className="font-bold text-gray-900">{t.prescriptions}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {myPrescriptions.length > 0 ? (
                myPrescriptions.map((px) => (
                  <div key={px.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700">{new Date(px.date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <span className="font-mono text-xs font-black text-gray-300 px-2 py-0.5 border border-gray-200 rounded">{px.id}</span>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-1">{px.diagnosis || "Regular Consultation"}</h4>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-1 italic">{px.complaints}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex -space-x-2">
                        {px.medicines.slice(0, 3).map((m, i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700">Rx</div>
                        ))}
                        {px.medicines.length > 3 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">+{px.medicines.length - 3}</div>
                        )}
                      </div>
                      <div className="flex gap-3 items-center">
                        {!px.isPaid && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPayment({ amount: px.amount, id: px.id });
                            }}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                          >
                            <CreditCard className="w-3 h-3" /> Pay ₹{px.amount}
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPrescription(px);
                          }}
                          className="bg-white text-emerald-600 border border-emerald-100 p-2.5 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                          title="Print Prescription"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button className="text-xs font-bold text-emerald-600 group-hover:underline flex items-center gap-1">
                          View Details <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p>{t.no_presc}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeView === 'chat' && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col h-full bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm relative">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-emerald-900 text-white">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveView('home')} className="p-2 hover:bg-white/10 rounded-xl"><ArrowLeft className="w-5 h-5" /></button>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-300" />
                  <h3 className="font-bold">{t.chat_ai}</h3>
                </div>
              </div>
              {isChatLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/50">
              {chatHistory.length === 0 && (
                <div className="text-center py-20 px-8">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-10 h-10 text-emerald-600 opacity-20" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">How can I help you today?</h4>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">Ask about common homeopathic remedies, wellness tips, or your previous symptoms.</p>
                </div>
              )}
              {chatHistory.map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-3xl ${
                    item.role === 'user' 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10 rounded-tr-none' 
                      : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{item.content}</p>
                  </div>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100 bg-white shrink-0">
              <div className="flex gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                <input 
                  className="flex-1 bg-transparent px-2 text-sm outline-none"
                  placeholder={t.chat_placeholder}
                  value={currentQuery}
                  onChange={(e) => setCurrentQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                />
                <button 
                  onClick={handleChat}
                  disabled={isChatLoading || !currentQuery.trim()}
                  className="p-3 bg-emerald-600 text-white rounded-xl disabled:opacity-50 hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {selectedPrescription && loggedInPatient && (
            <PrintPrescription 
              prescription={selectedPrescription}
              patient={loggedInPatient}
              inventory={inventory}
              onClose={() => setSelectedPrescription(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
