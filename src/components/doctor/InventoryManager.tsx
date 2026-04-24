import React, { useState } from "react";
import { Search, Package, Plus, AlertCircle, Edit2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/db";
import { Medicine } from "../../types";

export default function InventoryManager() {
  const [inventory, setInventory] = useState<Medicine[]>(db.get<Medicine[]>('inventory') || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [newMedicine, setNewMedicine] = useState<Partial<Medicine>>({
    potency: '30C',
    unit: 'ml',
    stock: 0,
    price: 0
  });

  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.potency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    const id = `M${String(inventory.length + 1).padStart(3, '0')}`;
    const item: Medicine = {
      ...newMedicine as Medicine,
      id
    };
    const updated = [...inventory, item];
    setInventory(updated);
    db.set('inventory', updated);
    setShowAddModal(false);
    setNewMedicine({ potency: '30C', unit: 'ml', stock: 0, price: 0 });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicine Stock</h1>
          <p className="text-gray-500">Track and manage homeopathic medicine inventory.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-5 h-5" /> Add Medicine
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search medicines by name or potency..."
          className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <motion.div 
            layout
            key={item.id}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className={`absolute top-0 left-0 w-2 h-full ${item.stock < 10 ? 'bg-red-500' : 'bg-emerald-500'} opacity-50`}></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase">
                  {item.potency}
                </span>
              </div>
              <p className="text-xl font-bold text-emerald-700">₹{item.price}</p>
            </div>
            
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <Package className={`w-5 h-5 ${item.stock < 10 ? 'text-red-500' : 'text-gray-400'}`} />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Available Stock</p>
                  <p className={`font-bold ${item.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                    {item.stock} {item.unit}
                  </p>
                </div>
              </div>
              {item.stock < 10 && (
                <div className="flex items-center gap-1 text-red-500 font-bold text-xs animate-pulse">
                  <AlertCircle className="w-4 h-4" /> LOW
                </div>
              )}
            </div>

            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button className="p-2 bg-gray-50 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-lg transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
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
                <h3 className="text-xl font-bold text-gray-900">Add New Stock</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <Plus className="w-6 h-6 rotate-45 text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Medicine Name</label>
                  <input 
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500/20" 
                    placeholder="e.g. Arnica Montana"
                    value={newMedicine.name || ""}
                    onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Potency</label>
                    <input 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      placeholder="e.g. 30C"
                      value={newMedicine.potency || ""}
                      onChange={(e) => setNewMedicine({ ...newMedicine, potency: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Unit</label>
                    <select 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={newMedicine.unit}
                      onChange={(e) => setNewMedicine({ ...newMedicine, unit: e.target.value as any })}
                    >
                      <option>ml</option>
                      <option>Drops</option>
                      <option>Pills</option>
                      <option>gm</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Initial Quantity</label>
                    <input 
                      type="number"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      placeholder="0"
                      value={newMedicine.stock || ""}
                      onChange={(e) => setNewMedicine({ ...newMedicine, stock: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Price (₹)</label>
                    <input 
                      type="number"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      placeholder="0.00"
                      value={newMedicine.price || ""}
                      onChange={(e) => setNewMedicine({ ...newMedicine, price: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <button 
                  onClick={handleAdd}
                  disabled={!newMedicine.name}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl mt-4 hover:bg-emerald-700 transition-colors"
                >
                  Save to Inventory
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
