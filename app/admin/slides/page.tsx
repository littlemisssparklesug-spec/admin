"use client";
import React, { useState, useEffect } from 'react';
import { db, storage } from "../../libs/firebase"; 
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
// Added Video icon from lucide-react
import { ImagePlus, UploadCloud, Loader2, CheckCircle, Trash2, Edit3, XCircle, Sparkles, Video } from "lucide-react";

export default function AdminHeroSlides() {
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null); // Changed name for clarity
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null); // Track type
  
  const [formData, setFormData] = useState({
    tagline: '',
    titleLine1: '',
    titleLine2: '',
    subHeading: '',
  });

  useEffect(() => {
    const q = query(collection(db, "hero_slides"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSlides(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const type = file.type.startsWith('video') ? 'video' : 'image';
      
      setMediaType(type);
      setMediaFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let mediaUrl = preview;
      let finalMediaType = mediaType;

      if (mediaFile) {
        // Dynamic folder path based on type
        const folder = finalMediaType === 'video' ? 'hero_videos' : 'hero_slides';
        const storageRef = ref(storage, `${folder}/${Date.now()}_${mediaFile.name}`);
        const uploadTask = await uploadBytes(storageRef, mediaFile);
        mediaUrl = await getDownloadURL(uploadTask.ref);
      }

      const payload = {
        ...formData,
        mediaUrl,
        mediaType: finalMediaType, // Store type in DB
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "hero_slides", editingId), payload);
        alert("Slide updated!");
      } else {
        if (!mediaFile) throw new Error("Please upload an image or video");
        await addDoc(collection(db, "hero_slides"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        alert("New slide published!");
      }

      resetForm();
    } catch (error: any) {
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, mediaUrl: string) => {
    if (!window.confirm("Delete this slide?")) return;
    try {
      await deleteDoc(doc(db, "hero_slides", id));
      if (mediaUrl?.includes("firebasestorage")) {
        await deleteObject(ref(storage, mediaUrl));
      }
    } catch (error) {
      alert("Delete failed");
    }
  };

  const startEdit = (slide: any) => {
    setEditingId(slide.id);
    setFormData({
      tagline: slide.tagline,
      titleLine1: slide.titleLine1,
      titleLine2: slide.titleLine2,
      subHeading: slide.subHeading,
    });
    setPreview(slide.mediaUrl);
    setMediaType(slide.mediaType || 'image');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ tagline: '', titleLine1: '', titleLine2: '', subHeading: '' });
    setMediaFile(null);
    setPreview(null);
    setMediaType(null);
  };

  return (
    <main className="min-h-screen bg-[#fffafa] pt-20 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 px-4 py-2 rounded-full mb-6">
            <Sparkles size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Management Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">
            Hero <span className="text-pink-500 italic">Slide Manager</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-pink-50">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  {editingId ? <Edit3 className="text-orange-500" /> : <UploadCloud className="text-pink-500" />}
                  {editingId ? "Modify Slide" : "Create New Slide"}
                </h2>
                {editingId && (
                  <button onClick={resetForm} className="text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-1 hover:text-red-600">
                    <XCircle size={14} /> Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Background Media (Image or Video)</label>
                  <input type="file" accept="image/*,video/*" onChange={handleMediaChange} className="hidden" id="hero-media" />
                  <label htmlFor="hero-media" className="cursor-pointer block w-full h-64 border-2 border-dashed border-pink-100 rounded-[2rem] overflow-hidden hover:border-pink-400 transition-all bg-[#fffafa] relative">
                    {preview ? (
                      mediaType === 'video' ? (
                        <video src={preview} className="w-full h-full object-cover" autoPlay muted loop />
                      ) : (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-300">
                        <div className="flex gap-2">
                          <ImagePlus size={32} strokeWidth={1} />
                          <Video size={32} strokeWidth={1} />
                        </div>
                        <p className="mt-2 font-black text-[10px] uppercase tracking-[0.2em]">Select HD Media</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Tagline Text</label>
                    <input required type="text" value={formData.tagline} onChange={(e) => setFormData({...formData, tagline: e.target.value})} className="w-full bg-slate-50 border-0 rounded-2xl py-4 px-6 outline-none font-bold text-slate-800" placeholder="Every Girl Deserves..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Heading (White)</label>
                    <input required type="text" value={formData.titleLine1} onChange={(e) => setFormData({...formData, titleLine1: e.target.value})} className="w-full bg-slate-50 border-0 rounded-2xl py-4 px-6 outline-none font-bold text-slate-800" placeholder="Little Miss" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Heading (Gradient/Pink)</label>
                  <input required type="text" value={formData.titleLine2} onChange={(e) => setFormData({...formData, titleLine2: e.target.value})} className="w-full bg-slate-50 border-0 rounded-2xl py-4 px-6 outline-none font-bold text-slate-800" placeholder="Sparkles Uganda" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Description / Sub-heading</label>
                  <textarea required value={formData.subHeading} onChange={(e) => setFormData({...formData, subHeading: e.target.value})} className="w-full bg-slate-50 border-0 rounded-2xl py-4 px-6 outline-none font-bold text-slate-800 h-32" placeholder="Tell the mission..." />
                </div>

                <button 
                  disabled={loading}
                  type="submit"
                  className={`w-full py-5 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all flex items-center justify-center gap-3 ${editingId ? 'bg-orange-500 shadow-orange-100 hover:bg-orange-600' : 'bg-pink-500 shadow-pink-100 hover:bg-pink-600'}`}
                >
                  {loading ? <Loader2 className="animate-spin" /> : <>{editingId ? "Update Changes" : "Publish Slide"} <CheckCircle size={16} /></>}
                </button>
              </form>
            </div>
          </div>

          {/* Preview List */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Live Content ({slides.length})</h3>
            
            <div className="space-y-4">
              {slides.map((slide) => (
                <div key={slide.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-pink-50 group hover:shadow-xl transition-all duration-500">
                  <div className="h-44 relative">
                    {slide.mediaType === 'video' ? (
                       <video src={slide.mediaUrl} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={slide.mediaUrl} alt="" className="w-full h-full object-cover" />
                    )}
                    
                    <div className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full">
                       {slide.mediaType === 'video' ? <Video size={14}/> : <ImagePlus size={14}/>}
                    </div>

                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button onClick={() => startEdit(slide)} className="p-4 bg-white rounded-2xl text-slate-900 hover:scale-110 transition-transform shadow-lg">
                        <Edit3 size={20} />
                      </button>
                      <button onClick={() => handleDelete(slide.id, slide.mediaUrl)} className="p-4 bg-white rounded-2xl text-red-500 hover:scale-110 transition-transform shadow-lg">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">{slide.tagline}</span>
                    </div>
                    <h4 className="font-black text-slate-800 text-lg leading-tight uppercase tracking-tighter">
                      {slide.titleLine1} <span className="text-pink-500">{slide.titleLine2}</span>
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}