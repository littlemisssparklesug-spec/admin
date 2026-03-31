"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../libs/firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { collection, getDocs, addDoc, query, limit } from "firebase/firestore";
import { Sparkles, Lock, ShieldCheck, KeyRound, Loader2, AlertCircle } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Security States
  const [hasExistingCode, setHasExistingCode] = useState<boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [dbCode, setDbCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Initial Check: Does a code exist in Firebase?
    const checkSecuritySetup = async () => {
      try {
        const q = query(collection(db, "security_code"), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setHasExistingCode(true);
          // Store the real code locally for comparison
          setDbCode(querySnapshot.docs[0].data().code);
        } else {
          setHasExistingCode(false);
        }
      } catch (err) {
        console.error("Security check failed:", err);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkSecuritySetup();

    // 2. Auth State Observer
    const unsub = onAuthStateChanged(auth, (user) => {
      // If user is already logged in AND unlocked the gate
      if (user && isUnlocked) {
        router.push("/admin");
      }
    });
    return () => unsub();
  }, [router, isUnlocked]);

  // Handle Creating a new code (Only if collection is empty)
  const handleCreateCode = async () => {
    if (inputCode.length < 4) return setError("Code must be at least 4 digits");
    setLoading(true);
    try {
      await addDoc(collection(db, "security_code"), {
        code: inputCode,
        createdAt: new Date()
      });
      setDbCode(inputCode);
      setHasExistingCode(true);
      setIsUnlocked(true);
      setError("");
    } catch (err) {
      setError("Failed to save security configuration");
    } finally {
      setLoading(false);
    }
  };

  // Handle Verifying Code against Firebase Data
  const handleVerifyCode = () => {
    setLoading(true);
    // Directly compare input with the code fetched from Firebase
    if (inputCode === dbCode) {
      setIsUnlocked(true);
      setError("");
    } else {
      setError("Access Denied: Invalid Security Code");
      setInputCode("");
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/admin");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-pink-500" size={40} />
      </div>
    );
  }

  return (
    <main className="h-screen w-full bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-[3rem] p-10 text-center shadow-2xl">
        
        {!isUnlocked ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-white" />
            </div>
            
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                {hasExistingCode ? "Access Required" : "Security Setup"}
              </h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                {hasExistingCode ? "Enter valid system key" : "Create master access code"}
              </p>
            </div>

            <div className="space-y-4">
              <input 
                type="password"
                placeholder="••••••"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  if (error) setError(""); // Clear error when typing
                }}
                className={`w-full bg-slate-50 border-2 ${error ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-5 px-6 text-center text-2xl tracking-[0.5em] font-black focus:ring-4 focus:ring-pink-500/10 outline-none transition-all`}
              />

              {error && (
                <div className="flex items-center justify-center gap-2 text-red-500 font-bold text-[10px] uppercase tracking-wider animate-bounce">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </div>

            <button
              onClick={hasExistingCode ? handleVerifyCode : handleCreateCode}
              disabled={loading || !inputCode}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : hasExistingCode ? "Unlock System" : "Set System Code"}
            </button>
          </div>
        ) : (
          /* Access Granted: Google Login Revealed */
          <div className="space-y-8 animate-in zoom-in duration-500">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center rotate-3 shadow-lg shadow-green-100">
                <ShieldCheck size={40} className="text-white" />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-1">
                Security <span className="text-green-500 italic">Passed</span>
              </h1>
              <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase">
                Now Authenticate your Identity
              </p>
            </div>

            <button
              onClick={handleLogin}
              className="group relative w-full py-5 bg-white border-2 border-pink-500 rounded-2xl flex items-center justify-center gap-3 overflow-hidden transition-all hover:bg-pink-500"
            >
              <div className="absolute inset-0 bg-pink-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 -z-10" />
              <KeyRound size={20} className="text-pink-500 group-hover:text-white transition-colors" />
              <span className="font-black text-pink-500 group-hover:text-white transition-colors uppercase tracking-widest text-sm">
                Login with Google
              </span>
            </button>
            
            <button 
              onClick={() => setIsUnlocked(false)} 
              className="text-[10px] text-slate-300 font-black uppercase tracking-widest hover:text-red-400"
            >
              Lock System
            </button>
          </div>
        )}
      </div>
    </main>
  );
}