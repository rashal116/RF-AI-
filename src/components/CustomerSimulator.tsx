import React, { useState, useRef, useEffect } from "react";
import { Message, Contact, KnowledgeBase, MessageAttachment } from "../types";
import { Send, CheckCheck, Sparkles, User, ShieldAlert, ArrowRight, BookOpen, Paperclip, X, Image as ImageIcon, Play, FileCode } from "lucide-react";

interface CustomerSimulatorProps {
  currentContact: Contact;
  onNewMessage: (msgText: string, attachment?: MessageAttachment) => void;
  isAiTyping: boolean;
  knowledgeBase: KnowledgeBase;
}

const PRESET_QUESTIONS = [
  { text: "শোরুম কোথায় এবং কখন খোলা থাকে?", label: "শোরুমের ঠিকানা ও সময়" },
  { text: "RF Pro Max এর দাম এবং ডিটেইলস বলুন।", label: "স্মার্টফোনের দাম" },
  { text: "ডেলিভারি চার্জ এবং রিফান্ড পলিসি কি?", label: "ডেলিভারি ও রিফান্ড" },
  { text: "আমার একটা সমস্যা হয়েছে, মানুষের সাথে কথা বলতে চাই।", label: "হিউম্যান হেল্প" },
  { text: "Hi, do you sell smartwatches? What's the price?", label: "Smartwatch Price (EN)" }
];

