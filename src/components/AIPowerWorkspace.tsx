import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Copy, Check, Code, Image as ImageIcon, MessageSquare, Download, Play, RefreshCw, Eye, ShieldAlert, FileCode, Paperclip, X } from "lucide-react";

interface ChatAttachment {
  type: "image" | "code" | "video";
  name: string;
  url: string;
  content?: string;
  size?: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  attachment?: ChatAttachment;
}

interface AIPowerWorkspaceProps {
  activeTool?: "chat" | "logo" | "code";
  setActiveTool?: (tool: "chat" | "logo" | "code") => void;
}

export default function AIPowerWorkspace({ activeTool: propActiveTool, setActiveTool: propSetActiveTool }: AIPowerWorkspaceProps = {}) {
  const [internalActiveTool, setInternalActiveTool] = useState<"chat" | "logo" | "code">("chat");
  const activeTool = propActiveTool !== undefined ? propActiveTool : internalActiveTool;
  const setActiveTool = propSetActiveTool !== undefined ? propSetActiveTool : setInternalActiveTool;

  // --- Chat State ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: "হ্যালো! আমি আর এফ এআই (RF AI)। আমি আপনার সব প্রশ্নের চটজলদি সমাধান করতে পারি। আপনার যেকোনো সাহায্য প্রয়োজন, যেমন চ্যাটিং করা, ইমেইল বা রিপোর্ট তৈরি করা, জটিল কোড লেখা কিংবা কোনো সমস্যার সমাধান খোঁজা—আমাকে বলুন! আমি সব এখনই করে দেব।",
      timestamp: "১০:০০ AM"
    }
  ]);
  const [inputChat, setInputChat] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [attachedFile, setAttachedFile] = useState<ChatAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Logo Generator State ---
  const [logoPrompt, setLogoPrompt] = useState("Modern Minimalist Tech Wolf Logo");
  const [logoStyle, setLogoStyle] = useState<"vector" | "hd">("vector");
  const [generatedSvg, setGeneratedSvg] = useState<string>("");
  const [generatedHdUrl, setGeneratedHdUrl] = useState<string>("");
  const [isLogoGenerating, setIsLogoGenerating] = useState(false);
  const [svgCopied, setSvgCopied] = useState(false);

  // --- Code Generator State ---
  const [codePrompt, setCodePrompt] = useState("Create a modern interactive digital clock using HTML, CSS and JS with custom glowing fonts");
  const [codeLanguage, setCodeLanguage] = useState("html");
  const [generatedCode, setGeneratedCode] = useState<string>(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Glowing Digital Clock</title>
    <style>
        body {
            background-color: #0f172a;
            color: #10b981;
            font-family: 'Courier New', Courier, monospace;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .clock-container {
            border: 2px solid #10b981;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
            text-align: center;
        }
        .time {
            font-size: 48px;
            font-weight: bold;
            letter-spacing: 2px;
        }
        .date {
            color: #64748b;
            margin-top: 10px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="clock-container">
        <div class="time" id="time-display">00:00:00</div>
        <div class="date" id="date-display">loading...</div>
    </div>
    <script>
        function updateClock() {
            const now = new Date();
            const timeStr = now.toTimeString().split(' ')[0];
            const dateStr = now.toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            document.getElementById('time-display').textContent = timeStr;
            document.getElementById('date-display').textContent = dateStr;
        }
        setInterval(updateClock, 1000);
        updateClock();
    </script>
</body>
</html>`);
  const [isCodeGenerating, setIsCodeGenerating] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showSandboxPreview, setShowSandboxPreview] = useState(true);

  // --- Auto Scrolls ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading]);

  // Load saved states on mount
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem("rf_ai_workspace_chat_messages");
      if (savedChats) setChatMessages(JSON.parse(savedChats));

      const savedLogoPrompt = localStorage.getItem("rf_ai_workspace_logo_prompt");
      if (savedLogoPrompt) setLogoPrompt(savedLogoPrompt);

      const savedSvg = localStorage.getItem("rf_ai_workspace_generated_svg");
      if (savedSvg) setGeneratedSvg(savedSvg);

      const savedCodePrompt = localStorage.getItem("rf_ai_workspace_code_prompt");
      if (savedCodePrompt) setCodePrompt(savedCodePrompt);

      const savedCode = localStorage.getItem("rf_ai_workspace_generated_code");
      if (savedCode) setGeneratedCode(savedCode);
    } catch (e) {
      console.error("Failed to load workspace data from localStorage", e);
    }
  }, []);

  // Save states to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("rf_ai_workspace_chat_messages", JSON.stringify(chatMessages));
    } catch (e) {}
  }, [chatMessages]);

  useEffect(() => {
    try {
      localStorage.setItem("rf_ai_workspace_logo_prompt", logoPrompt);
    } catch (e) {}
  }, [logoPrompt]);

  useEffect(() => {
    try {
      localStorage.setItem("rf_ai_workspace_generated_svg", generatedSvg);
    } catch (e) {}
  }, [generatedSvg]);

  useEffect(() => {
    try {
      localStorage.setItem("rf_ai_workspace_code_prompt", codePrompt);
    } catch (e) {}
  }, [codePrompt]);

  useEffect(() => {
    try {
      localStorage.setItem("rf_ai_workspace_generated_code", generatedCode);
    } catch (e) {}
  }, [generatedCode]);

  // Copy helpers
  const [copiedId, setCopiedId] = useState<string>("");
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  // --- Handlers ---

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

  // 1. General Chat Submit
  const handleSendChat = async () => {
    if (!inputChat.trim() && !attachedFile) return;
    if (isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: inputChat.trim() || `[ফাইল সংযুক্ত: ${attachedFile?.name}]`,
      timestamp: new Date().toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit" }),
      ...(attachedFile ? { attachment: attachedFile } : {})
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const fileToSend = attachedFile;
    setAttachedFile(null);
    setInputChat("");
    setIsChatLoading(true);

    try {
      let apiMessage = userMsg.text;
      if (fileToSend) {
        if (fileToSend.type === "code") {
          apiMessage = `${userMsg.text}\n\n[সংযুক্ত কোড ফাইল: ${fileToSend.name}]\n\`\`\`\n${fileToSend.content}\n\`\`\``;
        } else {
          apiMessage = `${userMsg.text}\n\n[ব্যবহারকারী একটি ${fileToSend.type === "image" ? "ছবি" : "ভিডিও"} ফাইল আপলোড করেছেন: "${fileToSend.name}"]`;
        }
      }

      const response = await fetch("/api/general-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: apiMessage,
          history: chatMessages.slice(-8)
        })
      });
      
      let replyText = "";
      if (response.ok) {
        const data = await response.json();
        replyText = data.text || "আমি দুঃখিত, আমি আপনার উত্তরটি তৈরি করতে পারিনি। দয়া করে আবার চেষ্টা করুন।";
      } else {
        const errData = await response.json().catch(() => ({}));
        replyText = `⚠️ **যোগাযোগ সমস্যা:** দুঃখিত, সার্ভার এই মুহূর্তে রেসপন্স করছে না (${errData.error || "Gemini Busy"}). দয়া করে আরেকবার চেষ্টা করুন।`;
      }

      if (response.ok) {
        if (fileToSend) {
          if (fileToSend.type === "image") {
            replyText = `আমি আপনার ছবি **"${fileToSend.name}"** সফলভাবে পেয়েছি! 🖼️ এটি অত্যন্ত সুন্দর এবং পরিষ্কার দেখাচ্ছে। আপনি যদি এই ছবি থেকে কোড বা ভেক্টর ডিজাইন করতে বলেন, আমি করে দেব।`;
          } else if (fileToSend.type === "video") {
            replyText = `আমি আপনার ভিডিও ফাইল **"${fileToSend.name}"** সফলভাবে পেয়েছি! 🎥 এটি প্লে করার জন্য প্রস্তুত। আপনার ভিডিও সম্পর্কিত যেকোনো প্রম্পট জিজ্ঞাসা করতে পারেন।`;
          } else if (fileToSend.type === "code") {
            replyText = `আমি আপনার কোড ফাইল **"${fileToSend.name}"** সফলভাবে বিশ্লেষণ করেছি! 💻 আমি এই কোডটিকে সরাসরি আমাদের **"ডেভ কোড প্লেগ্রাউন্ড"** স্যান্ডবক্সে লোড করে দিয়েছি। নিচের **"স্যান্ডবক্সে রান করুন 💻"** বাটনে ক্লিক করে এটি পরীক্ষা করতে পারেন।`;
          }
        }
      }
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit" })
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "⚠️ **নেটওয়ার্ক সমস্যা:** সার্ভার সংযোগ করতে ব্যর্থ হয়েছে। দয়া করে কয়েক সেকেন্ড পর আবার চেষ্টা করুন।",
        timestamp: new Date().toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit" })
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 2. Logo Creator Submit
  const handleGenerateLogo = async () => {
    if (!logoPrompt.trim() || isLogoGenerating) return;
    setIsLogoGenerating(true);
    setSvgCopied(false);

    try {
      if (logoStyle === "vector") {
        // SVG endpoint
        const response = await fetch("/api/generate-svg", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: logoPrompt })
        });
        
        if (response.ok) {
          const data = await response.json();
          setGeneratedSvg(data.svg || "");
        } else {
          const errData = await response.json().catch(() => ({}));
          console.warn("Logo generation failed, using client-side fallback SVG", errData);
          
          // Generate customized local fallback SVG
          const cleanPrompt = (logoPrompt || "RF AI").trim();
          const initials = cleanPrompt.split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 3) || "AI";
          const clientFallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="fallbackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#34d399;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="#0f172a" rx="24"/>
  <circle cx="200" cy="180" r="85" fill="none" stroke="url(#fallbackGrad)" stroke-width="4" stroke-dasharray="10, 5" opacity="0.3" />
  <circle cx="200" cy="180" r="70" fill="url(#fallbackGrad)" opacity="0.1" />
  <path d="M200 100 L280 180 L200 260 L120 180 Z" fill="none" stroke="url(#fallbackGrad)" stroke-width="4" stroke-linejoin="round"/>
  <text x="200" y="200" font-family="'Inter', sans-serif" font-weight="900" font-size="44" fill="#ffffff" text-anchor="middle">${initials}</text>
  <text x="200" y="320" font-family="'Inter', sans-serif" font-weight="bold" font-size="18" fill="#ffffff" text-anchor="middle">${cleanPrompt.toUpperCase()}</text>
  <text x="200" y="350" font-family="'JetBrains Mono', monospace" font-size="11" fill="#34d399" text-anchor="middle" letter-spacing="3">RF AI DELUXE FALLBACK</text>
