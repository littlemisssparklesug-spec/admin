"use client";

import { useState, useEffect } from "react";
import { db, storage } from "../../libs/firebase"; 
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Upload, Loader2, Camera, X, Trash2, Edit3, Sparkles } from "lucide-react";
import Image from "next/image";

interface Queen {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
}

export default function AdminQueens() {
  const [loading, setLoading] = useState(false);
  const [queens, setQueens] = useState<Queen[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", title: "", bio: "" });

  // 1. Fetch Queens for the Management List
  useEffect(() => {
    const q = query(collection(db, "queens"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setQueens(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Queen[]);
    });
    return () => unsubscribe();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // 2. Handle Submit (Add or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = preview;

      // If a new image was selected, upload it
      if (image) {
        const storageRef = ref(storage, `queens/${Date.now()}_${image.name}`);
        const snapshot = await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      if (editingId) {
        // Update Existing
        await updateDoc(doc(db, "queens", editingId), {
          ...formData,
          image: imageUrl,
        });
        alert("Queen updated!");
      } else {
        // Add New
        if (!imageUrl) throw new Error("Image required");
        await addDoc(collection(db, "queens"), {
          ...formData,
          image: imageUrl,
          createdAt: new Date(),
        });
        alert("Queen added!");
      }

      // Reset
      setFormData({ name: "", title: "", bio: "" });
      setImage(null);
      setPreview(null);
      setEditingId(null);
    } catch (error) {
      console.error(error);
      alert("Action failed");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (queen: Queen) => {
    setEditingId(queen.id);
    setFormData({ name: queen.name, title: queen.title, bio: queen.bio });
    setPreview(queen.image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteQueen = async (id: string) => {
    if (confirm("Are you sure you want to remove this Queen from the Wall of Fame?")) {
      await deleteDoc(doc(db, "queens", id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LEFT SIDE: UPLOAD/EDIT FORM */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 h-fit sticky top-32">
          <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tighter">
            {editingId ? "Edit" : "Add"} <span className="text-pink-500">Queen</span>
          </h1>
          <p className="text-slate-400 font-medium mb-8 text-xs uppercase tracking-widest">
            {editingId ? "Updating entry..." : "Create a new entry"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200">
              {preview ? (
                <>
                  <Image src={preview} alt="Preview" fill className="object-cover" />
                  <button type="button" onClick={() => {setPreview(null); setImage(null);}} className="absolute top-2 right-2 p-1 bg-white rounded-full text-pink-500 shadow-md">
                    <X size={16} />
                  </button>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-pink-50 transition-colors">
                  <Camera size={32} className="text-pink-200 mb-2" />
                  <span className="text-[10px] font-bold uppercase text-slate-400">Upload Portrait</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>

            <input required type="text" placeholder="Full Name" className="w-full p-4 bg-slate-50 rounded-xl text-slate-900 font-bold border-none focus:ring-2 focus:ring-pink-500"
              onChange={e => setFormData({...formData, name: e.target.value})} value={formData.name} />

            <input required type="text" placeholder="Title (e.g. Miss Sparkle 2025)" className="w-full p-4 bg-slate-50 rounded-xl text-slate-900 font-bold border-none focus:ring-2 focus:ring-pink-500"
              onChange={e => setFormData({...formData, title: e.target.value})} value={formData.title} />

            <textarea required rows={4} placeholder="Bio..." className="w-full p-4 bg-slate-50 rounded-xl text-slate-900 font-medium border-none focus:ring-2 focus:ring-pink-500"
              onChange={e => setFormData({...formData, bio: e.target.value})} value={formData.bio} />

            <div className="flex gap-3">
              <button disabled={loading} type="submit" className="flex-1 py-4 bg-pink-500 text-white rounded-xl font-black uppercase tracking-widest hover:bg-pink-600 transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : editingId ? "Save Changes" : "Publish"}
              </button>
              {editingId && (
                <button type="button" onClick={() => {setEditingId(null); setFormData({name:"", title:"", bio:""}); setPreview(null);}} className="px-6 py-4 bg-slate-100 text-slate-500 rounded-xl font-bold uppercase text-xs">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT SIDE: LIVE LIST */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="text-pink-500" size={20} /> Current Royalty
          </h2>
          
          <div className="space-y-4">
            {queens.map((queen) => (
              <div key={queen.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 group hover:border-pink-200 transition-colors">
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden flex-shrink-0">
                  <Image src={queen.image} alt={queen.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-slate-900 font-black truncate">{queen.name}</h4>
                  <p className="text-pink-500 text-[10px] font-bold uppercase tracking-widest truncate">{queen.title}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(queen)} className="p-2 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-all">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => deleteQueen(queen.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {queens.length === 0 && <p className="text-slate-400 text-sm font-medium italic">No queens found in the database.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}