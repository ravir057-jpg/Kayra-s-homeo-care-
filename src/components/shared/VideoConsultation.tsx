import React, { useState, useEffect, useRef } from "react";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Users, 
  MessageCircle, 
  Settings, 
  Maximize, 
  Shield, 
  Sparkles,
  Play,
  Monitor,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/db";
import { Patient, CallSession } from "../../types";
import { getClinicalInsights } from "../../lib/gemini";

interface Props {
  role: 'doctor' | 'patient';
  patientId?: string; // Optional for patients
}

export default function VideoConsultation({ role, patientId }: Props) {
  const [isCalling, setIsCalling] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [signal, setSignal] = useState('Excellent');
  const [aiInsights, setAiInsights] = useState<{symptoms: string[], suggestions: string[], urgency: string} | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState("...experiencing bloating and heaviness after meals...");
  const [activeSession, setActiveSession] = useState<CallSession | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [sidePanelTab, setSidePanelTab] = useState<'ai' | 'notes'>('ai');
  const patients = db.get<Patient[]>('patients') || [];
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-save notes during call
  useEffect(() => {
    if (isCalling && role === 'doctor' && activeSession && callNotes) {
      setSaveStatus('saving');
      const timer = setTimeout(() => {
        const sessions = db.get<CallSession[]>('call_sessions') || [];
        const updated = sessions.map(s => s.id === activeSession.id ? { ...s, notes: callNotes } : s);
        db.set('call_sessions', updated);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [callNotes, isCalling, role, activeSession]);

  // Poll for calls (Patient role)
  useEffect(() => {
    if (role === 'patient' && !isCalling) {
      const interval = setInterval(() => {
        const sessions = db.get<CallSession[]>('call_sessions') || [];
        const mySession = sessions.find(s => s.patientId === patientId && s.status !== 'ended');
        if (mySession && mySession.status === 'waiting') {
           setActiveSession(mySession);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [role, isCalling, patientId]);

  useEffect(() => {
    let interval: any;
    if (isCalling) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
        
        // Heartbeat to keep session alive
        if (activeSession) {
          const sessions = db.get<CallSession[]>('call_sessions') || [];
          const current = sessions.find(s => s.id === activeSession.id);
          if (current && current.status === 'ended') {
            endCall();
          }
        }
      }, 1000);
      
      // Attempt to access camera for realism
      if (navigator.mediaDevices && isVideoOn) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(stream => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch(err => console.log("Media access denied or not available in iframe", err));
      }
    }
    return () => {
      clearInterval(interval);
      if (videoRef.current?.srcObject) {
         const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
         tracks.forEach(track => track.stop());
      }
    };
  }, [isCalling, isVideoOn, activeSession]);

  const initiateCall = () => {
    if (role === 'doctor' && !selectedPatientId) return alert("Please select a patient first.");
    
    const patient = patients.find(p => p.id === selectedPatientId);
    const newSession: CallSession = {
      id: `CALL-${Date.now()}`,
      patientId: selectedPatientId,
      patientName: patient?.name || "Patient",
      doctorName: "Dr. Ravi Raj",
      status: 'waiting',
      startedAt: new Date().toISOString()
    };
    
    const sessions = db.get<CallSession[]>('call_sessions') || [];
    db.set('call_sessions', [...sessions, newSession]);
    setActiveSession(newSession);
    setIsCalling(true);
  };

  const joinCall = () => {
    if (!activeSession) return;
    
    const sessions = db.get<CallSession[]>('call_sessions') || [];
    const updated = sessions.map(s => s.id === activeSession.id ? { ...s, status: 'active' as const } : s);
    db.set('call_sessions', updated);
    setIsCalling(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const runAiAnalysis = async () => {
    setIsAiAnalyzing(true);
    const result = await getClinicalInsights(transcript);
    setAiInsights(result);
    setIsAiAnalyzing(false);
  };

  const endCall = () => {
    setIsCalling(false);
    
    if (activeSession) {
      const sessions = db.get<CallSession[]>('call_sessions') || [];
      const updated = sessions.map(s => s.id === activeSession.id ? { 
        ...s, 
        status: 'ended' as const,
        endedAt: new Date().toISOString(),
        duration: callDuration,
        notes: callNotes 
      } : s);
      db.set('call_sessions', updated);
    }
    
    setCallDuration(0);
    setCallNotes("");
    setActiveSession(null);
    if (videoRef.current?.srcObject) {
       const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
       tracks.forEach(track => track.stop());
    }
  };

  if (!isCalling) {
    const history = (db.get<CallSession[]>('call_sessions') || [])
      .filter(s => s.status === 'ended')
      .filter(s => role === 'doctor' || s.patientId === patientId)
      .sort((a,b) => b.startedAt.localeCompare(a.startedAt));

    return (
      <div className="max-w-4xl mx-auto py-12 space-y-12">
        <div className="bg-white rounded-[40px] border border-gray-100 p-12 text-center shadow-xl shadow-sage-900/5 space-y-8">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50/50">
            <Video className="w-10 h-10" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
              {role === 'doctor' ? "Start Tele-Consultation" : "Join Video Call"}
            </h2>
            <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
              Experience private, HD-quality homeopathic consulting through Kayra's secure video network. 
            </p>
          </div>

          {role === 'doctor' && (
            <div className="max-w-md mx-auto">
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block text-left">Select Patient to Call</label>
              <div className="relative">
                <select 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                >
                  <option value="">Select a patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select>
                <Users className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>
          )}

          {role === 'patient' && activeSession && (
            <div className="max-w-md mx-auto p-6 bg-emerald-50 rounded-3xl border border-emerald-100 animate-pulse">
               <p className="text-emerald-800 font-bold mb-2">Incoming Call from Dr. Ravi Raj</p>
               <p className="text-emerald-600 text-sm">Tap "Connect" to join the session.</p>
            </div>
          )}

          <button 
            onClick={role === 'doctor' ? initiateCall : joinCall}
            disabled={role === 'patient' && !activeSession}
            className="bg-emerald-600 text-white px-12 py-5 rounded-[24px] font-bold text-xl shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all flex items-center gap-3 mx-auto disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Play className="w-6 h-6 fill-current" /> {role === 'doctor' ? "Initiate Meeting" : "Connect with Doctor"}
          </button>

          {role === 'patient' && !activeSession && (
            <p className="text-sm text-orange-600 font-medium animate-pulse">Waiting for doctor to initiate the call...</p>
          )}
        </div>

        {/* Call History */}
        <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-emerald-600" />
              <h3 className="text-2xl font-bold text-gray-900">Consultation History</h3>
            </div>
            <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Core Feature
            </div>
          </div>

          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:border-emerald-200 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{role === 'doctor' ? session.patientName : (session.doctorName || "Dr. Ravi Raj")}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(session.startedAt).toLocaleDateString()} at {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {role === 'doctor' && session.notes && (
                        <p className="text-xs text-emerald-600 mt-2 font-medium italic border-l-2 border-emerald-100 pl-2">
                          Note: {session.notes.length > 60 ? `${session.notes.substring(0, 60)}...` : session.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-700">{Math.floor((session.duration || 0) / 60)}m {(session.duration || 0) % 60}s</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Duration</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-400">
                <Video className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p>No previous consultations found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="p-6 flex items-center justify-between text-white bg-gradient-to-b from-black/40 to-transparent fixed top-0 left-0 right-0 z-20">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/30 backdrop-blur-md flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold tracking-widest uppercase">Live • {formatTime(callDuration)}</span>
          </div>
          <p className="font-medium text-gray-300">Consultation ID: <span className="text-white font-mono">KY-923-Z</span></p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Signal Strength</p>
            <p className="text-emerald-400 text-xs font-bold">{signal}</p>
          </div>
          <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 relative flex flex-col lg:flex-row items-center justify-center p-4 lg:p-8 gap-6">
        {/* Remote Participant (Main) */}
        <div className="w-full h-full rounded-[32px] lg:rounded-[48px] bg-slate-900 border border-white/5 overflow-hidden shadow-2xl relative group">
          <img 
            src={`https://picsum.photos/seed/${role === 'doctor' ? 'patient' : 'doctor'}/1920/1080`} 
            alt="Participant" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <div className="absolute bottom-6 left-6 lg:bottom-8 lg:left-8 flex items-center gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg lg:text-xl">{role === 'doctor' ? "Patient (Kayra's Care)" : "Dr. Ravi Raj"}</p>
              <p className="text-white/60 text-[10px] lg:text-sm">Consulting Specialist</p>
            </div>
          </div>
        </div>

        {/* Self View (PIP) */}
        <div className="absolute top-6 right-6 lg:top-12 lg:right-12 w-32 sm:w-48 lg:w-80 aspect-video rounded-2xl lg:rounded-[32px] bg-slate-800 border-2 border-white/10 overflow-hidden shadow-2xl z-10">
          {isVideoOn ? (
             <video 
               ref={videoRef}
               autoPlay 
               playsInline 
               muted 
               className="w-full h-full object-cover -scale-x-100"
             />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
               <div className="text-white/20"><VideoOff className="w-12 h-12" /></div>
            </div>
          )}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span className="text-white text-[10px] font-bold uppercase tracking-widest">Self (Mirror)</span>
          </div>
        </div>
      </div>

      {/* Controls Overlay */}
      <div className="p-6 lg:p-12 pb-12 lg:pb-16 flex items-center justify-center gap-3 lg:gap-6 bg-gradient-to-t from-black/60 to-transparent fixed bottom-0 left-0 right-0 z-20">
        <button 
          onClick={() => setIsMicOn(!isMicOn)}
          className={`p-4 lg:p-6 rounded-2xl lg:rounded-[28px] backdrop-blur-xl transition-all shadow-xl ${
            isMicOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 text-white shadow-red-500/20'
          }`}
        >
          {isMicOn ? <Mic className="w-6 h-6 lg:w-7 lg:h-7" /> : <MicOff className="w-6 h-6 lg:w-7 lg:h-7" /> }
        </button>

        <button 
          onClick={() => setIsVideoOn(!isVideoOn)}
          className={`p-4 lg:p-6 rounded-2xl lg:rounded-[28px] backdrop-blur-xl transition-all shadow-xl ${
            isVideoOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 text-white shadow-red-500/20'
          }`}
        >
          {isVideoOn ? <Video className="w-6 h-6 lg:w-7 lg:h-7" /> : <VideoOff className="w-6 h-6 lg:w-7 lg:h-7" /> }
        </button>

        <button className="p-4 lg:p-6 bg-white/10 hover:bg-white/20 rounded-2xl lg:rounded-[28px] backdrop-blur-xl text-white transition-all shadow-xl hidden sm:block">
           <Monitor className="w-6 h-6 lg:w-7 lg:h-7" />
        </button>

        <button className="p-4 lg:p-6 bg-white/10 hover:bg-white/20 rounded-2xl lg:rounded-[28px] backdrop-blur-xl text-white transition-all shadow-xl hidden sm:block">
           <Maximize className="w-6 h-6 lg:w-7 lg:h-7" />
        </button>

        <button 
          onClick={endCall}
          className="p-4 lg:p-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl lg:rounded-[32px] transition-all shadow-2xl shadow-red-600/40 transform hover:scale-105"
        >
          <PhoneOff className="w-7 h-7 lg:w-8 lg:h-8" />
        </button>
      </div>

      {/* Side Panel (AI & Notes) - Doctor Only */}
      {role === 'doctor' && (
        <AnimatePresence>
          <motion.div 
            initial={{ x: 400 }} 
            animate={{ x: 0 }} 
            className="fixed top-24 bottom-24 right-8 w-96 bg-white/10 backdrop-blur-3xl rounded-[40px] border border-white/10 p-4 z-30 shadow-2xl overflow-hidden hidden lg:flex flex-col"
          >
            {/* Tabs Header */}
            <div className="flex bg-white/5 rounded-2xl p-1 mb-6 border border-white/5">
              <button 
                onClick={() => setSidePanelTab('ai')}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  sidePanelTab === 'ai' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> AI Analysis
              </button>
              <button 
                onClick={() => setSidePanelTab('notes')}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  sidePanelTab === 'notes' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" /> Clinical Notes
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
              {sidePanelTab === 'ai' ? (
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 group relative">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Live Transcription</p>
                    <textarea 
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      className="bg-transparent text-white/80 text-sm italic w-full resize-none outline-none"
                      rows={3}
                    />
                    <button 
                      onClick={runAiAnalysis}
                      disabled={isAiAnalyzing}
                      className="absolute bottom-2 right-2 p-1.5 bg-purple-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isAiAnalyzing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {aiInsights ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest">Suggested Remedies</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          aiInsights.urgency === 'Urgent' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {aiInsights.urgency}
                        </span>
                      </div>
                      {aiInsights.suggestions.map((med: string, i: number) => (
                        <div key={i} className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-white text-sm font-medium hover:bg-purple-500/20 transition-colors cursor-pointer">
                          {med}
                        </div>
                      ))}
                      <div className="pt-2">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Detected Symptoms</p>
                        <div className="flex flex-wrap gap-2">
                          {aiInsights.symptoms.map((s: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-white/5 rounded-md text-[10px] text-purple-200 border border-white/5">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                       <Sparkles className="w-12 h-12 text-white/5 mx-auto mb-4" />
                       <p className="text-xs text-gray-500">Run AI analysis on the transcript to get homeopathic insights.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      Real-time Notes
                      {saveStatus !== 'idle' && (
                        <span className="text-[8px] font-bold text-white/40 uppercase tracking-tighter animate-pulse">
                          {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
                        </span>
                      )}
                    </h4>
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  
                  <textarea 
                    className="flex-1 w-full bg-white/5 border border-white/10 rounded-[32px] p-6 text-white/90 text-sm outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none transition-all placeholder:text-gray-600 leading-relaxed"
                    placeholder="Enter clinical observations, patient modalities, and case taking details here..."
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                  />
                  
                  <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 text-[10px] text-emerald-100/60 leading-relaxed italic">
                    Note: These observations will be permanently attached to this consultation record for future reference.
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-6 mt-6 border-t border-white/10">
              <button className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 border border-white/5">
                <MessageCircle className="w-5 h-5" /> Message Patient
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
