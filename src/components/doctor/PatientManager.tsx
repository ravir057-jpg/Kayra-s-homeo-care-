import React, { useState } from "react";
import { Search, Plus, UserPlus, Phone, MapPin, Calendar, Trash2, Users, History, FileText, Activity, Clock, ChevronRight, X, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/db";
import { Patient, Appointment, Prescription, CallSession } from "../../types";

export default function PatientManager() {
  const [patients, setPatients] = useState<Patient[]>(db.get<Patient[]>('patients') || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    gender: 'Male',
    address: 'Jehanabad'
  });

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.phone.includes(searchQuery) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    const id = `P${String(patients.length + 1).padStart(3, '0')}`;
    const patient: Patient = {
      ...newPatient as Patient,
      id,
      createdAt: new Date().toISOString()
    };
    const updated = [patient, ...patients];
    setPatients(updated);
    db.set('patients', updated);
    setShowAddModal(false);
    setNewPatient({ gender: 'Male', address: 'Jehanabad' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this patient record?")) {
      const updated = patients.filter(p => p.id !== id);
      setPatients(updated);
      db.set('patients', updated);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 line-clamp-1">Patient Management</h1>
          <p className="text-gray-500">Search and manage patient medical records.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
        >
          <UserPlus className="w-5 h-5" /> Add New Patient
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search by Name, Phone or Patient ID..."
          className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto -mx-4 lg:mx-0">
        <div className="inline-block min-w-full align-middle p-4 lg:p-0">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Patient ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Added On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPatients.map((patient) => (
                <tr 
                  key={patient.id} 
                  className="hover:bg-gray-50 transition-colors group cursor-pointer"
                  onClick={() => setSelectedPatientId(patient.id)}
                >
                  <td className="px-6 py-4">
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-mono font-bold text-sm">
                      {patient.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-500">{patient.age} yrs • {patient.gender}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{patient.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{patient.address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatientId(patient.id);
                        }}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                        title="View History"
                      >
                        <History className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(patient.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Record"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    No patients found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* Add Patient Modal */}
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
                <h3 className="text-xl font-bold text-gray-900">Add New Patient</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <Plus className="w-6 h-6 rotate-45 text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Full Name</label>
                    <input 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      placeholder="Enter patient name"
                      value={newPatient.name || ""}
                      onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Age</label>
                    <input 
                      type="number"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      placeholder="Age"
                      value={newPatient.age || ""}
                      onChange={(e) => setNewPatient({ ...newPatient, age: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Gender</label>
                    <select 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as any })}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Phone Number</label>
                    <input 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      placeholder="Contact number"
                      value={newPatient.phone || ""}
                      onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Address / Village</label>
                    <input 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      placeholder="Jehanabad, Bihar"
                      value={newPatient.address || ""}
                      onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                    />
                  </div>
                </div>
                <button 
                  onClick={handleAdd}
                  disabled={!newPatient.name || !newPatient.phone}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl mt-4 hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Register Patient
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <PatientHistoryModal 
        patientId={selectedPatientId} 
        onClose={() => setSelectedPatientId(null)} 
      />
    </div>
  );
}

function PatientHistoryModal({ patientId, onClose }: { patientId: string | null, onClose: () => void }) {
  const patient = db.get<Patient[]>('patients')?.find(p => p.id === patientId);
  const appointments = (db.get<Appointment[]>('appointments') || []).filter(a => a.patientId === patientId).sort((a,b) => b.date.localeCompare(a.date));
  const prescriptions = (db.get<Prescription[]>('prescriptions') || []).filter(p => p.patientId === patientId).sort((a,b) => b.date.localeCompare(a.date));
  const callSessions = (db.get<CallSession[]>('call_sessions') || []).filter(s => s.patientId === patientId).sort((a,b) => b.startedAt.localeCompare(a.startedAt));

  const [activeTab, setActiveTab] = useState<'prescriptions' | 'appointments' | 'consultations'>('prescriptions');

  if (!patientId || !patient) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="p-8 bg-emerald-900 text-white flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/10 shadow-inner">
                <span className="text-3xl font-serif text-white">{patient.name[0]}</span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-3xl font-bold font-serif">{patient.name}</h2>
                  <span className="bg-emerald-500/30 text-emerald-100 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-emerald-400/20">
                    {patient.id}
                  </span>
                </div>
                <p className="text-emerald-100/70 font-medium">{patient.age} years • {patient.gender} • {patient.address}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="relative z-10 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group"
            >
              <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-gray-50/50 border-b border-gray-100 px-8 flex gap-8">
            {[
              { id: 'prescriptions', label: 'Prescriptions', icon: FileText, count: prescriptions.length },
              { id: 'appointments', label: 'Appointments', icon: Calendar, count: appointments.length },
              { id: 'consultations', label: 'Consultations', icon: Activity, count: callSessions.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 flex items-center gap-2 border-b-2 transition-all relative ${
                  activeTab === tab.id 
                    ? 'border-emerald-600 text-emerald-700 font-bold' 
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
            {activeTab === 'prescriptions' && (
              <div className="space-y-6">
                {prescriptions.length > 0 ? prescriptions.map(rx => (
                  <div key={rx.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{rx.id}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-sm font-bold text-gray-900">{new Date(rx.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-1">{rx.diagnosis || "General Consultation"}</h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${rx.isPaid ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        {rx.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-gray-50">
                      <p className="text-xs text-gray-500 italic flex gap-2">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                        "{rx.complaints}"
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {rx.medicines.map((m, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-200">
                            {m.medicineName} • {m.dosage}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )) : (
                  <EmptyState text="No prescriptions found for this patient." icon={FileText} />
                )}
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="space-y-4">
                {appointments.length > 0 ? appointments.map(app => (
                  <div key={app.id} className="bg-white rounded-2xl p-5 border border-gray-50 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-6">
                      <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <p className="font-bold text-gray-900">{new Date(app.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                           <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                             app.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                             app.status === 'Cancelled' ? 'bg-red-100 text-red-700 border-red-200' : 
                             'bg-blue-100 text-blue-700 border-blue-200'
                           }`}>
                             {app.status}
                           </span>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <Clock className="w-3 h-3" /> {app.time} • {app.type} Visit
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                )) : (
                  <EmptyState text="No appointments on record." icon={Calendar} />
                )}
              </div>
            )}

            {activeTab === 'consultations' && (
              <div className="space-y-4">
                {callSessions.length > 0 ? callSessions.map(session => (
                  <div key={session.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                          <Activity className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Virtual Consultation</p>
                          <p className="text-xs text-gray-500">
                            {new Date(session.startedAt).toLocaleDateString()} • {Math.floor((session.duration || 0) / 60)}m {(session.duration || 0) % 60}s
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-1 rounded-lg">Ended</span>
                    </div>
                    {session.notes && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Clinical Notes</p>
                        <p className="text-sm text-gray-700 leading-relaxed italic">"{session.notes}"</p>
                      </div>
                    )}
                  </div>
                )) : (
                  <EmptyState text="No video consultations found." icon={Activity} />
                )}
              </div>
            )}
          </div>

          {/* Footer Information */}
          <div className="p-6 bg-white border-t border-gray-100 text-center">
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Digital Health Record • Dr. Ravi Raj Homeopathic Clinic
             </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function EmptyState({ text, icon: Icon }: { text: string, icon: any }) {
  return (
    <div className="py-20 text-center text-gray-400 flex flex-col items-center">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 opacity-10" />
      </div>
      <p className="font-medium max-w-xs">{text}</p>
    </div>
  );
}
