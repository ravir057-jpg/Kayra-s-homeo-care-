import React from "react";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  Stethoscope, 
  Video,
  ArrowUpRight,
  TrendingDown,
  FileText,
  Play
} from "lucide-react";
import { motion } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { db } from "../../lib/db";
import { Patient, Appointment, Medicine, Prescription } from "../../types";

interface Props {
  onNavigate: (tab: string) => void;
}

export default function DoctorDashboard({ onNavigate }: Props) {
  const patients = db.get<Patient[]>('patients') || [];
  const appointments = db.get<Appointment[]>('appointments') || [];
  const inventory = db.get<Medicine[]>('inventory') || [];
  const lowStock = inventory.filter(m => m.stock < 10);
  const lowStockCount = lowStock.length;
  
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === today);
  const prescriptions = db.get<Prescription[]>('prescriptions') || [];
  const todayBilling = prescriptions
    .filter(p => p.date.split('T')[0] === today)
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const revenueData = [
    { name: 'Mon', value: 2400 },
    { name: 'Tue', value: 3100 },
    { name: 'Wed', value: 2800 },
    { name: 'Thu', value: 4250 },
    { name: 'Fri', value: 3800 },
    { name: 'Sat', value: 4800 },
    { name: 'Sun', value: 2100 },
  ];

  const patientGrowthData = [
    { name: 'Jan', value: 45 },
    { name: 'Feb', value: 52 },
    { name: 'Mar', value: 48 },
    { name: 'Apr', value: 61 },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-hc-dark serif">Kayra Health Dashboard</h1>
        <p className="text-sm text-slate-500">Managing global consultations and clinic excellence.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card group">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Today's Patients / आज के रोगी</p>
            <div className="p-2 bg-hc-accent rounded-lg text-hc-green group-hover:scale-110 transition-transform"><Users className="w-4 h-4" /></div>
          </div>
          <p className="serif text-4xl font-bold mt-2">{todayAppointments.length}</p>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" /> +3 from yesterday
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card group">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Case Records</p>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:scale-110 transition-transform"><Clock className="w-4 h-4" /></div>
          </div>
          <p className="serif text-4xl font-bold mt-2">{patients.length}</p>
          <div className="text-[10px] text-blue-600 font-bold mt-2">Comprehensive Digital History</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card group">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Stock Alerts</p>
            <div className="p-2 bg-red-50 rounded-lg text-red-600 group-hover:scale-110 transition-transform"><AlertCircle className="w-4 h-4" /></div>
          </div>
          <p className="serif text-4xl font-bold mt-2">{lowStockCount}</p>
          <div className="text-[10px] text-red-600 font-bold mt-2">Medicines below threshold</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card group">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Today's Billing</p>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 font-bold text-xs group-hover:scale-110 transition-transform">₹</div>
          </div>
          <p className="serif text-4xl font-bold mt-2">₹{todayBilling.toLocaleString()}</p>
          <div className="text-[10px] text-emerald-600 font-bold mt-2">Real-time Revenue Path</div>
        </motion.div>
      </div>

      {/* Featured Clinical Video Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-hc-dark rounded-[40px] p-8 text-white relative overflow-hidden group shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-hc-green/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-hc-green text-white text-[10px] font-black uppercase tracking-widest rounded-full">
               <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
               New Training Live
            </div>
            <h3 className="serif text-4xl lg:text-5xl font-bold leading-tight">Mastering Chronic <br/>Case Taking</h3>
            <p className="text-hc-accent/70 text-sm leading-relaxed max-w-md">Discover advanced anamnesis protocols for deep-seated chronic pathologies. Our latest session explores miasmatic layers in respiratory cases.</p>
            <div className="flex gap-4 items-center">
              <button 
                onClick={() => onNavigate('video')}
                className="px-8 py-4 bg-hc-green text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-hc-green transition-all shadow-xl shadow-hc-green/20"
              >
                Watch Session
              </button>
              <div className="flex items-center gap-3 text-hc-accent/50 text-[10px] font-black uppercase tracking-tighter">
                 <Clock className="w-4 h-4" /> 45 Mins Training
              </div>
            </div>
          </div>
          <div className="relative group cursor-pointer" onClick={() => onNavigate('video')}>
            <div className="aspect-video bg-hc-light/5 rounded-[32px] border border-white/10 overflow-hidden relative shadow-2xl transition-all group-hover:scale-[1.02]">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&q=80&w=800" 
                alt="Clinical Training" 
                className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white text-hc-dark rounded-full flex items-center justify-center shadow-2xl group-hover:bg-hc-green group-hover:text-white transition-all transform group-hover:rotate-12">
                   <Play className="w-8 h-8 ml-1" />
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-hc-accent">Live Archive • Dr. Ravi Raj</span>
                 </div>
                 <div className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] font-bold">10:24</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Action Callout */}
          <div className="stat-card bg-hc-dark p-8 relative overflow-hidden flex-row items-center border-none shadow-xl group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
              <h3 className="text-3xl font-bold text-white serif">New Prescription</h3>
              <p className="text-hc-accent/70 max-w-md text-sm">Launch the digital clinical cockpit with Gemini-assisted remedy matching to treat patients with precision.</p>
              <button 
                onClick={() => onNavigate('prescription')}
                className="bg-white text-hc-dark px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-hc-accent transition-all transform active:scale-95 shadow-lg"
              >
                Launch Pad <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <Stethoscope className="w-48 h-48 text-white/5 absolute -right-8 -bottom-12 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>

        {/* Revenue Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-hc-green/10 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-xl font-bold text-hc-dark serif">Revenue Analytics</h4>
              <p className="text-xs text-slate-500">Weekly clinic revenue breakdown</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                <ArrowUpRight className="w-3 h-3" /> 18% Increase
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(value) => `₹${value/1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#2d6a4f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:col-span-2">
            <div className="stat-card group cursor-pointer hover:border-hc-green/30" onClick={() => onNavigate('video')}>
              <div className="p-4 bg-slate-900 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-hc-dark mb-2 serif">Video Consultation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Secure, encrypted HD video consultations for remote healing sessions.</p>
            </div>

            <div className="stat-card group cursor-pointer hover:border-hc-green/30" onClick={() => onNavigate('appointments')}>
              <div className="p-4 bg-hc-accent rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-hc-green" />
              </div>
              <h4 className="text-xl font-bold text-hc-dark mb-2 serif">Appointment Hub</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Manage your daily clinic flow and schedule with ease.</p>
            </div>
          </div>
        </div>

        {/* 3rd Column: Health History & AI */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Recent Clinical Activity
            </h3>
            <div className="space-y-4">
              {prescriptions.slice(0, 3).map((px, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-sm group cursor-pointer" onClick={() => onNavigate('patients')}>
                  <div className="w-8 h-8 bg-hc-green text-white rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-hc-dark">Prescription for {px.patientId}</p>
                    <p className="text-[10px] text-slate-500">{new Date(px.date).toLocaleDateString()} • {px.diagnosis}</p>
                  </div>
                </div>
              ))}
              {todayAppointments.slice(0, 2).map((app, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-hc-accent/20 rounded-2xl border border-hc-green/5 transition-all hover:bg-white hover:shadow-sm group cursor-pointer" onClick={() => onNavigate('appointments')}>
                  <div className="w-8 h-8 bg-hc-accent text-hc-green rounded-lg flex items-center justify-center shrink-0 border border-hc-green/10">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-hc-dark">Appointment with {app.patientName}</p>
                    <p className="text-[10px] text-slate-500">{app.time} • {app.type}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => onNavigate('patients')}
              className="w-full mt-4 py-2 text-[10px] font-black text-hc-green uppercase tracking-widest hover:bg-hc-accent/30 rounded-xl transition-all"
            >
              View Full History
            </button>
          </div>

          {/* AI Panel */}
          <div className="ai-panel relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
            <div className="relative space-y-8 flex-1 flex flex-col h-full">
              <div className="flex items-center gap-3">
                <span className="bg-white text-hc-green w-6 h-6 rounded flex items-center justify-center font-bold text-xs">AI</span>
                <h3 className="serif font-bold text-xl text-white">Gemini Clinical Copilot</h3>
              </div>
              
              <div className="space-y-6 flex-1 pr-2 custom-scrollbar-white overflow-y-auto">
                <div className="bg-white/10 p-4 rounded-xl border border-white/5 space-y-2 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-hc-accent opacity-70">Repertory Analysis</p>
                  <p className="text-xs leading-relaxed">Analyzed symptoms for <span className="font-bold">#P-2401</span>. Recommended: <span className="font-bold">Silicea 200C</span> due to cold intolerance and characteristic perspiration.</p>
                </div>

                <div className="bg-white/10 p-4 rounded-xl border border-white/5 space-y-2 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-hc-accent opacity-70">Clinic Margin Insights</p>
                  <div className="space-y-4">
                    <div className="h-24 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#d8f3dc" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#d8f3dc" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="value" stroke="#d8f3dc" fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Revenue Trend</span>
                      <span className="text-emerald-400 font-bold">+12.4%</span>
                    </div>
                  </div>
                </div>

                {lowStock.length > 0 && (
                  <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Inventory Alert</p>
                    </div>
                    <div className="space-y-2">
                      {lowStock.slice(0, 2).map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-red-100">{item.name}</span>
                          <span className="font-bold text-red-400">{item.stock} {item.unit} left</span>
                        </div>
                      ))}
                      {lowStock.length > 2 && (
                        <p className="text-[10px] text-red-400/50 italic">+ {lowStock.length - 2} more items reaching terminal stock</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button className="mt-auto w-full py-4 bg-white text-hc-dark font-bold rounded-xl text-sm hover:bg-hc-accent transition-all transform active:scale-95 shadow-xl">
                Launch Clinical Audit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
