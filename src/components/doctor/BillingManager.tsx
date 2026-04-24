import React, { useState, useEffect } from "react";
import { CreditCard, Search, Download, CheckCircle, Clock, Filter, AlertCircle, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/db";
import { Prescription, Patient } from "../../types";
import PaymentGateway from "../shared/PaymentGateway";

export default function BillingManager() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(db.get<Prescription[]>('prescriptions') || []);
  const [patients] = useState<Patient[]>(db.get<Patient[]>('patients') || []);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [activePayment, setActivePayment] = useState<{ id: string; amount: number; patientName: string } | null>(null);

  const records = prescriptions.map(p => ({
    ...p,
    patientName: patients.find(pat => pat.id === p.patientId)?.name || "Unknown Patient"
  }));

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'paid' ? r.isPaid : !r.isPaid);
    return matchesSearch && matchesStatus;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const togglePaymentStatus = (id: string) => {
    const updated = prescriptions.map(p => p.id === id ? { ...p, isPaid: !p.isPaid } : p);
    setPrescriptions(updated);
    db.set('prescriptions', updated);
  };

  const totalEarnings = prescriptions.filter(p => p.isPaid).reduce((acc, curr) => acc + curr.amount, 0);
  const outstanding = prescriptions.filter(p => !p.isPaid).reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-900 rounded-[32px] p-8 text-white flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-emerald-300 font-bold uppercase tracking-widest text-xs mb-2">Total Earnings</p>
            <h2 className="text-4xl font-black">₹{totalEarnings.toLocaleString()}</h2>
          </div>
          <CheckCircle className="w-24 h-24 text-white/10 absolute -right-4 -bottom-4" />
        </div>
        <div className="bg-white rounded-[32px] p-8 border border-gray-100 flex items-center justify-between overflow-hidden relative shadow-sm">
          <div className="relative z-10">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Outstanding Dues</p>
            <h2 className="text-4xl font-black text-gray-900">₹{outstanding.toLocaleString()}</h2>
          </div>
          <AlertCircle className="w-24 h-24 text-gray-50 absolute -right-4 -bottom-4" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm shrink-0">
          {(['all', 'unpaid', 'paid'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all capitalize ${
                filterStatus === status ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by Patient Name or RX ID..."
            className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-6 outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 lg:mx-0">
        <div className="inline-block min-w-full align-middle p-4 lg:p-0">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-widest font-bold">
                <th className="px-8 py-5">Record ID</th>
                <th className="px-8 py-5">Patient Name</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded text-sm">{record.id}</span>
                  </td>
                  <td className="px-8 py-6 font-bold text-gray-900">{record.patientName}</td>
                  <td className="px-8 py-6 text-sm text-gray-500">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="px-8 py-6 font-black text-emerald-900">₹{record.amount}</td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                      record.isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
                    }`}>
                      {record.isPaid ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {record.isPaid ? 'PAID' : 'PENDING'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 shrink-0">
                      {!record.isPaid && (
                        <button 
                          onClick={() => setActivePayment({ id: record.id, amount: record.amount, patientName: record.patientName })}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                        >
                          <Zap className="w-3.5 h-3.5" /> Pay Now
                        </button>
                      )}
                      <button 
                        onClick={() => togglePaymentStatus(record.id)}
                        className={`p-2 rounded-xl transition-all font-bold text-xs ${
                          record.isPaid ? 'text-orange-600 hover:bg-orange-50' : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {record.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    No billing records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      <AnimatePresence>
        {activePayment && (
          <PaymentGateway 
            amount={activePayment.amount}
            patientName={activePayment.patientName}
            onSuccess={() => {
              togglePaymentStatus(activePayment.id);
              setActivePayment(null);
            }}
            onCancel={() => setActivePayment(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
