"use client";

import React, { useEffect, useState } from 'react';
import { db } from "../../libs/firebase"; 
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  deleteDoc, 
  updateDoc 
} from "firebase/firestore";
import { 
  Loader2, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  UserCheck, 
  XCircle,
  Clock
} from "lucide-react";

export default function AdminVolunteers() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, "volunteers"), orderBy("appliedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, "volunteers", id), { status: newStatus });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanentally delete this application?")) return;
    await deleteDoc(doc(db, "volunteers", id));
  };

  const filteredApps = applications.filter(app => 
    filter === 'all' ? true : app.status === filter
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-pink-500" size={40} />
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 pt-10 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
              Volunteer <span className="text-pink-500">Applications</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-2">
              Managing {applications.length} total potential team members
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            {['all', 'pending', 'contacted'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredApps.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-20 text-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest">No applications found in this category</p>
            </div>
          ) : (
            filteredApps.map((app) => (
              <div key={app.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Status & Name */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        app.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                        app.status === 'contacted' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {app.status || 'pending'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-1 text-slate-400 text-[9px] font-bold uppercase">
                        <Calendar size={12} />
                        {app.appliedAt?.toDate().toLocaleDateString()}
                      </div>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase leading-none">{app.fullName}</h2>
                    <div className="inline-block px-4 py-1 bg-pink-50 text-pink-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                      Interested in: {app.areaOfInterest}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="lg:col-span-3 space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                      <Mail size={16} className="text-slate-400" />
                      <a href={`mailto:${app.email}`} className="hover:text-pink-500 transition-colors">{app.email}</a>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                      <Phone size={16} className="text-slate-400" />
                      <a href={`tel:${app.phone}`} className="hover:text-pink-500 transition-colors">{app.phone}</a>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                      <MapPin size={16} className="text-slate-400" />
                      {app.location}
                    </div>
                  </div>

                  {/* Experience/Message */}
                  <div className="lg:col-span-3">
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Message/Experience</label>
                     <p className="text-sm text-black font-bold leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       {app.experience || "No experience details provided."}
                     </p>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-2 flex lg:flex-col gap-2 justify-center">
                    <button 
                      onClick={() => updateStatus(app.id, 'contacted')}
                      className="flex-1 lg:flex-none p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase"
                    >
                      <UserCheck size={16} /> Mark Contacted
                    </button>
                    <button 
                      onClick={() => updateStatus(app.id, 'pending')}
                      className="flex-1 lg:flex-none p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase"
                    >
                      <Clock size={16} /> Revert Pending
                    </button>
                    <button 
                      onClick={() => handleDelete(app.id)}
                      className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}