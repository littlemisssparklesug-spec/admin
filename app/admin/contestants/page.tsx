"use client";
import React, { useState, useEffect } from 'react';
import { db, storage } from "../../libs/firebase"; 
import { 
  collection, addDoc, serverTimestamp, onSnapshot, query, 
  orderBy, doc, updateDoc, deleteDoc, writeBatch 
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { 
  Loader2, User, Sparkles, School, Music, History, 
  Trophy, Heart, Layers, Edit3, Trash2, LayoutDashboard, 
  PlusCircle, Timer, CheckCircle, Quote, Palette, Image as ImageIcon
} from 'lucide-react';
import Image from 'next/image';

export default function AdminDashboard() {
  const [view, setView] = useState<'register' | 'manage'>('manage');
  const [loading, setLoading] = useState(false);
  const [contestants, setContestants] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [file, setFile] = useState<File | null>(null); // Main Profile
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null); // Gallery Images
  
  const [formData, setFormData] = useState({
    name: '', school: '', talent: '', age: '', bio: '', quote: '',
    category: '', achievements: '', hobbies: '', startTime: '', endTime: '',
  });

  useEffect(() => {
    const q = query(collection(db, "voting"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setContestants(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  // Upload helper for multiple files
  const uploadGallery = async (files: FileList) => {
    const urls = [];
    for (let i = 0; i < files.length; i++) {
      const storageRef = ref(storage, `gallery/${Date.now()}_${files[i].name}`);
      const snap = await uploadBytesResumable(storageRef, files[i]);
      const url = await getDownloadURL(snap.ref);
      urls.push(url);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const currentContestant = contestants.find(c => c.id === editingId);
      
      // 1. Handle Main Profile Image
      let imageUrl = currentContestant?.image || "";
      if (file) {
        const storageRef = ref(storage, `profiles/${Date.now()}_${file.name}`);
        const uploadTask = await uploadBytesResumable(storageRef, file);
        imageUrl = await getDownloadURL(uploadTask.ref);
      }

      // 2. Handle Gallery Images
      let galleryUrls = currentContestant?.gallery || [];
      if (galleryFiles) {
        const newUrls = await uploadGallery(galleryFiles);
        galleryUrls = [...galleryUrls, ...newUrls]; // Append new photos to existing
      }

      const dataToSave = {
        ...formData,
        age: Number(formData.age),
        image: imageUrl,
        gallery: galleryUrls,
        achievements: formData.achievements.split(',').map(i => i.trim()).filter(i => i !== ""),
        hobbies: formData.hobbies.split(',').map(i => i.trim()).filter(i => i !== ""),
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "voting", editingId), dataToSave);
      } else {
        await addDoc(collection(db, "voting"), { ...dataToSave, votes: 0, createdAt: serverTimestamp() });
      }
      resetForm();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally { setLoading(false); }
  };

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setFormData({
      name: c.name, school: c.school, talent: c.talent, age: c.age.toString(),
      bio: c.bio, quote: c.quote || '', category: c.category,
      achievements: c.achievements ? c.achievements.join(', ') : '',
      hobbies: c.hobbies ? c.hobbies.join(', ') : '',
      startTime: c.startTime ? new Date(c.startTime.seconds * 1000).toISOString().slice(0, 16) : '',
      endTime: c.endTime ? new Date(c.endTime.seconds * 1000).toISOString().slice(0, 16) : '',
    });
    setView('register');
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '', school: '', talent: '', age: '', bio: '', quote: '',
      category: '', achievements: '', hobbies: '', startTime: '', endTime: '',
    });
    setFile(null);
    setGalleryFiles(null);
    setView('manage');
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-24">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        
        {/* NAV */}
        <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-100 mb-8 sticky top-4 z-[100]">
          <button onClick={() => setView('manage')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${view === 'manage' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
            <LayoutDashboard size={18} /> Manage
          </button>
          <button onClick={() => { resetForm(); setView('register'); }} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${view === 'register' ? 'bg-pink-500 text-white' : 'text-slate-500'}`}>
            <PlusCircle size={18} /> {editingId ? 'Edit Profile' : 'Add Queen'}
          </button>
        </div>

        {view === 'manage' ? (
          <div className="space-y-4">
             {/* ... (Keep your existing Manage List mapping here) ... */}
             {contestants.map(c => (
              <div key={c.id} className="bg-white p-4 rounded-[2rem] border border-slate-100 flex items-center gap-4 shadow-sm">
                <div className="w-16 h-16 relative rounded-2xl overflow-hidden shrink-0"><Image src={c.image} alt="" fill className="object-cover" /></div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{c.name}</h3>
                  <p className="text-[10px] font-black text-pink-500 uppercase">{c.category}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(c)} className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Edit3 size={18} /></button>
                  <button onClick={() => { if(confirm("Delete?")) deleteDoc(doc(db, "voting", c.id)); }} className="p-3 bg-red-50 text-red-600 rounded-xl"><Trash2 size={18} /></button>
                </div>
              </div>
             ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-pink-50 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
              
              {/* Category & Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Event Category" icon={<Layers size={18}/>} placeholder="Miss Sparkles 2026" value={formData.category} onChange={(v: string) => setFormData({...formData, category: v})} />
                <FormInput label="Full Name" icon={<User size={18}/>} placeholder="Enter name" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} />
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormInput label="Age" type="number" icon={<History size={18}/>} value={formData.age} onChange={(v: string) => setFormData({...formData, age: v})} />
                <FormInput label="School" icon={<School size={18}/>} value={formData.school} onChange={(v: string) => setFormData({...formData, school: v})} />
                <div className="col-span-2">
                  <FormInput label="Main Talent" icon={<Music size={18}/>} value={formData.talent} onChange={(v: string) => setFormData({...formData, talent: v})} />
                </div>
              </div>

              {/* Achievement & Hobbies (Comma Separated) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Achievements (comma separated)" icon={<Trophy size={18}/>} placeholder="Best Orator, Class Lead" value={formData.achievements} onChange={(v: string) => setFormData({...formData, achievements: v})} />
                <FormInput label="Hobbies (comma separated)" icon={<Palette size={18}/>} placeholder="Reading, Swimming" value={formData.hobbies} onChange={(v: string) => setFormData({...formData, hobbies: v})} />
              </div>

              {/* Timing */}
              <div className="bg-slate-900 rounded-[2rem] p-6 text-white grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Start Voting</label>
                  <input required type="datetime-local" className="w-full p-4 rounded-xl bg-slate-800 border-0 text-sm font-bold ring-1 ring-slate-700 outline-none focus:ring-2 focus:ring-pink-500" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2">End Voting</label>
                  <input required type="datetime-local" className="w-full p-4 rounded-xl bg-slate-800 border-0 text-sm font-bold ring-1 ring-slate-700 outline-none focus:ring-2 focus:ring-pink-500" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
                </div>
              </div>

              {/* Quote & Bio */}
              <div className="space-y-4">
                <FormInput label="Personal Quote" icon={<Quote size={18}/>} placeholder="The future belongs to those who..." value={formData.quote} onChange={(v: string) => setFormData({...formData, quote: v})} />
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-3">Biography</label>
                  <textarea required placeholder="Write bio..." className="w-full p-6 rounded-3xl bg-slate-50 border-0 ring-1 ring-slate-100 outline-none focus:ring-2 ring-pink-500 text-sm min-h-[120px]" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
                </div>
              </div>

              {/* Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-pink-50/50 rounded-3xl border border-pink-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-pink-600 uppercase ml-3">Main Profile Photo</label>
                  <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full p-3 rounded-xl border-2 border-dashed border-pink-200 text-xs bg-white font-bold text-slate-400" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-pink-600 uppercase ml-3">Add to Gallery (Multiple)</label>
                  <input type="file" multiple onChange={(e) => setGalleryFiles(e.target.files)} className="w-full p-3 rounded-xl border-2 border-dashed border-pink-200 text-xs bg-white font-bold text-slate-400" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {editingId && <button type="button" onClick={resetForm} className="flex-1 bg-slate-100 py-5 rounded-2xl font-black text-slate-400 uppercase tracking-widest">Cancel</button>}
                <button type="submit" disabled={loading} className="flex-[2] bg-pink-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-pink-100 hover:bg-pink-600 transition-all flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="animate-spin" /> : editingId ? "UPDATE PROFILE" : "PUBLISH QUEEN"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const FormInput = ({ label, icon, type = "text", placeholder, value, onChange }: any) => (
  <div className="space-y-1 flex-1">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>
      <input required type={type} placeholder={placeholder} className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-0 ring-1 ring-slate-100 focus:ring-2 ring-pink-500 outline-none font-bold text-slate-700 text-sm transition-all" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  </div>
);