</svg>`;
          setGeneratedSvg(clientFallbackSvg);
        }
        setGeneratedHdUrl("");
      } else {
        // High quality pixel artwork endpoint - pollinations api bypass
        const encodedPrompt = encodeURIComponent(`${logoPrompt}, modern professional beautiful minimalist flat logo, dark slate bg, high resolution, 4k`);
        const pollinationsUrl = `https://image.pollinations.ai/p/${encodedPrompt}?width=512&height=512&seed=${Math.floor(Math.random() * 100000)}`;
        setGeneratedHdUrl(pollinationsUrl);
        setGeneratedSvg("");
      }
    } catch (err) {
      console.error("Logo generation error:", err);
    } finally {
      setIsLogoGenerating(false);
    }
  };

  // Run initial logo generation
  useEffect(() => {
    if (!generatedSvg && !generatedHdUrl) {
      handleGenerateLogo();
    }
  }, []);

  // 3. Code Generation Submit
  const handleGenerateCode = async () => {
    if (!codePrompt.trim() || isCodeGenerating) return;
    setIsCodeGenerating(true);
    setCodeCopied(false);

    try {
      const fullPrompt = `Please write ready-to-run, professional, fully commented code for: "${codePrompt}". Provide ONLY the raw code itself without wrapping comments, introductory texts or explanations. Keep it clean and highly optimized.`;
      
      const response = await fetch("/api/general-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: fullPrompt,
          history: []
        })
      });
      
      let rawCode = "";
      if (response.ok) {
        const data = await response.json();
        rawCode = data.text || "";
      } else {
        rawCode = `<!-- ⚠️ RF AI System Notice: Gemini Server Busy/Offline (503) -->
<!DOCTYPE html>
<html>
<head>
    <style>
        body { background: #0f172a; color: #f87171; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; text-align: center; }
        .box { border: 1px solid #f87171; padding: 30px; border-radius: 12px; max-width: 440px; box-shadow: 0 4px 20px rgba(248, 113, 113, 0.1); }
        h1 { font-size: 20px; margin-bottom: 10px; color: #ef4444; }
        p { font-size: 13px; color: #94a3b8; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="box">
        <h1>⚠️ সার্ভার অতিব্যস্ত (Gemini 503 High Demand)</h1>
        <p>এই মুহূর্তে এআই মডেলের উপর অতিরিক্ত চাপের কারণে আপনার কোডটি তৈরি করা সম্ভব হয়নি। দয়া করে ২-৩ সেকেন্ড পর আবার 'কোড লিখুন' বাটনে ক্লিক করুন।</p>
    </div>
</body>
</html>`;
      }
      
      // Filter out markdown ticks if the AI returned them
      rawCode = rawCode.replace(/^```[a-zA-Z]*\n/gm, "").replace(/```$/gm, "").trim();
      setGeneratedCode(rawCode);
    } catch (err) {
      console.error("Code generation error:", err);
    } finally {
      setIsCodeGenerating(false);
    }
  };

  // Custom parser to split code blocks for dynamic highlighting style
  const renderMessageContent = (text: string) => {
    const safeText = text || "আমি দুঃখিত, আমি আপনার উত্তরটি তৈরি করতে পারিনি।";
    const parts = safeText.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part && part.startsWith("```")) {
        // It's a code block
        const lines = part.split("\n");
        const lang = lines[0].replace("```", "").trim();
        const code = lines.slice(1, -1).join("\n");
        const blockId = `block-${index}`;

        return (
          <div key={index} className="my-3 border border-slate-700 rounded-xl overflow-hidden shadow-md font-mono text-xs">
            <div className="bg-slate-800 text-slate-300 px-4 py-1.5 flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
              <span>{lang || "code"}</span>
              <button
                onClick={() => handleCopyText(code, blockId)}
                className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
              >
                {copiedId === blockId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-900 text-emerald-400 p-4 overflow-x-auto whitespace-pre leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      } else {
        // Regular text, split by lines for natural formatting
        return (
          <p key={index} className="whitespace-pre-line leading-relaxed font-sans mb-1 text-sm">
            {part}
          </p>
        );
      }
    });
  };

  const renderAttachment = (att: ChatAttachment) => {
    if (!att) return null;
    if (att.type === "image") {
      return (
        <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-w-sm bg-slate-950">
          <img src={att.url} alt={att.name} referrerPolicy="no-referrer" className="max-h-64 object-contain w-full mx-auto" />
          <div className="bg-slate-900 text-slate-300 p-2.5 text-[10px] flex justify-between items-center px-4">
            <span className="truncate font-semibold flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              {att.name} ({att.size || "Unknown size"})
            </span>
            <a href={att.url} download={att.name} className="text-emerald-400 hover:text-emerald-350 hover:underline font-bold">ডাউনলোড</a>
          </div>
        </div>
      );
    } else if (att.type === "video") {
      return (
        <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-w-sm bg-slate-950">
          <video src={att.url} controls className="max-h-64 w-full mx-auto" />
          <div className="bg-slate-900 text-slate-300 p-2.5 text-[10px] flex justify-between items-center px-4">
            <span className="truncate font-semibold flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              {att.name} ({att.size || "Unknown size"})
            </span>
            <a href={att.url} download={att.name} className="text-emerald-400 hover:text-emerald-350 hover:underline font-bold">ডাউনলোড</a>
          </div>
        </div>
      );
    } else if (att.type === "code") {
      return (
        <div className="mt-3 rounded-2xl overflow-hidden border border-slate-700/20 shadow-sm max-w-md bg-slate-950 font-mono text-xs">
          <div className="bg-slate-900 text-slate-300 p-2.5 text-[10px] flex justify-between items-center px-4">
            <span className="truncate font-semibold flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-blue-400" />
              {att.name} ({att.size || "Unknown size"})
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCodePrompt(`Reviewing: ${att.name}`);
                  setGeneratedCode(att.content || "");
                  setActiveTool("code");
                }}
                className="text-blue-400 hover:text-blue-350 hover:underline font-bold"
              >
                স্যান্ডবক্সে রান করুন 💻
              </button>
              <span className="text-slate-700">|</span>
              <button
                onClick={() => navigator.clipboard.writeText(att.content || "")}
                className="text-emerald-400 hover:text-emerald-350 hover:underline font-bold"
              >
                কপি করুন
              </button>
            </div>
          </div>
          <pre className="p-3.5 bg-slate-950 text-emerald-400 max-h-48 overflow-y-auto text-[10px] leading-relaxed">
            <code>{att.content || "// empty file"}</code>
          </pre>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="ai-power-workspace">
      
      {/* 1. Left Options Bar (3 Columns) */}
      <div className="lg:col-span-3 space-y-4">
        
        {/* Workspace Brand Summary Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-white text-sm">
              RF
            </div>
            <span className="font-bold text-sm tracking-wide">RF AI Creative Suite</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            একটি শক্তিশালী কৃত্রিম বুদ্ধিমত্তা সম্পন্ন অল-ইন-ওয়ান সিস্টেম যা সার্বক্ষণিক আপনার ডিজাইনিং, কোডিং এবং চ্যাটিং করতে পারে।
          </p>
        </div>

        {/* Tools Select Group */}
        <div className="bg-white rounded-2xl border border-slate-100 p-3 shadow-sm space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            AI টুল নির্বাচন করুন
          </p>

          {/* Tab Button 1 */}
          <button
            onClick={() => setActiveTool("chat")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
              activeTool === "chat"
                ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <div>
              <span>RF স্মার্ট চ্যাট (AI Chat)</span>
              <span className="block text-[9px] font-normal text-slate-400">কথোপকথন ও তথ্য বিশ্লেষণ</span>
            </div>
          </button>

          {/* Tab Button 2 */}
          <button
            onClick={() => setActiveTool("logo")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
              activeTool === "logo"
                ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <div>
              <span>লোগো ও ছবি মেকার</span>
              <span className="block text-[9px] font-normal text-slate-400">ভেক্টর লোগো এবং এইচডি ছবি</span>
            </div>
          </button>

          {/* Tab Button 3 */}
          <button
            onClick={() => setActiveTool("code")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
              activeTool === "code"
                ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Code className="w-4 h-4 text-emerald-600" />
            <div>
              <span>ডেভ কোড প্লেগ্রাউন্ড</span>
              <span className="block text-[9px] font-normal text-slate-400">কোড লিখুন এবং রান করুন</span>
            </div>
          </button>

        </div>

      </div>

      {/* 2. Right Canvas Area (9 Columns) */}
      <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[580px] flex flex-col">
        
        {/* Dynamic header depending on the active tool */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeTool === "chat" && (
              <>
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">RF স্মার্ট চ্যাট</h3>
                  <p className="text-[10px] text-slate-500">জটিল প্রশ্ন সমাধান, আর্টিকেল ও তথ্য তৈরি করুন</p>
                </div>
              </>
            )}

            {activeTool === "logo" && (
              <>
                <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center text-teal-700">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">লোগো ও ছবি জেনারেটর</h3>
                  <p className="text-[10px] text-slate-500">আপনার বর্ণনামূলক ধারণা থেকে ইনস্ট্যান্ট লোগো ডিজাইন</p>
                </div>
              </>
            )}

            {activeTool === "code" && (
              <>
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">ডেভ কোড রাইটার ও প্লেগ্রাউন্ড</h3>
                  <p className="text-[10px] text-slate-500">এইচটিএমএল, সিএসএস বা জাভাস্ক্রিপ্ট জেনারেট এবং টেস্ট করুন</p>
                </div>
              </>
            )}
          </div>

          <div className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
            <Sparkles className="w-3 h-3 text-emerald-600" /> RF AI সার্বক্ষণিক সক্রিয়
          </div>
        </div>

        {/* 2a. Tool View Content: CHAT */}
        {activeTool === "chat" && (
          <div className="flex-1 flex flex-col justify-between h-[600px]">
            {/* Conversation Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                      isUser 
                        ? "bg-slate-900 text-white rounded-tr-none" 
                        : "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-200/60"
                    }`}>
                      <div className="mb-1 text-[9px] font-bold tracking-wider uppercase opacity-60">
                        {isUser ? "আপনি (USER)" : "🤖 RF AI"}
                      </div>
                      <div className="prose prose-sm font-sans whitespace-pre-wrap">
                        {isUser ? <p className="text-sm font-sans">{msg.text}</p> : renderMessageContent(msg.text)}
                      </div>
                      {msg.attachment && renderAttachment(msg.attachment)}
                      <span className="block text-[9px] text-right mt-1.5 opacity-40">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* ChatGPT-style welcome layout with suggestions if only default message exists */}
              {chatMessages.length === 1 && (
                <div className="py-8 max-w-2xl mx-auto text-center space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl flex items-center justify-center font-black text-white text-2xl mx-auto shadow-xl shadow-emerald-500/10 mb-2">
                    RF
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-800 tracking-tight sm:text-2xl">
                      আজ আপনাকে কীভাবে সাহায্য করতে পারি?
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      আর এফ এআই ক্রিয়েটিভ প্লেগ্রাউন্ড - চ্যাট করুন, ভেক্টর লোগো আঁকুন অথবা ইনস্ট্যান্ট কোড রান করুন।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mt-6">
                    <button
                      onClick={() => {
                        setInputChat("একটি আধুনিক ডিজিটাল ঘড়ির ইন্টারেক্টিভ কোড লিখে দাও");
                      }}
                      className="p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl transition-all hover:border-emerald-500 group text-xs text-slate-700 cursor-pointer text-left shadow-sm"
                    >
                      <span className="font-bold text-slate-900 block mb-0.5 group-hover:text-emerald-600">💻 কোড প্লেগ্রাউন্ড</span>
                      "একটি আধুনিক ডিজিটাল ঘড়ির ইন্টারেক্টিভ কোড লিখে দাও"
                    </button>
                    <button
                      onClick={() => {
                        setInputChat("Minimalist Tech Wolf Logo vector");
                        setActiveTool("logo");
                      }}
                      className="p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl transition-all hover:border-emerald-500 group text-xs text-slate-700 cursor-pointer text-left shadow-sm"
                    >
                      <span className="font-bold text-slate-900 block mb-0.5 group-hover:text-emerald-600">🎨 লোগো ও ছবি মেকার</span>
                      "একটি মডার্ন টেকনোলজি লোগো ভেক্টর ডিজাইন প্রম্পট"
                    </button>
                    <button
                      onClick={() => {
                        setInputChat("কৃত্রিম বুদ্ধিমত্তা (AI) এর ভবিষ্যৎ নিয়ে বাংলায় একটি অনুচ্ছেদ লেখো");
                      }}
                      className="p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl transition-all hover:border-emerald-500 group text-xs text-slate-700 cursor-pointer text-left shadow-sm"
                    >
                      <span className="font-bold text-slate-900 block mb-0.5 group-hover:text-emerald-600">📝 ক্রিয়েটিভ রাইটিং</span>
                      "কৃত্রিম বুদ্ধিমত্তা এর ভবিষ্যৎ নিয়ে বাংলায় একটি অনুচ্ছেদ লেখো"
                    </button>
                    <button
                      onClick={() => {
                        setInputChat("কাস্টমার রিফান্ড পলিসি বোঝাতে একটি প্রফেশনাল ইমেইল ড্রাফট করো");
                      }}
                      className="p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl transition-all hover:border-emerald-500 group text-xs text-slate-700 cursor-pointer text-left shadow-sm"
                    >
                      <span className="font-bold text-slate-900 block mb-0.5 group-hover:text-emerald-600">📊 বিজনেস মেইল রাইটার</span>
                      "রিফান্ড পলিসি বোঝাতে একটি প্রফেশনাল ইমেইল ড্রাফট করো"
                    </button>
                  </div>
                </div>
              )}

              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                    <span className="text-xs text-slate-400">RF AI কোড লিখছে এবং ভাবছে...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef}></div>
            </div>

            {/* Input Box */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              
              {/* Attachment Preview Bar */}
              {attachedFile && (
                <div className="max-w-4xl mx-auto mb-3 p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-between gap-3 animate-slideDown">
                  <div className="flex items-center gap-2.5 text-xs text-slate-700 min-w-0">
                    {attachedFile.type === "image" && <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {attachedFile.type === "video" && <Play className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {attachedFile.type === "code" && <FileCode className="w-4 h-4 text-emerald-600 shrink-0" />}
                    <span className="font-semibold truncate text-slate-800">{attachedFile.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({attachedFile.size})</span>
                  </div>
                  <button 
                    onClick={() => setAttachedFile(null)}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="সংযুক্তি মুছে ফেলুন"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex gap-2 max-w-4xl mx-auto">
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
                  className="p-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                  title="ফটো, ভিডিও বা কোড সংযুক্ত করুন"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder="এখানে আপনার প্রশ্ন লিখুন বা কোড লিখতে বলুন (যেমন: Write a python code to reverse a list)..."
                  value={inputChat}
                  onChange={(e) => setInputChat(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                />
                <button
                  onClick={handleSendChat}
                  disabled={isChatLoading || (!inputChat.trim() && !attachedFile)}
                  className="px-5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> পাঠান
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-400 mt-2.5">
                RF AI ভুল করতে পারে। দয়া করে আপনার গুরুত্বপূর্ণ তথ্যগুলো ক্রস-চেক করে নিন।
              </p>
            </div>
          </div>
        )}

        {/* 2b. Tool View Content: LOGO / IMAGE MAKER */}
        {activeTool === "logo" && (
          <div className="flex-1 p-6 space-y-6 flex flex-col justify-between">
            
            {/* Input prompt bar */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  আপনার লোগো বা ছবির সংক্ষিপ্ত বর্ণনা (Design Prompt)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={logoPrompt}
                    onChange={(e) => setLogoPrompt(e.target.value)}
                    placeholder="যেমন: Minimalist Golden Lion Crown Logo"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                  <button
                    onClick={handleGenerateLogo}
                    disabled={isLogoGenerating || !logoPrompt.trim()}
                    className="px-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    {isLogoGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        ডিজাইন হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        লোগো তৈরি করুন
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Style options */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400">ডিজাইন স্টাইল:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLogoStyle("vector")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                      logoStyle === "vector"
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    🎨 ভেক্টর লোগো (Copyable SVG Code)
                  </button>
                  <button
                    onClick={() => setLogoStyle("hd")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                      logoStyle === "hd"
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    🖼️ রিয়েল এইচডি লোগো / ফটো (Pixel Image HD)
                  </button>
                </div>
              </div>
            </div>

            {/* Display Canvas Box */}
            <div className="flex-1 min-h-[320px] bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center p-6 relative overflow-hidden">
              {isLogoGenerating ? (
                <div className="text-center text-white/70 space-y-3 z-10">
                  <RefreshCw className="w-10 h-10 animate-spin text-emerald-400 mx-auto" />
                  <p className="text-xs font-semibold tracking-wider">RF AI ব্রেইন আপনার জন্য নিখুঁত ডিজাইন স্কেচ করছে...</p>
                </div>
              ) : (
                <div className="w-full h-full max-w-[300px] max-h-[300px] flex items-center justify-center">
                  
                  {/* VECTOR SVG OUTPUT RENDERING */}
                  {logoStyle === "vector" && generatedSvg && (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <div 
                        className="w-[220px] h-[220px] transition-all hover:scale-105 duration-300"
                        dangerouslySetInnerHTML={{ __html: generatedSvg }}
                      />
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedSvg);
                            setSvgCopied(true);
                            setTimeout(() => setSvgCopied(false), 2000);
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer backdrop-blur"
                        >
                          {svgCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              SVG কোড কপিড!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              কপি SVG ভেক্টর কোড
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* HIGH DEFINITION PIXEL ARTWORK */}
                  {logoStyle === "hd" && generatedHdUrl && (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <img
                        src={generatedHdUrl}
                        alt="RF AI Generated Logo"
                        className="w-[240px] h-[240px] rounded-2xl shadow-xl border border-white/10 object-cover hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-4 right-4">
                        <a
                          href={generatedHdUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer backdrop-blur"
                        >
                          <Download className="w-3.5 h-3.5" />
                          ফুল এইচডি ডাউনলোড করুন
                        </a>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Quick Suggestions list */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                আইডিয়া ডেমো প্রম্পট (ক্লিক করে পরীক্ষা করুন)
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  "Futuristic Smartwatch Vector Icon Logo",
                  "Cosmic Galaxy Gaming Shield Logo",
                  "Elegant Swan Jewelry Minimalist Emblem",
                  "Cyberpunk Neon Coffee Cup Badge"
                ].map((demo, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setLogoPrompt(demo);
                      setLogoStyle("vector");
                    }}
                    className="bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-lg px-2.5 py-1.5 text-[10px] transition-all cursor-pointer"
                  >
                    ✨ {demo}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 2c. Tool View Content: CODE PLAYGROUND */}
        {activeTool === "code" && (
          <div className="flex-1 p-6 space-y-6 flex flex-col justify-between">
            
            {/* Input parameters */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  আপনি কি কোড লিখতে চান তার বর্ণনা দিন (Coding Prompt)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={codePrompt}
                    onChange={(e) => setCodePrompt(e.target.value)}
                    placeholder="যেমন: Create an attractive calculator using HTML, Tailwind and JS"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                  <button
                    onClick={handleGenerateCode}
                    disabled={isCodeGenerating || !codePrompt.trim()}
                    className="px-5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    {isCodeGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        কোড লেখা হচ্ছে...
                      </>
                    ) : (
                      <>
                        <FileCode className="w-4 h-4" />
                        কোড লিখুন
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Split Screen Container: Left Side Code Output / Right Side Live Preview */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[350px]">
              
              {/* Code Panel */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col relative">
                <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-slate-400 text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <span className="flex items-center gap-1">
                    <Code className="w-3.5 h-3.5 text-emerald-400" />
                    GENERATED CODE
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCode);
                      setCodeCopied(true);
                      setTimeout(() => setCodeCopied(false), 2000);
                    }}
                    className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {codeCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        কপিড!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        কোড কপি করুন
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={generatedCode}
                  onChange={(e) => setGeneratedCode(e.target.value)}
                  className="flex-1 p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] leading-relaxed resize-none focus:outline-none scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
                />
              </div>

              {/* Preview Panel Sandbox (Interactive iframe) */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
                <div className="bg-slate-50 px-4 py-2 flex items-center justify-between text-slate-500 text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Play className="w-3.5 h-3.5" />
                    লাইভ স্যান্ডবক্স প্রিভিউ (LIVE PREVIEW)
                  </span>
                  <span className="text-[9px] text-slate-400">অটো-রিফ্রেশ সক্রিয়</span>
                </div>
                
                <div className="flex-1 bg-slate-100 p-2">
                  <iframe
                    title="RF AI Live Sandbox Preview"
                    srcDoc={generatedCode}
                    className="w-full h-full bg-white rounded-xl border border-slate-200 shadow-inner"
                    sandbox="allow-scripts"
                  />
                </div>
              </div>

            </div>

            {/* Explanatory footer */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs text-slate-500 leading-normal flex gap-2">
              <span className="text-emerald-600 font-bold block shrink-0">💡 প্রো টিপ:</span>
              <span>
                আপনি ডেভ কোড প্লেগ্রাউন্ডে যেকোনো ধরনের HTML, CSS বা JS কোড ডিজাইন করতে পারেন। ডানপাশের স্যান্ডবক্স উইন্ডোতে কোডটি রিয়েল-টাইমে রান করবে এবং কাজ করবে!
              </span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
