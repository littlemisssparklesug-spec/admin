"use client";
import React, { useState, useEffect } from 'react';
import { db } from "../../libs/firebase"; 
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { Loader2, Trash2, Edit3, CheckCircle, XCircle } from "lucide-react";

export default function AdminPrograms() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    stepOrder: '',
    title: '',
    subtitle: '',
    description: '',
  });

  useEffect(() => {
    const q = query(collection(db, "programs"), orderBy("stepOrder", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        stepOrder: Number(formData.stepOrder),
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "programs", editingId), payload);
        alert("Program step updated!");
      } else {
        await addDoc(collection(db, "programs"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        alert("New step added!");
      }
      resetForm();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this step?")) return;
    await deleteDoc(doc(db, "programs", id));
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      stepOrder: item.stepOrder.toString(),
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ stepOrder: '', title: '', subtitle: '', description: '' });
  };

  // Shared class for all inputs to ensure they are black and visible
  const inputStyles = "w-full bg-slate-100 border-2 border-transparent rounded-xl p-4 text-black font-bold outline-none focus:border-pink-500 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-normal";

  return (
    <main className="min-h-screen bg-[#fffafa] pt-10 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter">
          Program <span className="text-pink-500 italic">Timeline Manager</span>
        </h1>

        {/* Form Container */}
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-pink-100/20 border border-pink-50 mb-12">
          <div className="flex items-center gap-2 mb-6">
             <div className="h-2 w-2 rounded-full bg-pink-500" />
             <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
               {editingId ? "Editing Mode" : "Create New Phase"}
             </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="md:col-span-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 mb-2">Step #</label>
                <input required type="number" value={formData.stepOrder} onChange={(e) => setFormData({...formData, stepOrder: e.target.value})} className={inputStyles} placeholder="1" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 mb-2">Main Title</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className={inputStyles} placeholder="e.g. Registration & Auditions" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 mb-2">Timing (Subtitle)</label>
              <input required type="text" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className={inputStyles} placeholder="e.g. Second Term Holiday" />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 mb-2">Description / Details</label>
              <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className={`${inputStyles} h-32 resize-none`} placeholder="Describe what happens in this stage..." />
            </div>

            <div className="flex gap-4 pt-2">
              <button disabled={loading} type="submit" className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${editingId ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-100' : 'bg-pink-500 hover:bg-pink-600 text-white shadow-pink-100'}`}>
                {loading ? <Loader2 className="animate-spin" /> : <>{editingId ? "Update Changes" : "Publish Step"} <CheckCircle size={16} /></>}
              </button>
              
              {editingId && (
                <button type="button" onClick={resetForm} className="bg-slate-100 text-slate-500 px-8 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all flex items-center gap-2">
                  <XCircle size={16} /> Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List View */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4 mb-4">Current Timeline ({items.length})</h3>
          {items.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-pink-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 font-black text-xl">
                  {item.stepOrder}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 uppercase tracking-tight">{item.title}</h4>
                  <p className="text-xs font-bold text-pink-400 uppercase tracking-widest">{item.subtitle}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(item)} className="p-3 text-slate-400 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-all"><Edit3 size={18} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-3 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}