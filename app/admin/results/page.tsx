"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { db } from "../../libs/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Trophy, Eye, Calendar, MapPin, Star, Image as ImageIcon } from 'lucide-react';

const AdminResultsPage = () => {
  const [results, setResults] = useState<any[]>([]);
  const [selectedContestant, setSelectedContestant] = useState<any | null>(null);

  useEffect(() => {
    // Query the "results" collection where your archived data is stored
    const q = query(collection(db, "results"), orderBy("archivedAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setResults(docs);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Archived Results</h1>
          <p className="text-slate-500 text-sm font-medium">Viewing all finalized competition data</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Records:</span>
          <span className="ml-2 font-black text-pink-600">{results.length}</span>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Contestant</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Final Votes</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Archived Date</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {results.map((item) => (
              <tr key={item.id} className="hover:bg-pink-50/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full relative overflow-hidden border-2 border-white shadow-sm">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.school}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 font-black text-slate-700">
                  {item.finalVotes?.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-500">
                  {item.archivedAt?.toDate().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setSelectedContestant(item)}
                    className="p-2 hover:bg-white hover:text-pink-600 rounded-lg transition-all text-slate-400"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selectedContestant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col">
            <div className="relative h-48 bg-gradient-to-r from-purple-600 to-pink-500">
              <button 
                onClick={() => setSelectedContestant(null)}
                className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white transition-all"
              >
                <Eye size={20} className="rotate-180" />
              </button>
            </div>

            <div className="px-10 pb-10 overflow-y-auto">
              <div className="relative -mt-16 flex items-end gap-6 mb-8">
                <div className="w-32 h-32 rounded-3xl relative overflow-hidden border-4 border-white shadow-xl bg-white">
                  <Image src={selectedContestant.image} alt="" fill className="object-cover" />
                </div>
                <div className="pb-2">
                  <h2 className="text-3xl font-black text-slate-900 leading-tight">{selectedContestant.name}</h2>
                  <p className="text-pink-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                    <Trophy size={14} /> Winner in {selectedContestant.category}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Achievements</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedContestant.achievements?.map((ach: string, i: number) => (
                        <span key={i} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 italic">
                          "{ach}"
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Gallery Photos</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedContestant.gallery?.map((url: string, i: number) => (
                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm group">
                          <Image src={url} alt="" fill className="object-cover group-hover:scale-110 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-[2rem] space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Quick Info</h4>
                  <div className="space-y-3">
                    <InfoItem icon={<Calendar size={14}/>} label="Age" value={selectedContestant.age} />
                    <InfoItem icon={<MapPin size={14}/>} label="School" value={selectedContestant.school} />
                    <InfoItem icon={<Star size={14}/>} label="Talent" value={selectedContestant.talent} />
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-200">
                     <p className="text-xs font-bold text-slate-400 italic">"{selectedContestant.quote}"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ icon, label, value }: { icon: any, label: string, value: any }) => (
  <div className="flex items-center gap-3">
    <div className="text-pink-500">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">{label}</p>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export default AdminResultsPage;