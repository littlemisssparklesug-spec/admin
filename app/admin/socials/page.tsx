"use client";

import React, { useState, useEffect } from 'react';
import { db } from '../../libs/firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, deleteDoc } from 'firebase/firestore';

const SocialAdmin = () => {
  const [socials, setSocials] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newHref, setNewHref] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "socials"), (snapshot) => {
      setSocials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newHref) return;
    await addDoc(collection(db, "socials"), { name: newName.toLowerCase(), href: newHref });
    setNewName(''); setNewHref('');
  };

  const handleUpdate = async (id: string, href: string) => {
    const docRef = doc(db, "socials", id);
    await updateDoc(docRef, { href });
    alert("Updated!");
  };

  return (
    <div className="p-10 bg-white min-h-screen text-slate-900">
      <h1 className="text-3xl font-black mb-8">Social Links Admin</h1>

      {/* Add New Section */}
      <form onSubmit={handleAdd} className="mb-12 p-6 bg-slate-50 rounded-2xl border border-slate-200 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold uppercase mb-2">Platform Name (e.g. facebook, x, youtube)</label>
          <input 
            value={newName} onChange={e => setNewName(e.target.value)}
            className="w-full p-3 rounded-lg border border-slate-300" placeholder="facebook"
          />
        </div>
        <div className="flex-[2]">
          <label className="block text-xs font-bold uppercase mb-2">URL (href)</label>
          <input 
            value={newHref} onChange={e => setNewHref(e.target.value)}
            className="w-full p-3 rounded-lg border border-slate-300" placeholder="https://facebook.com/..."
          />
        </div>
        <button type="submit" className="bg-pink-600 text-white px-8 py-3 rounded-lg font-bold">Add Link</button>
      </form>

      {/* List / Update Section */}
      <div className="grid gap-6">
        {socials.map((social) => (
          <div key={social.id} className="flex items-center gap-4 p-4 border rounded-xl shadow-sm">
            <div className="w-32 font-black uppercase text-pink-600">{social.name}</div>
            <input 
              defaultValue={social.href}
              className="flex-1 p-2 border rounded bg-slate-50"
              id={`input-${social.id}`}
            />
            <button 
              onClick={() => {
                const val = (document.getElementById(`input-${social.id}`) as HTMLInputElement).value;
                handleUpdate(social.id, val);
              }}
              className="bg-slate-900 text-white px-4 py-2 rounded font-bold text-sm"
            >
              Update
            </button>
            <button 
              onClick={() => deleteDoc(doc(db, "socials", social.id))}
              className="text-red-500 font-bold text-xs"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialAdmin;