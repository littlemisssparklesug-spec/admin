"use client";
import React, { useState, useEffect } from 'react';
import { db } from "../../libs/firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  doc, 
  deleteDoc 
} from "firebase/firestore";
import { 
  Mail, 
  Phone, 
  Clock, 
  Trash2, 
  CheckCircle, 
  MoreHorizontal, 
  User,
  MessageSquare
} from 'lucide-react';

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const q = query(collection(db, "contactz"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(docs);
    });

    return () => unsubscribe();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'NEW' ? 'READ' : 'NEW';
    await updateDoc(doc(db, "contactz", id), { status: newStatus });
  };

  const deleteMessage = async (id: string) => {
    if(window.confirm("Delete this message?")) {
      await deleteDoc(doc(db, "contactz", id));
    }
  };

  const filteredMessages = messages.filter(m => 
    filter === 'ALL' ? true : m.status === filter
  );

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Messages Inbox</h1>
          <p className="text-slate-500 text-sm font-medium">Manage inquiries and sponsorships</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {['ALL', 'NEW', 'READ'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Grid/List */}
      <div className="grid gap-4">
        {filteredMessages.map((msg) => (
          <div 
            key={msg.id} 
            className={`bg-white rounded-2xl border transition-all duration-300 ${
              msg.status === 'NEW' ? 'border-l-4 border-l-pink-500 border-slate-200' : 'border-slate-100 opacity-75'
            } p-6 shadow-sm hover:shadow-md`}
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* User Info */}
              <div className="lg:w-1/4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    msg.status === 'NEW' ? 'bg-pink-100 text-pink-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 leading-tight">{msg.fullName}</h3>
                    <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest">{msg.subject}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 pl-1">
                  <a href={`mailto:${msg.email}`} className="text-xs text-slate-500 flex items-center gap-2 hover:text-pink-500">
                    <Mail size={12} /> {msg.email}
                  </a>
                  <a href={`tel:${msg.phone}`} className="text-xs text-slate-500 flex items-center gap-2 hover:text-pink-500">
                    <Phone size={12} /> {msg.phone}
                  </a>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 bg-slate-50 p-4 rounded-xl relative">
                <MessageSquare size={16} className="absolute top-4 right-4 text-slate-200" />
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "{msg.message}"
                </p>
                <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  <Clock size={10} />
                  {msg.createdAt?.toDate().toLocaleString()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex lg:flex-col justify-end gap-2">
                <button 
                  onClick={() => toggleStatus(msg.id, msg.status)}
                  className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    msg.status === 'NEW' 
                    ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle size={14} /> {msg.status === 'NEW' ? 'Mark Read' : 'Unread'}
                </button>
                <button 
                  onClick={() => deleteMessage(msg.id)}
                  className="px-4 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredMessages.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-300">
            <Mail className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No messages found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessagesPage;