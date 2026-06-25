import React, { useState, useEffect } from "react";
import { KnowledgeBase, FAQItem } from "../types";
import { Save, Plus, Trash2, HelpCircle, FileText, Settings, Sparkles } from "lucide-react";

interface KnowledgeBaseEditorProps {
  onUpdate: (kb: KnowledgeBase) => void;
  isLoading: boolean;
}

export default function KnowledgeBaseEditor({ onUpdate, isLoading }: KnowledgeBaseEditorProps) {
  const [kb, setKb] = useState<KnowledgeBase>({
    companyName: "",
    businessType: "",
    businessHours: "",
    contactInfo: "",
    productsAndPricing: "",
    refundPolicy: "",
    faqs: [],
    systemInstructions: ""
  });

  const [saving, setSaving] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch initial knowledge base
  useEffect(() => {
    fetch("/api/knowledge")
      .then((res) => res.json())
      .then((data) => {
        setKb(data);
      })
      .catch((err) => console.error("Error loading knowledge base:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setKb((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const newFaq: FAQItem = {
      id: Date.now().toString(),
      question: newQuestion.trim(),
      answer: newAnswer.trim()
    };
    setKb((prev) => ({
      ...prev,
      faqs: [...prev.faqs, newFaq]
    }));
    setNewQuestion("");
    setNewAnswer("");
  };

  const handleRemoveFaq = (id: string) => {
    setKb((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((f) => f.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    try {
      const response = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kb)
      });
      const data = await response.json();
      if (data.success) {
        setKb(data.knowledge);
        onUpdate(data.knowledge);
        setSuccessMsg("আর এফ এআই (RF AI) এর মেমোরি সফলভাবে আপডেট করা হয়েছে! ✨");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Error saving knowledge base:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="kb-editor">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-300" />
            RF AI ব্রেইন টিউনিং (Knowledge Base)
          </h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            আপনার ব্যবসা অনুযায়ী RF AI কে ট্রেইন করুন। এখানে যা লিখবেন AI গ্রাহকদের তাই উত্তর দিবে।
          </p>
        </div>
        <div className="bg-emerald-500/30 px-3 py-1 rounded-full text-xs font-medium border border-emerald-400/20">
          সক্রিয় ৩.৫ ফ্ল্যাশ
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 text-sm font-medium animate-pulse flex items-center gap-2">
            <span>✨</span> {successMsg}
          </div>
        )}

        {/* Basic Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              কোম্পানির নাম (Company Name)
            </label>
            <input
              type="text"
              name="companyName"
              value={kb.companyName}
              onChange={handleChange}
              placeholder="যেমন: আর এফ এন্টারপ্রাইজ"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              ব্যবসার ধরন (Business Type)
            </label>
            <input
              type="text"
              name="businessType"
              value={kb.businessType}
              onChange={handleChange}
              placeholder="যেমন: কাপড়ের দোকান, ই-কমার্স বা রেস্টুরেন্ট"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              কার্যদিবস ও সময় (Operating Hours)
            </label>
            <input
              type="text"
              name="businessHours"
              value={kb.businessHours}
              onChange={handleChange}
              placeholder="যেমন: সকাল ১০:০০ টা - রাত ৮:০০ টা (শুক্রবার বন্ধ)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              যোগাযোগের তথ্য (Contact Info)
            </label>
            <input
              type="text"
              name="contactInfo"
              value={kb.contactInfo}
              onChange={handleChange}
              placeholder="যেমন: ফোন নাম্বার, ইমেইল এবং শোরুমের ঠিকানা"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              required
            />
          </div>
        </div>

        {/* Detailed Guidelines */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600" />
            পণ্য তালিকা এবং মূল্য (Products & Pricing)
          </label>
          <textarea
            name="productsAndPricing"
            value={kb.productsAndPricing}
            onChange={handleChange}
            rows={4}
            placeholder="আপনার প্রধান প্রোডাক্টগুলোর নাম এবং তাদের দাম এখানে লিখুন। প্রতি লাইনে ১টি পণ্য লিখুন..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-sans"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-emerald-600" />
            রিফান্ড এবং রিটার্ন পলিসি (Refund & Return Policy)
          </label>
          <textarea
            name="refundPolicy"
            value={kb.refundPolicy}
            onChange={handleChange}
            rows={3}
            placeholder="আপনার কোম্পানির রিটার্ন, ওয়ারেন্টি অথবা ক্যাশ রিফান্ড সম্পর্কিত তথ্যসমূহ..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-sans"
            required
          />
        </div>

        {/* Custom FAQs Section */}
        <div className="border-t border-slate-100 pt-6">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            ঘনঘন জিজ্ঞাসিত প্রশ্ন ও উত্তর (Custom FAQs)
          </label>
          
          <div className="space-y-3 mb-4 max-h-[220px] overflow-y-auto pr-2">
            {kb.faqs.map((faq) => (
              <div key={faq.id} className="flex gap-3 items-start justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-sm">
                  <div className="font-bold text-slate-800 flex gap-2">
                    <span className="text-emerald-600 font-medium">Q:</span>
                    {faq.question}
                  </div>
                  <div className="text-slate-600 mt-1 flex gap-2">
                    <span className="text-teal-600 font-medium">A:</span>
                    {faq.answer}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFaq(faq.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="ডিলিট করুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {kb.faqs.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50/50 rounded-xl">
                কোনো কাস্টম FAQ যুক্ত করা হয়নি। নিচে নতুন প্রশ্ন যুক্ত করুন।
              </p>
            )}
          </div>

          {/* Add FAQ form */}
          <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/50 space-y-3">
            <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> কাস্টম প্রশ্ন ও উত্তর যুক্ত করুন
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="গ্রাহকের প্রশ্ন (যেমন: ডেলিভারি পেতে কতদিন লাগে?)"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              />
              <input
                type="text"
                placeholder="উত্তর (যেমন: ঢাকার ভেতরে ১ দিন, বাইরে ৩ দিন সময় লাগবে।)"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>
            <button
              type="button"
              onClick={handleAddFaq}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow"
            >
              <Plus className="w-4 h-4" /> FAQ লিস্টে যুক্ত করুন
            </button>
          </div>
        </div>

        {/* AI System Instructions Override */}
        <div className="border-t border-slate-100 pt-6">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            RF AI এর ব্যক্তিত্ব ও আচরণ নির্দেশাবলী (System Instructions)
          </label>
          <textarea
            name="systemInstructions"
            value={kb.systemInstructions}
            onChange={handleChange}
            rows={3}
            placeholder="যেমন: You are RF AI, a polite customer assistant..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs font-mono bg-slate-50/50"
            required
          />
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving || isLoading}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? "ব্রেইন টিউনিং হচ্ছে..." : "AI ব্রেইন মেমোরি আপডেট করুন"}
          </button>
        </div>
      </form>
    </div>
  );
}
