import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, User, Bell } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/db";
import { Appointment, Patient } from "../../types";

const REMINDER_OPTIONS = [
  { label: 'None', value: 0 },
  { label: '15 mins before', value: 15 },
  { label: '1 hour before', value: 60 },
  { label: '1 day before', value: 1440 },
];

export default function AppointmentManager() {
  const [appointments, setAppointments] = useState<Appointment[]>(db.get<Appointment[]>('appointments') || []);
  const [patients] = useState<Patient[]>(db.get<Patient[]>('patients') || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [newApp, setNewApp] = useState<Partial<Appointment>>({
    date: selectedDate,
    time: "10:00",
    type: "Regular",
    status: "Pending",
    reminderMinutes: 0
  });

  const dailyAppointments = appointments.filter(a => a.date === selectedDate);

  const handleAdd = () => {
    const patient = patients.find(p => p.id === newApp.patientId);
    if (!patient) return;

    const id = `A${Date.now()}`;
    const appointment: Appointment = {
      ...newApp as Appointment,
      id,
      patientName: patient.name
    };
    const updated = [...appointments, appointment];
    setAppointments(updated);
    db.set('appointments', updated);
    setShowAddModal(false);
  };

  const updateStatus = (id: string, status: 'Completed' | 'Cancelled') => {
    const updated = appointments.map(a => a.id === id ? { ...a, status } : a);
    setAppointments(updated);
    db.set('appointments', updated);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clinic Schedule</h1>
          <p className="text-gray-500">Manage patient visits and digital queue.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-5 h-5" /> Book Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Picker Mock */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="font-bold text-gray-900">April 2026</h3>
            <div className="flex gap-2">
              <button className="p-1.5 hover:bg-gray-50 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
              <button className="p-1.5 hover:bg-gray-50 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 mb-4">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 30 }).map((_, i) => {
              const day = (i + 1).toString().padStart(2, '0');
              const fullDate = `2026-04-${day}`;
              const isSelected = selectedDate === fullDate;
              const hasAppts = appointments.some(a => a.date === fullDate);

              return (
                <button 
                  key={i}
                  onClick={() => setSelectedDate(fullDate)}
                  className={`h-10 rounded-xl flex items-center justify-center relative transition-all ${
                    isSelected 
                      ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/30' 
                      : 'hover:bg-emerald-50 text-gray-600'
                  }`}
                >
                  {i + 1}
                  {hasAppts && !isSelected && <div className="absolute bottom-1 w-1 h-1 bg-emerald-400 rounded-full"></div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily Schedule */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-emerald-900 text-white">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-emerald-300" />
              <h3 className="font-bold">{new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
            </div>
            <span className="text-emerald-300 text-xs font-bold uppercase tracking-widest">{dailyAppointments.length} Visits</span>
          </div>
          <div className="flex-1 divide-y divide-gray-50">
            {dailyAppointments.length > 0 ? (
              dailyAppointments.sort((a, b) => a.time.localeCompare(b.time)).map((app) => (
                <div key={app.id} className="p-6 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-xl min-w-[70px] border border-gray-100 relative transition-all">
                      <Clock className={`w-3.5 h-3.5 mb-1 ${app.reminderMinutes ? 'text-amber-500' : 'text-gray-400'}`} />
                      <span className="font-bold text-gray-900">{app.time}</span>
                      {app.reminderMinutes && app.status === 'Pending' && (
                        <div className="absolute -top-1 -right-1">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight text-lg">{app.patientName}</h4>
                        {app.reminderMinutes ? (
                          <span className="bg-amber-100 text-amber-700 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest flex items-center gap-1 border border-amber-200">
                             <Bell className="w-2 h-2" /> {app.reminderMinutes}M Alert
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Type: <span className="text-emerald-600">{app.type}</span> • ID: {app.patientId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.status === 'Pending' ? (
                      <>
                        <button 
                          onClick={() => updateStatus(app.id, 'Cancelled')}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => updateStatus(app.id, 'Completed')}
                          className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-sm font-bold transition-all"
                        >
                          Mark Completed
                        </button>
                      </>
                    ) : (
                      <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                        app.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {app.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <CalendarIcon className="w-10 h-10 opacity-20" />
                </div>
                <p className="font-medium">No appointments scheduled for this day.</p>
                <button onClick={() => setShowAddModal(true)} className="mt-4 text-emerald-600 text-sm font-bold hover:underline">Click to schedule one</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">New Appointment</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <Plus className="w-6 h-6 rotate-45 text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Patient</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={newApp.patientId || ""}
                    onChange={(e) => setNewApp({ ...newApp, patientId: e.target.value })}
                  >
                    <option value="">Select patient...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Date</label>
                    <input 
                      type="date"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={newApp.date}
                      onChange={(e) => setNewApp({ ...newApp, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Time</label>
                    <input 
                      type="time"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={newApp.time}
                      onChange={(e) => setNewApp({ ...newApp, time: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Visit Type</label>
                  <div className="flex gap-2">
                    {['Regular', 'Follow-up', 'Emergency'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setNewApp({ ...newApp, type: type as any })}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${
                          newApp.type === type ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Set Reminder</label>
                  <div className="grid grid-cols-2 gap-2">
                    {REMINDER_OPTIONS.map(opt => (
                      <button 
                        key={opt.value}
                        onClick={() => setNewApp({ ...newApp, reminderMinutes: opt.value })}
                        className={`py-3 rounded-xl text-[10px] font-bold transition-all border flex items-center justify-center gap-2 ${
                          newApp.reminderMinutes === opt.value 
                            ? 'bg-hc-dark text-white border-hc-dark shadow-hc-dark/20 shadow-lg' 
                            : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        {opt.value > 0 ? <Bell className="w-3 h-3" /> : null}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={handleAdd}
                  disabled={!newApp.patientId}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl mt-4 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  Schedule Appointment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
