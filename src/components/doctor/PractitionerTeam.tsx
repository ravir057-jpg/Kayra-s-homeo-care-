import React, { useState } from "react";
import { Users, Search, Mail, Phone, MapPin, Award, Calendar, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { db } from "../../lib/db";
import { Doctor } from "../../types";

export default function PractitionerTeam() {
  const [doctors] = useState<Doctor[]>(db.get<Doctor[]>('doctors') || []);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-hc-dark serif">Practitioner Network</h1>
          <p className="text-slate-500">Collaborating with {doctors.length} verified homeopathic specialists.</p>
        </div>
        <div className="flex items-center gap-3 bg-hc-accent/30 px-4 py-2 rounded-full border border-hc-green/10">
          <Sparkles className="w-5 h-5 text-hc-green" />
          <span className="text-sm font-bold text-hc-green">{doctors.length} Doctors Live</span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search practitioners by name, specialization, or location..."
          className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-hc-green/20 focus:border-hc-green transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDoctors.map((doctor, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            key={doctor.id}
            className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all p-8 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-hc-accent/20 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 bg-hc-green rounded-2xl flex items-center justify-center text-white text-2xl font-bold serif">
                  {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  <Award className="w-3 h-3" /> Verified
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-hc-dark serif">{doctor.name}</h3>
                <p className="text-hc-green font-semibold text-sm">{doctor.specialization}</p>
              </div>

              <div className="space-y-3 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{doctor.experience} Years Experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{doctor.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{doctor.email}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-hc-dark font-bold">
                    <Phone className="w-4 h-4 text-hc-green" />
                    <span>{doctor.phone}</span>
                 </div>
                 <button className="text-[10px] font-black uppercase tracking-widest text-hc-green hover:underline">View Profile</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
          <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400">No practitioners found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your search query.</p>
        </div>
      )}
    </div>
  );
}
