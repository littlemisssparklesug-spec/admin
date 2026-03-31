"use client";

import React, { useState, useEffect } from "react";
import { db, auth } from "../../libs/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { ImagePlus, Trash2, Loader2, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";

const storage = getStorage();

export default function AdminGallery() {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<any[]>([]);

  // Fetch images for admin to see what to delete
  const fetchImages = async () => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setImages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchImages(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload to Storage
      const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // 2. Add to Firestore
      await addDoc(collection(db, "gallery"), {
        url,
        alt: file.name,
        storagePath: storageRef.fullPath,
        createdAt: serverTimestamp(),
      });

      fetchImages();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, storagePath: string) => {
    if (!confirm("Delete this image?")) return;

    try {
      // Delete from Storage
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
      // Delete from Firestore
      await deleteDoc(doc(db, "gallery", id));
      fetchImages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-slate-900">Gallery <span className="text-pink-500">Manager</span></h1>
          <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-500">
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Upload Card */}
        <div className="bg-white p-8 rounded-[2rem] border-2 border-pink-100 mb-10 text-center">
          <label className="cursor-pointer flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
              {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus size={32} />}
            </div>
            <div>
              <p className="font-black text-slate-800 uppercase tracking-widest text-sm">
                {uploading ? "Uploading Sparkle..." : "Upload New Image"}
              </p>
              <p className="text-slate-400 text-xs mt-1">PNG, JPG or WEBP</p>
            </div>
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept="image/*" />
          </label>
        </div>

        {/* Admin Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square bg-white border-2 border-pink-50 rounded-2xl overflow-hidden shadow-sm">
              <img src={img.url} className="w-full h-full object-cover" />
              <button 
                onClick={() => handleDelete(img.id, img.storagePath)}
                className="absolute top-2 right-2 p-2 bg-white/90 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}