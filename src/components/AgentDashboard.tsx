import React, { useState } from "react";
import { Contact, Message } from "../types";
import { 
  Users, MessageSquare, Clock, Zap, ToggleLeft, ToggleRight, 
  Send, Plus, Check, ShieldAlert, BadgeHelp, CheckCircle, Flame
} from "lucide-react";

interface AgentDashboardProps {
  contacts: Contact[];
  selectedContactId: string;
  onSelectContact: (id: string) => void;
  onToggleAutoPilot: (id: string) => void;
  onAdminReply: (contactId: string, text: string) => void;
  onTriggerSimulatedCustomer: () => void;
}

export default function AgentDashboard({
  contacts,
  selectedContactId,
  onSelectContact,
  onToggleAutoPilot,
  onAdminReply,
  onTriggerSimulatedCustomer
}: AgentDashboardProps) {
  const [replyText, setReplyText] = useState("");
  const selectedContact = contacts.find((c) => c.id === selectedContactId) || contacts[0];

  const handleSend = () => {
    if (!replyText.trim() || !selectedContact) return;
    onAdminReply(selectedContact.id, replyText.trim());
    setReplyText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // KPI Calculations
  const totalChats = contacts.length;
  const activeChats = contacts.filter((c) => c.status === "active").length;
  const autoPilotCount = contacts.filter((c) => c.aiAutoPilot).length;
  
  // Total AI-answered messages count
  const aiAnsweredCount = contacts.reduce((acc, c) => {
    return acc + c.messages.filter((m) => m.sender === "ai").length;
  }, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="agent-dashboard">
      
      {/* KPI Stats Grid */}
      <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">মোট কাস্টমার চ্যাট</p>
            <h4 className="text-xl font-bold text-slate-800">{totalChats}</h4>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">RF AI স্বয়ংক্রিয় উত্তর</p>
            <h4 className="text-xl font-bold text-slate-800">{aiAnsweredCount} টি</h4>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">গড় AI রেসপন্স টাইম</p>
            <h4 className="text-xl font-bold text-slate-800">১.২ সেকেন্ড (তাত্ক্ষণিক)</h4>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">অটো-পাইলট মোড সক্রিয়</p>
            <h4 className="text-xl font-bold text-slate-800">
              {autoPilotCount} / {totalChats} চ্যাট
            </h4>
          </div>
        </div>

      </div>

      {/* Main Admin Workspace splits */}
      
      {/* 1. Chats List Sidebar (4 Columns) */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[580px]">
        
        {/* Sidebar Header with simulation trigger */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              ইনবক্স ফিল্টার
            </h3>
            <p className="text-[10px] text-slate-500">গ্রাহকদের তালিকা ও স্ট্যাটাস</p>
          </div>
          
          <button
            onClick={onTriggerSimulatedCustomer}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-sm hover:shadow transition-all"
            title="নতুন কাস্টমার চ্যাট জেনারেট করুন"
          >
            <Plus className="w-3.5 h-3.5" /> কাস্টমার জেনারেট
          </button>
        </div>

        {/* Contacts Container */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {contacts.map((contact) => {
            const isSelected = contact.id === selectedContactId;
            const hasUnread = contact.unreadCount > 0;
            return (
              <div
                key={contact.id}
                onClick={() => onSelectContact(contact.id)}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                  isSelected ? "bg-emerald-50/50 border-l-4 border-emerald-600" : "hover:bg-slate-50/70"
                }`}
              >
                {/* Avatar Icon */}
                <div className="relative">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg border border-slate-200">
                    {contact.avatar || "👤"}
                  </div>
                  {contact.aiAutoPilot && (
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[8px] p-0.5 rounded-full border border-white font-bold" title="AI Auto-Pilot Active">
                      🤖
                    </span>
                  )}
                </div>

                {/* Info summary */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-800 truncate">{contact.name}</h4>
                    <span className="text-[9px] text-slate-400">{contact.lastMessageTime}</span>
                  </div>
                  
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{contact.lastMessage}</p>
                  
                  {/* Badges */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium uppercase ${
                      contact.priority === "high" 
                        ? "bg-red-50 text-red-600 border border-red-100" 
                        : contact.priority === "medium"
                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                        : "bg-slate-50 text-slate-600 border border-slate-100"
                    }`}>
                      {contact.priority}
                    </span>

                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                      contact.category === "support" 
                        ? "bg-blue-50 text-blue-600 border border-blue-100" 
                        : contact.category === "sales"
                        ? "bg-purple-50 text-purple-600 border border-purple-100"
                        : "bg-slate-50 text-slate-600 border border-slate-100"
                    }`}>
                      {contact.category === "support" ? "সাপোর্ট" : contact.category === "sales" ? "বিক্রয়" : "সাধারণ"}
                    </span>
                  </div>
                </div>

                {/* Unread dot / Status */}
                <div className="flex flex-col items-end justify-between self-stretch">
                  {hasUnread && (
                    <span className="w-4 h-4 bg-emerald-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                      {contact.unreadCount}
                    </span>
                  )}
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    contact.status === "resolved" ? "bg-slate-300" : "bg-emerald-500"
                  }`} title={contact.status}></span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Admin Chat Feed Area (8 Columns) */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[580px]">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg border border-slate-200">
                  {selectedContact.avatar || "👤"}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                    {selectedContact.name} 
                    <span className="text-[10px] text-slate-400 font-normal">({selectedContact.phoneNumber})</span>
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    স্ট্যাটাস: <span className="text-emerald-600 font-semibold">{selectedContact.status === "active" ? "সক্রিয় চ্যাট" : "সমাধান করা"}</span>
                  </p>
                </div>
              </div>

              {/* Auto Pilot Toggle Switch */}
              <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                    🤖 RF AI Auto-Pilot
                  </p>
                  <p className="text-[9px] text-slate-400">
                    {selectedContact.aiAutoPilot ? "স্বয়ংক্রিয় উত্তর চলছে" : "ম্যানুয়াল কন্ট্রোল"}
                  </p>
                </div>
                <button
                  onClick={() => onToggleAutoPilot(selectedContact.id)}
                  className="text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                  title="অটো-পাইলট অন/অফ করুন"
                >
                  {selectedContact.aiAutoPilot ? (
                    <ToggleRight className="w-9 h-9 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Conversation Feed */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-3.5">
              
              {/* Auto Pilot Banner status */}
              {selectedContact.aiAutoPilot ? (
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>
                    <strong>RF AI অটো-পাইলট চালু আছে:</strong> কাস্টমার কোনো মেসেজ দিলে AI আমাদের হয়ে তাত্ক্ষণিকভাবে সঠিক উত্তর দিয়ে দিবে।
                  </span>
                </div>
              ) : (
                <div className="bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-100 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>
                    <strong>ম্যানুয়াল মোড চালু:</strong> কাস্টমার মেসেজ দিলে AI উত্তর দিবে না। আপনাকে নিচে টাইপ করে উত্তর পাঠাতে হবে।
                  </span>
                </div>
              )}

              {selectedContact.messages.map((msg) => {
                const isCustomer = msg.sender === "customer";
                const isAi = msg.sender === "ai";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isCustomer ? "items-start" : "items-end"
                    }`}
                  >
                    {/* Sender Identity Label */}
                    <span className="text-[9px] text-slate-400 mb-1 px-1.5">
                      {isCustomer ? "গ্রাহক (Customer)" : isAi ? "🤖 RF AI (অটো-পাইলট)" : "👤 আপনি (হিউম্যান এজেন্ট)"}
                    </span>
                    
                    <div
                      className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                        isCustomer
                          ? "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                          : isAi
                          ? "bg-emerald-600 text-white rounded-tr-none"
                          : "bg-blue-600 text-white rounded-tr-none"
                      }`}
                    >
                      <p className="whitespace-pre-line font-sans">{msg.text}</p>
                      <span className={`block text-[9px] text-right mt-1.5 ${isCustomer ? "text-slate-400" : "text-white/70"}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Manual Reply input box */}
            <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
              <input
                type="text"
                disabled={selectedContact.aiAutoPilot}
                placeholder={
                  selectedContact.aiAutoPilot 
                    ? "ম্যানুয়ালি উত্তর দিতে আগে উপর থেকে Auto-Pilot বন্ধ করুন..."
                    : "গ্রাহককে উত্তর দিতে টাইপ করুন..."
                }
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-60"
              />
              <button
                onClick={handleSend}
                disabled={selectedContact.aiAutoPilot || !replyText.trim()}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow transition-all text-xs"
                title="উত্তর পাঠান"
              >
                <Send className="w-3.5 h-3.5" /> পাঠান
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/20">
            <BadgeHelp className="w-12 h-12 text-slate-300 mb-2" />
            <p className="text-sm text-slate-500 font-medium">কোনো চ্যাট নির্বাচন করা হয়নি।</p>
          </div>
        )}
      </div>

    </div>
  );
}
