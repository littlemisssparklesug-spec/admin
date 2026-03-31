"use client";
import React, { useEffect, useState } from 'react';
import { db } from "../../libs/firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { 
  Users, Search, Phone, Trash2, CheckCircle, Clock, 
  MessageCircle, Mail, X, Send, User as UserIcon,
  Eye, Calendar, MapPin, CreditCard, Info
} from 'lucide-react';

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Feedback Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<any>(null);
  const [feedbackText, setFeedbackText] = useState("");

  // Detailed View Modal State
  const [viewingReg, setViewingReg] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRegistrations(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "registrations", id), { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const sendFeedback = async () => {
    if (!selectedReg || !feedbackText) return;
    try {
      await updateDoc(doc(db, "registrations", selectedReg.id), {
        adminFeedback: feedbackText,
        status: 'contacted'
      });
      setIsModalOpen(false);
      setFeedbackText("");
      alert("Message sent to the applicant!");
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
  };

  const deleteRegistration = async (id: string) => {
    if (window.confirm("Delete this registration?")) {
      try {
        await deleteDoc(doc(db, "registrations", id));
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  const filteredData = registrations.filter(reg => 
    reg.childName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
              Registration <span className="text-pink-500">Inbox</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm">Review applications & message users</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name, email, or ID..."
              className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-80 outline-none focus:ring-2 focus:ring-pink-500 transition-all font-bold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Applicant</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Child Details</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-pink-600">
                          <Mail size={12} /> {reg.userEmail || "No Email"}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">ID: {reg.userId?.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="font-black text-slate-900">{reg.childName}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{reg.age} YRS • {reg.location}</p>
                    </td>
                    <td className="p-6">
                      <StatusBadge status={reg.status || 'pending'} />
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-end gap-2">
                        {/* VIEW BUTTON */}
                        <button 
                          onClick={() => setViewingReg(reg)}
                          className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => { setSelectedReg(reg); setIsModalOpen(true); }}
                          className="p-2.5 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 transition-colors"
                          title="Send Message"
                        >
                          <MessageCircle size={18} />
                        </button>
                        <button 
                          onClick={() => updateStatus(reg.id, 'approved')}
                          className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => deleteRegistration(reg.id)}
                          className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 1. DETAILED VIEW MODAL */}
      {viewingReg && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 bg-pink-500 text-white flex justify-between items-start">
              <div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Applicant Profile</span>
                <h3 className="text-3xl font-black uppercase tracking-tight mt-2">{viewingReg.childName}</h3>
                <p className="text-pink-100 font-bold flex items-center gap-2 mt-1">
                  <UserIcon size={14}/> Parent: {viewingReg.parentName}
                </p>
              </div>
              <button onClick={() => setViewingReg(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[70vh]">
              <DetailItem icon={<Phone size={16}/>} label="Contact" value={viewingReg.contact} />
              <DetailItem icon={<MapPin size={16}/>} label="Location" value={viewingReg.location} />
              <DetailItem icon={<Calendar size={16}/>} label="Age" value={`${viewingReg.age} Years Old`} />
              <DetailItem icon={<CreditCard size={16}/>} label="Registration Fee" value={viewingReg.fee} />
              
              <div className="md:col-span-2 space-y-4">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2">
                    <Info size={14}/> Reason for Joining
                  </p>
                  <p className="text-slate-700 font-medium leading-relaxed italic">
                    "{viewingReg.reasonForJoining || "No reason provided"}"
                  </p>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2">
                    <Users size={14}/> Previous Experience
                  </p>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {viewingReg.previousExperience || "No prior experience listed."}
                  </p>
                </div>
              </div>
              
              <div className="md:col-span-2 flex justify-between items-center pt-4 border-t border-slate-100">
                 <p className="text-[10px] font-bold text-slate-400">Registered on: {viewingReg.createdAt?.toDate().toLocaleDateString()}</p>
                 <StatusBadge status={viewingReg.status || 'pending'} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. FEEDBACK MODAL (KEEP EXISTING) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Send Message</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">To: {selectedReg?.childName}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Message / Feedback</label>
              <textarea 
                className="w-full h-40 bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 outline-none focus:border-pink-500 transition-all font-medium text-slate-700"
                placeholder="E.g. Your payment has been verified..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
              <button 
                onClick={sendFeedback}
                className="w-full py-4 bg-pink-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-pink-600 shadow-xl shadow-pink-100"
              >
                Send Feedback <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Detail Item Component
const DetailItem = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="p-2 bg-white rounded-lg text-pink-500 shadow-sm">{icon}</div>
    <div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
      <p className="text-slate-900 font-bold">{value || "N/A"}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    approved: "bg-green-50 text-green-600 border-green-100",
    contacted: "bg-purple-50 text-purple-600 border-purple-100",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${styles[status]}`}>
      {status}
    </span>
  );
};