export default function CustomerSimulator({
  currentContact,
  onNewMessage,
  isAiTyping,
  knowledgeBase
}: CustomerSimulatorProps) {
  const [typedMessage, setTypedMessage] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [attachedFile, setAttachedFile] = useState<MessageAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentContact.messages, isAiTyping]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = (file.size / 1024).toFixed(1) + " KB";

    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setAttachedFile({
          type: file.type.startsWith("image/") ? "image" : "video",
          name: file.name,
          url: dataUrl,
          size: sizeStr
        });
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const textContent = event.target?.result as string;
        setAttachedFile({
          type: "code",
          name: file.name,
          url: "data:text/plain;charset=utf-8," + encodeURIComponent(textContent),
          size: sizeStr,
          content: textContent
        });
      };
      reader.readAsText(file);
    }
    e.target.value = "";
  };

  const handleSend = () => {
    if (!typedMessage.trim() && !attachedFile) return;
    onNewMessage(typedMessage.trim(), attachedFile || undefined);
    setTypedMessage("");
    setAttachedFile(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handlePresetClick = (qText: string) => {
    onNewMessage(qText);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2" id="customer-simulator">
      {/* Phone Frame */}
      <div className="w-full max-w-[390px] h-[680px] bg-slate-950 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800 flex flex-col relative overflow-hidden">
        {/* Notch / Speaker bar */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-slate-950 rounded-b-2xl z-20 flex items-center justify-center">
          <div className="w-12 h-1 bg-slate-800 rounded-full mb-1"></div>
        </div>

        {/* Dynamic Island Screen contents */}
        <div className="flex-1 rounded-[32px] overflow-hidden bg-[#e5ddd5] flex flex-col relative">
          
          {/* WhatsApp Header */}
          <div className="bg-[#075e54] text-white pt-7 pb-3 px-4 flex items-center gap-3 shadow-md z-10">
            <div className="relative">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-[#075e54] font-bold text-lg border border-white/20">
                {currentContact.avatar ? (
                  <span className="text-xl">{currentContact.avatar}</span>
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#075e54] rounded-full"></span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-1">
                RF AI
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-md border border-emerald-400/20 font-medium">
                  Official
                </span>
              </h3>
              <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                {isAiTyping ? (
                  <span className="animate-pulse font-medium text-emerald-300">টাইপ করছে...</span>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-ping"></span>
                    অনলাইন (সার্বক্ষণিক)
                  </>
                )}
              </p>
            </div>
          </div>

          {/* WhatsApp Background Chat Area */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col"
            style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: "cover" }}
          >
            {/* System Encryption Info Banner */}
            <div className="self-center bg-yellow-100 text-[10px] text-amber-950 px-3 py-1.5 rounded-lg text-center max-w-[90%] shadow-sm border border-yellow-200 leading-normal">
              🔒 এই চ্যাটটি সরাসরি আর এফ এআই (RF AI) মেমোরির সাথে যুক্ত। দ্রুত উত্তরের জন্য নিচের যেকোনো প্রশ্নে ক্লিক করুন বা টাইপ করুন।
            </div>

            {/* Current Messages list */}
            {currentContact.messages.map((msg) => {
              const isMe = msg.sender === "customer";
              return (
                <div
                  key={msg.id}
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm relative transition-all duration-200 ${
                    isMe
                      ? "bg-[#dcf8c6] text-slate-900 self-end rounded-tr-none"
                      : "bg-white text-slate-900 self-start rounded-tl-none border border-slate-100"
                  }`}
                >
                  <p className="whitespace-pre-line font-sans">{msg.text}</p>
                  
                  {msg.attachment && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 shadow-sm max-w-[240px] bg-slate-950 font-sans text-[11px]">
                      {msg.attachment.type === "image" && (
                        <>
                          <img src={msg.attachment.url} alt={msg.attachment.name} className="max-h-32 object-contain w-full mx-auto" referrerPolicy="no-referrer" />
                          <div className="bg-slate-900 text-slate-300 p-1.5 text-[9px] flex justify-between items-center px-2">
                            <span className="truncate flex items-center gap-1">
                              <ImageIcon className="w-3 h-3 text-emerald-400" />
                              {msg.attachment.name}
                            </span>
                          </div>
                        </>
                      )}
                      {msg.attachment.type === "video" && (
                        <>
                          <video src={msg.attachment.url} controls className="max-h-32 w-full mx-auto" />
                          <div className="bg-slate-900 text-slate-300 p-1.5 text-[9px] flex justify-between items-center px-2">
                            <span className="truncate flex items-center gap-1">
                              <Play className="w-3 h-3 text-emerald-400" />
                              {msg.attachment.name}
                            </span>
                          </div>
                        </>
                      )}
                      {msg.attachment.type === "code" && (
                        <div className="p-2 bg-slate-900 text-slate-300 font-mono text-[9px]">
                          <div className="flex items-center gap-1 text-blue-400 mb-1">
                            <FileCode className="w-3 h-3" />
                            <span>{msg.attachment.name}</span>
                          </div>
                          <pre className="p-1.5 bg-slate-950 text-emerald-400 max-h-24 overflow-y-auto text-[8px] rounded leading-normal">
                            <code>{msg.attachment.content || "// empty"}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isAiTyping && (
              <div className="bg-white rounded-2xl p-3 text-xs shadow-sm self-start rounded-tl-none border border-slate-100 flex items-center gap-2 max-w-[80%]">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
                <span className="text-slate-400 text-[10px]">RF AI টাইপ করছে...</span>
              </div>
            )}

            <div ref={chatBottomRef}></div>
          </div>

          {/* Preset Questions Slider */}
          <div className="bg-slate-50/95 backdrop-blur border-t border-slate-200 px-3 py-2 z-10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              কুইক সাজেশন (ক্লিক করুন)
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
              {PRESET_QUESTIONS.map((pq, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetClick(pq.text)}
                  className="snap-center bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-full px-3 py-1.5 text-[10px] font-medium whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  {pq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Attachment Preview Bar */}
          {attachedFile && (
            <div className="bg-emerald-50 border-t border-b border-emerald-100/80 px-4 py-2 flex items-center justify-between gap-3 text-xs text-slate-700">
              <div className="flex items-center gap-2 min-w-0">
                {attachedFile.type === "image" && <ImageIcon className="w-4 h-4 text-emerald-700 shrink-0" />}
                {attachedFile.type === "video" && <Play className="w-4 h-4 text-emerald-700 shrink-0" />}
                {attachedFile.type === "code" && <FileCode className="w-4 h-4 text-emerald-700 shrink-0" />}
                <span className="font-semibold truncate">{attachedFile.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">({attachedFile.size})</span>
              </div>
              <button 
                onClick={() => setAttachedFile(null)}
                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="সংযুক্তি মুছে ফেলুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input Box */}
          <div className="bg-[#f0f0f0] p-3 flex items-center gap-2 border-t border-slate-200">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*,text/*,.js,.ts,.tsx,.html,.css,.py,.json"
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="ফটো, ভিডিও বা কোড সংযুক্ত করুন"
            >
              <Paperclip className="w-4.5 h-4.5" />
            </button>

            <input
              type="text"
              placeholder="এখানে লিখুন (বাংলা অথবা English)..."
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
            />
            
            <button
              onClick={handleSend}
              disabled={!typedMessage.trim() && !attachedFile}
              className="w-9 h-9 bg-[#075e54] hover:bg-[#128c7e] disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-all cursor-pointer shadow hover:shadow-md shrink-0"
              title="বার্তা পাঠান"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Customer Switcher Info */}
      <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-200 max-w-[390px] text-center">
        <p className="text-xs text-slate-500">
          বর্তমানে আপনি <strong>{currentContact.name}</strong> ({currentContact.phoneNumber}) হিসেবে চ্যাট করছেন।
        </p>
      </div>
    </div>
  );
}
