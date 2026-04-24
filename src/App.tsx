/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Stethoscope, 
  Users, 
  Calendar, 
  Package, 
  Video,
  CreditCard, 
  LayoutDashboard, 
  Settings, 
  Globe, 
  LogOut,
  ChevronRight,
  MessageCircle,
  Clock,
  Search,
  Plus,
  ArrowLeft,
  Menu,
  X,
  Sparkles,
  UserPlus,
  BookOpen,
  ClipboardList,
  Library
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./components/shared/Logo";
import { db, seedInitialData } from "./lib/db";
import { Role, Doctor } from "./types";

// Lazy components
const DoctorDashboard = React.lazy(() => import("./components/doctor/DoctorDashboard"));
const PatientManager = React.lazy(() => import("./components/doctor/PatientManager"));
const AppointmentManager = React.lazy(() => import("./components/doctor/AppointmentManager"));
const PrescriptionPad = React.lazy(() => import("./components/doctor/PrescriptionPad"));
const InventoryManager = React.lazy(() => import("./components/doctor/InventoryManager"));
const BillingManager = React.lazy(() => import("./components/doctor/BillingManager"));
const PractitionerTeam = React.lazy(() => import("./components/doctor/PractitionerTeam"));
const RepertoryBrowser = React.lazy(() => import("./components/doctor/RepertoryBrowser"));
const MateriaMedica = React.lazy(() => import("./components/doctor/MateriaMedica"));
const CaseTaking = React.lazy(() => import("./components/doctor/CaseTaking"));
const PatientPortal = React.lazy(() => import("./components/patient/PatientPortal"));
const VideoConsultation = React.lazy(() => import("./components/shared/VideoConsultation"));
const DoctorJoin = React.lazy(() => import("./components/doctor/DoctorJoin"));
const PatientRegister = React.lazy(() => import("./components/patient/PatientRegister"));
const DoctorLogin = React.lazy(() => import("./components/doctor/DoctorLogin"));
const AppointmentNotifications = React.lazy(() => import("./components/shared/AppointmentNotifications"));

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showDoctorLogin, setShowDoctorLogin] = useState(false);
  const [showDoctorSignup, setShowDoctorSignup] = useState(false);
  const [showPatientSignup, setShowPatientSignup] = useState(false);

  useEffect(() => {
    seedInitialData();
    const savedRole = localStorage.getItem("clinic_role") as Role;
    if (savedRole) setRole(savedRole);
    
    const savedDoctorId = localStorage.getItem("clinic_doctor_id");
    if (savedDoctorId) {
      const doctors = db.get<Doctor[]>('doctors') || [];
      const doc = doctors.find(d => d.id === savedDoctorId);
      if (doc) setCurrentDoctor(doc);
    }
  }, []);

  const selectRole = (r: Role) => {
    setRole(r);
    localStorage.setItem("clinic_role", r);
    if (r === 'patient') {
      setActiveTab("portal");
    }
  };

  const handleDoctorLogin = (doctor: Doctor) => {
    setCurrentDoctor(doctor);
    localStorage.setItem("clinic_doctor_id", doctor.id);
    selectRole('doctor');
  };

  const logout = () => {
    setRole(null);
    setCurrentDoctor(null);
    localStorage.removeItem("clinic_role");
    localStorage.removeItem("clinic_doctor_id");
  };

  const doctorsCount = db.get<Doctor[]>('doctors')?.length || 0;

  if (showDoctorLogin) {
    return (
      <React.Suspense fallback={null}>
        <DoctorLogin 
          onBack={() => setShowDoctorLogin(false)} 
          onLogin={(doc) => {
            setShowDoctorLogin(false);
            handleDoctorLogin(doc);
          }}
        />
      </React.Suspense>
    );
  }

  if (showDoctorSignup) {
    return (
      <React.Suspense fallback={null}>
        <DoctorJoin onBack={() => setShowDoctorSignup(false)} />
      </React.Suspense>
    );
  }

  if (showPatientSignup) {
    return (
      <React.Suspense fallback={null}>
        <PatientRegister 
          onBack={() => setShowPatientSignup(false)} 
          onSuccess={(id) => {
            setShowPatientSignup(false);
            selectRole('patient');
          }} 
        />
      </React.Suspense>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-hc-light flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-[32px] lg:rounded-[40px] shadow-2xl shadow-hc-green/5 p-6 lg:p-10 border clinic-border"
        >
          <div className="text-center mb-6 lg:mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 bg-white rounded-full mb-4 lg:mb-6 shadow-sm ring-4 lg:ring-8 ring-hc-accent/30 overflow-hidden p-2">
              <Logo size={80} />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-hc-dark mb-2 serif tracking-tighter">Kayra's Homeo Care</h1>
            <p className="text-slate-500 italic text-xs lg:text-sm">Global Homeopathic Consultation Platform</p>
            <div className="flex flex-col items-center gap-2 mt-4">
               <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-hc-green rounded-full animate-pulse"></span>
                  <p className="text-[10px] text-hc-green uppercase tracking-widest font-bold">Bihar • Delhi • Global</p>
               </div>
               <div className="bg-hc-accent/50 border border-hc-green/10 px-4 py-1.5 rounded-full flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-hc-green" />
                  <span className="text-[10px] font-black text-hc-green uppercase tracking-wider">{doctorsCount} Specialist Doctors Live</span>
               </div>
            </div>
          </div>

          <div className="space-y-4 lg:space-y-6">
            <div className="space-y-2 lg:space-y-3">
              <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Practitioner Access</p>
              <button 
                onClick={() => setShowDoctorLogin(true)}
                className="w-full flex items-center justify-between p-4 lg:p-5 bg-hc-green text-white rounded-2xl lg:rounded-[24px] hover:bg-hc-dark transition-all group shadow-xl shadow-hc-green/20 active:scale-95 transform"
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="p-2 lg:p-3 bg-white/20 rounded-xl lg:rounded-2xl">
                    <Stethoscope className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-base lg:text-lg leading-tight">Doctor Dashboard</p>
                    <p className="text-[10px] lg:text-xs text-hc-accent opacity-80">Manage patients & inventory</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setShowDoctorSignup(true)}
                className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-hc-green/60 hover:text-hc-green transition-colors"
              >
                Join Our Practitioner Network
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Patient Access / रोगी</p>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => selectRole('patient')}
                  className="w-full flex items-center justify-between p-5 bg-white border-2 border-hc-accent text-hc-dark rounded-[24px] hover:border-hc-green hover:bg-hc-accent/30 transition-all group active:scale-95 transform shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-hc-accent rounded-2xl">
                      <Users className="w-6 h-6 text-hc-green" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg leading-tight">Login Portal</p>
                      <p className="text-xs text-slate-500">Access your digital health vault</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button 
                  onClick={() => setShowPatientSignup(true)}
                  className="w-full py-4 text-hc-green font-bold text-xs bg-hc-accent/50 rounded-2xl hover:bg-hc-accent transition-all flex items-center justify-center gap-2 border border-hc-accent/50"
                >
                  <UserPlus className="w-4 h-4" /> New Patient? Register Here
                </button>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t clinic-border">
              <button 
                onClick={() => setShowDoctorSignup(true)}
                className="w-full py-4 text-hc-dark/60 font-bold text-[10px] uppercase tracking-widest bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 border border-slate-200"
              >
                <Plus className="w-3.5 h-3.5" /> For Doctors: Join Provider Network
              </button>
            </div>
          </div>

          <div className="mt-10 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest space-y-1">
            <p>© 2026 Dr. Ravi Raj Homeopathic Clinic</p>
            <p>Bihar Healthcare Digital Initiative</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "patients", label: "Patients", icon: Users },
    { id: "case-taking", label: "Case Anamnesis", icon: ClipboardList },
    { id: "repertory", label: "Repertory", icon: BookOpen },
    { id: "materia-medica", label: "Materia Medica", icon: Library },
    { id: "appointments", label: "Schedule", icon: Calendar },
    { id: "prescription", label: "New Prescription", icon: Stethoscope },
    { id: "video", label: "Consultation Call", icon: Video },
    { id: "stock", label: "Medicine Stock", icon: Package },
    { id: "billing", label: "Accounting", icon: CreditCard },
    { id: "practitioners", label: "Practitioner Team", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-hc-light flex">
      <AppointmentNotifications />
      {/* Sidebar for Doctor */}
      {role === 'doctor' && (
        <>
          {/* Mobile Overlay */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 z-[40] lg:hidden backdrop-blur-sm"
              />
            )}
          </AnimatePresence>

          <aside className={`
            fixed lg:relative inset-y-0 left-0 z-[50]
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${isSidebarOpen ? 'w-72' : 'lg:w-20'} 
            bg-white border-r clinic-border transition-all duration-300 flex flex-col items-stretch overflow-hidden shadow-xl lg:shadow-sm
          `}>
            <div className="p-6 flex items-center justify-between lg:justify-start gap-3">
              <div className="flex items-center gap-3">
                <div className="min-w-10 h-10 bg-white rounded-xl flex items-center justify-center border clinic-border shadow-sm overflow-hidden p-1">
                  <Logo size={32} />
                </div>
                {(isSidebarOpen || !isSidebarOpen) && <span className={`font-bold text-hc-green text-xl truncate serif ${!isSidebarOpen && 'lg:hidden'}`}>Kayra Admin</span>}
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-lg lg:hidden"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                    activeTab === tab.id 
                      ? 'bg-hc-accent text-hc-green font-semibold shadow-xs' 
                      : 'text-slate-500 hover:bg-hc-accent/30 hover:text-hc-dark'
                  }`}
                >
                  <tab.icon className="w-6 h-6 shrink-0" />
                  {(isSidebarOpen || !isSidebarOpen) && <span className={`text-sm tracking-wide ${!isSidebarOpen && 'lg:hidden'}`}>{tab.label}</span>}
                </button>
              ))}
            </nav>

          <div className="p-4 border-t clinic-border bg-slate-50/50">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-4 p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut className="w-6 h-6 shrink-0" />
              {isSidebarOpen && <span className="font-medium text-sm">Logout Admin</span>}
            </button>
          </div>
        </aside>
      </>
    )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden max-h-screen">
        <header className="h-16 lg:h-20 bg-white border-b clinic-border flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2 lg:gap-4">
            {role === 'doctor' && (
              <>
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg">
                  <Menu className="w-5 h-5 text-slate-500" />
                </button>
                {activeTab !== 'dashboard' && (
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center gap-2 text-hc-green font-bold text-[10px] lg:text-xs bg-hc-accent/50 px-2 lg:px-3 py-1.5 rounded-full hover:bg-hc-accent transition-all"
                  >
                    <ArrowLeft className="w-3 h-3" /> <span className="hidden sm:inline">Back to</span> Dashboard
                  </button>
                )}
              </>
            )}
            <h2 className="text-lg lg:text-xl font-bold capitalize text-hc-dark serif truncate max-w-[120px] sm:max-w-none">
              {role === 'patient' ? "Patient Portal" : activeTab.replace("-", " ")}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="bg-amber-50 px-2 py-1 border border-amber-200 rounded text-amber-700 text-[9px] lg:text-xs font-medium hidden sm:flex items-center gap-2">
              <Globe className="w-3 h-3" />
              <span>Portal: Active</span>
            </div>
            {role === 'doctor' && (
              <div className="flex items-center gap-2 lg:gap-3 lg:pl-4 lg:border-l clinic-border">
                <div className="text-right hidden sm:block">
                  <p className="text-xs lg:text-sm font-semibold text-hc-dark">{currentDoctor?.name || "Practitioner"}</p>
                  <p className="text-[8px] lg:text-[10px] text-slate-400 uppercase tracking-widest font-bold">{currentDoctor?.specialization || "Specialist"}</p>
                </div>
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-hc-green flex items-center justify-center text-white font-bold text-sm lg:text-base serif">
                  {currentDoctor?.name.split(" ").map(n => n[0]).join("").slice(0, 2) || "HC"}
                </div>
              </div>
            )}
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar bg-hc-light/50">
          <React.Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            {role === 'doctor' ? (
              <>
                {activeTab === "dashboard" && <DoctorDashboard onNavigate={setActiveTab} />}
                {activeTab === "patients" && <PatientManager />}
                {activeTab === "case-taking" && <CaseTaking />}
                {activeTab === "repertory" && <RepertoryBrowser />}
                {activeTab === "materia-medica" && <MateriaMedica />}
                {activeTab === "appointments" && <AppointmentManager />}
                {activeTab === "prescription" && <PrescriptionPad />}
                {activeTab === "video" && <VideoConsultation role="doctor" />}
                {activeTab === "stock" && <InventoryManager />}
                {activeTab === "billing" && <BillingManager />}
                {activeTab === "practitioners" && <PractitionerTeam />}
              </>
            ) : (
              <PatientPortal onBack={logout} />
            )}
          </React.Suspense>
        </section>
      </main>
    </div>
  );
}
