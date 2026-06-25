import { useState, useEffect } from "react";
import { Contact, Message, KnowledgeBase, MessageAttachment } from "./types";
import KnowledgeBaseEditor from "./components/KnowledgeBaseEditor";
import CustomerSimulator from "./components/CustomerSimulator";
import AgentDashboard from "./components/AgentDashboard";
import AIPowerWorkspace from "./components/AIPowerWorkspace";
import { 
  Sparkles, MessageSquare, Database, Settings, ShieldAlert, CheckCircle2, 
  Clock, HelpCircle, Laptop, UserCheck, RefreshCw, Layers, Brain, LogOut
} from "lucide-react";
import { auth } from "./lib/firebase";
import { User, signOut } from "firebase/auth";
import AuthScreen from "./components/AuthScreen";

// Initial mock contacts/chats
const INITIAL_CONTACTS: Contact[] = [
  {
    id: "c1",
    name: "রহমান কবির (Rahman Kabir)",
    phoneNumber: "+880 1711-223344",
    avatar: "👨‍💼",
    unreadCount: 0,
    lastMessage: "আপনাদের শোরুম কি আজকে খোলা আছে?",
    lastMessageTime: "সকাল ১০:১৫",
    messages: [
      { id: "m1", sender: "customer", text: "আসসালামু আলাইকুম, আমি আর এফ গিয়ার থেকে একটি স্মার্টওয়াচ নিতে চাই।", timestamp: "সকাল ১০:১০", status: "read" },
      { id: "m2", sender: "ai", text: "ওয়ালাইকুম আসসালাম! আর এফ টেক অ্যান্ড গ্যাজেটসে আপনাকে স্বাগতম। আমাদের অত্যন্ত জনপ্রিয় 'RF Wave Smartwatch' স্টক এ রয়েছে। এটার মূল্য মাত্র ৪,৫০০ টাকা। আপনি কি এটি অর্ডার করতে চান?", timestamp: "সকাল ১০:১১", status: "read" },
      { id: "m3", sender: "customer", text: "আপনাদের শোরুম কি আজকে খোলা আছে? আমি সরাসরি এসে নিতে চাচ্ছি।", timestamp: "সকাল ১০:১৫", status: "read" }
    ],
    category: "sales",
    priority: "high",
    status: "active",
    aiAutoPilot: true
  },
  {
    id: "c2",
    name: "মেহেদী হাসান (Mehedi Hasan)",
    phoneNumber: "+880 1812-998877",
    avatar: "🧑‍💻",
    unreadCount: 1,
    lastMessage: "RF Pro Max ফোনের দাম কত টাকা?",
    lastMessageTime: "সকাল ০৯:৪৫",
    messages: [
      { id: "m4", sender: "customer", text: "হ্যালো, RF Pro Max ফোনের দাম কত টাকা? আর হোম ডেলিভারি হবে কি?", timestamp: "সকাল ০৯:৪৫", status: "delivered" }
    ],
    category: "support",
    priority: "medium",
    status: "active",
    aiAutoPilot: true
  },
  {
    id: "c3",
    name: "Samantha Rose",
    phoneNumber: "+880 1515-443322",
    avatar: "👩",
    unreadCount: 0,
    lastMessage: "Do you have any warranty on your products?",
    lastMessageTime: "গতকাল",
    messages: [
      { id: "m5", sender: "customer", text: "Hi, do you have any warranty on your products?", timestamp: "গতকাল", status: "read" },
      { id: "m6", sender: "ai", text: "Hello Samantha! Yes, we offer a 7-day replacement warranty for all products if there are any technical issues. Please keep the original invoice and packaging safe for returns.", timestamp: "গতকাল", status: "read" }
    ],
    category: "general",
    priority: "low",
    status: "resolved",
    aiAutoPilot: true
  }
];

const PRESET_MOCK_CUSTOMERS = [
  { name: "নিলয় দাস (Niloy Das)", phone: "+880 1912-334455", avatar: "👨", text: "আপনাদের রিফান্ড পলিসি কি? আমি ৩ দিন আগে পণ্য কিনেছিলাম।" },
  { name: "মমতাজ বেগম (Momtaz)", phone: "+880 1611-778899", avatar: "👩‍🦳", text: "আমি একটি ইয়ারবাড অর্ডার করতে চাই। ঢাকার বাইরে ডেলিভারি চার্জ কত?" },
  { name: "Anika Rahman", phone: "+880 1313-556677", avatar: "👩‍🦰", text: "Hello, do you accept cash on delivery in Chittagong?" }
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "logo" | "code" | "simulator">("chat");
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem("rf_ai_contacts");
      return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
    } catch (e) {
      return INITIAL_CONTACTS;
    }
  });
  const [selectedContactId, setSelectedContactId] = useState<string>(() => {
    try {
      return localStorage.getItem("rf_ai_selected_contact_id") || "c1";
    } catch (e) {
      return "c1";
    }
  });

  // Save contacts and selected ID on changes
  useEffect(() => {
    try {
      localStorage.setItem("rf_ai_contacts", JSON.stringify(contacts));
    } catch (e) {
      console.error("Failed to save contacts to localStorage", e);
    }
  }, [contacts]);

  useEffect(() => {
    try {
      localStorage.setItem("rf_ai_selected_contact_id", selectedContactId);
    } catch (e) {
      console.error("Failed to save selectedContactId to localStorage", e);
    }
  }, [selectedContactId]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [usingRealGemini, setUsingRealGemini] = useState<boolean>(false);
  const [systemTime, setSystemTime] = useState<string>("");

  // Check backend server status and real Gemini connectivity
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setUsingRealGemini(data.usingRealGemini);
      })
      .catch((err) => console.error("Error connecting to server:", err));

    // Format current time dynamically
    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch initial knowledge base configuration
  useEffect(() => {
    fetch("/api/knowledge")
      .then((res) => res.json())
      .then((data) => {
        setKnowledgeBase(data);
      })
      .catch((err) => console.error("Error loading knowledge base:", err));
  }, []);

  const handleKnowledgeUpdate = (updatedKb: KnowledgeBase) => {
    setKnowledgeBase(updatedKb);
  };

  // Switch between contacts in the dashboard/simulator
  const handleSelectContact = (id: string) => {
    setSelectedContactId(id);
    
    // Clear unread count when clicking on a contact
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Trigger classification of customer issue via backend endpoint
  const triggerAiCategorization = async (contactId: string, updatedMessages: Message[]) => {
    try {
      const response = await fetch("/api/analyze-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });
      const data = await response.json();
      
      setContacts((prev) =>
        prev.map((c) =>
          c.id === contactId
            ? { 
                ...c, 
                category: data.category || c.category, 
                priority: data.priority || c.priority 
              }
            : c
        )
      );
    } catch (e) {
      console.error("AI Categorization failed:", e);
    }
  };

  // Handle a new message from the Customer Simulator
  const handleNewCustomerMessage = async (msgText: string, attachment?: MessageAttachment) => {
    const timestampStr = new Date().toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit" });
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "customer",
      text: msgText || (attachment ? `[সংযুক্ত ফাইল: ${attachment.name}]` : ""),
      timestamp: timestampStr,
      status: "sent",
      ...(attachment ? { attachment } : {})
    };

    // Update contacts list with the new message
    let updatedContact: Contact | undefined;
    setContacts((prev) => {
      return prev.map((c) => {
        if (c.id === selectedContactId) {
          const updatedMessages = [...c.messages, newMessage];
          updatedContact = {
            ...c,
            messages: updatedMessages,
            lastMessage: newMessage.text,
            lastMessageTime: timestampStr,
            unreadCount: activeTab !== "simulator" ? c.unreadCount + 1 : 0
          };
          return updatedContact;
        }
        return c;
      });
    });

    // If AI Auto-pilot is enabled for this chat, trigger AI reply
    const currentContact = contacts.find((c) => c.id === selectedContactId);
    if (currentContact && currentContact.aiAutoPilot) {
      setIsAiTyping(true);
      try {
        // Send previous chat history of this contact to keep conversational state consistent
        const historyContext = currentContact.messages.slice(-5); // Last 5 messages context

        let apiMessage = newMessage.text;
        if (attachment) {
          if (attachment.type === "code") {
            apiMessage = `${newMessage.text}\n\n[সংযুক্ত কোড ফাইলের নাম: ${attachment.name}]\n\`\`\`\n${attachment.content}\n\`\`\``;
          } else {
            apiMessage = `${newMessage.text}\n\n[গ্রাহক একটি ${attachment.type === "image" ? "ছবি" : "ভিডিও"} ফাইল সংযুক্ত করেছেন: "${attachment.name}"]`;
          }
        }

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: apiMessage,
            customerName: currentContact.name,
            history: historyContext,
            knowledge: knowledgeBase
          })
        });

        const data = await response.json();
        
        let responseText = data.text;
        
        // Custom smart simulated answers if using mock/fallback mode
        if (response.ok && data.mock && attachment) {
          if (attachment.type === "image") {
            responseText = `আপনার পাঠানো ছবিটি (**"${attachment.name}"**) আমি পেয়েছি! 🖼️ 

এটি আমাদের সাপোর্ট এবং কোয়ালিটি কন্ট্রোল টিমের কাছে পাঠানো হয়েছে। আমাদের ওয়ারেন্টি পলিসি অনুযায়ী, পণ্য ক্রয়ের ৭ দিনের মধ্যে কোনো সমস্যা হলে আমরা এটি বিনামূল্যে পরিবর্তন (রিপ্লেসমেন্ট) করে দেব। আমাদের হিউম্যান এজেন্ট খুব শীঘ্রই আপনার সাথে যোগাযোগ করবে।`;
          } else if (attachment.type === "video") {
            responseText = `আপনার পাঠানো ভিডিও ফাইলটি (**"${attachment.name}"**) সফলভাবে আমাদের সার্ভারে আপলোড হয়েছে! 🎥 

আমাদের সাপোর্ট টিম ভিডিওটি দেখছে। যেকোনো টেকনিক্যাল সমস্যা সমাধান করতে আমরা ২৪ ঘণ্টার মধ্যে আপনাকে আপডেট জানাবো। ধন্যবাদ আমাদের সাথে থাকার জন্য!`;
          } else if (attachment.type === "code") {
            responseText = `আপনার পাঠানো কোড ফাইলটি (**"${attachment.name}"**) সফলভাবে এনালাইসিস করা হয়েছে! 💻 

কোডটি আমি আমাদের ডেভ স্যান্ডবক্সে লোড করে রেখেছি। আমাদের টেকনিক্যাল টিম এটি রিভিউ করছে এবং অতি দ্রুত সমাধান নিয়ে আপনার সাথে চ্যাটে যুক্ত হবে।`;
          }
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: responseText,
          timestamp: new Date().toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit" }),
          status: "read"
        };

        setContacts((prev) =>
          prev.map((c) => {
            if (c.id === selectedContactId) {
              const updatedMessages = [...c.messages, aiMessage];
              
              // Run category & priority analysis asynchronously in background
              triggerAiCategorization(c.id, updatedMessages);

              return {
                ...c,
                messages: updatedMessages,
                lastMessage: aiMessage.text,
                lastMessageTime: aiMessage.timestamp
              };
            }
            return c;
          })
        );
      } catch (err) {
        console.error("Failed to fetch AI reply:", err);
      } finally {
        setIsAiTyping(false);
      }
    }
  };

  // Toggle Auto-pilot mode on and off
  const handleToggleAutoPilot = (id: string) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, aiAutoPilot: !c.aiAutoPilot } : c
      )
    );
  };

  // Handle human/admin reply from the Agent Dashboard
  const handleAdminReply = (contactId: string, text: string) => {
    const timestampStr = new Date().toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit" });
    const replyMessage: Message = {
      id: Date.now().toString(),
      sender: "agent",
      text: text,
      timestamp: timestampStr,
      status: "read"
    };

    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === contactId) {
          return {
            ...c,
            messages: [...c.messages, replyMessage],
            lastMessage: text,
            lastMessageTime: timestampStr
          };
        }
        return c;
      })
    );
  };

  // Generate a mock simulated new customer on demand
  const handleTriggerSimulatedCustomer = () => {
    const presetIdx = Math.floor(Math.random() * PRESET_MOCK_CUSTOMERS.length);
    const preset = PRESET_MOCK_CUSTOMERS[presetIdx];
    const newId = `c_new_${Date.now()}`;
    const timestampStr = new Date().toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit" });

    const newContact: Contact = {
      id: newId,
      name: `${preset.name} (${Math.floor(1000 + Math.random() * 9000)})`,
      phoneNumber: preset.phone,
      avatar: preset.avatar,
      unreadCount: 1,
      lastMessage: preset.text,
      lastMessageTime: timestampStr,
      messages: [
        { id: Date.now().toString(), sender: "customer", text: preset.text, timestamp: timestampStr, status: "delivered" }
      ],
      category: "unassigned",
      priority: "medium",
      status: "active",
      aiAutoPilot: true
    };

    setContacts((prev) => [newContact, ...prev]);
    setSelectedContactId(newId);

    // Prompt user on the screen about incoming chat
    setActiveTab("simulator");
  };

  const selectedContact = contacts.find((c) => c.id === selectedContactId) || contacts[0];

  if (!user) {
    return <AuthScreen onAuthSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex" id="app-root">
      
      {/* ChatGPT-style Left Sidebar (Persistent on Desktop, Responsive) */}
      <aside className="w-72 bg-[#090d16] border-r border-slate-800 text-slate-300 flex-col shrink-0 hidden md:flex selection:bg-emerald-500/20">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center font-black text-white text-base shadow-lg shadow-emerald-500/15 animate-pulse">
            RF
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-wide uppercase">RF AI Deluxe</h1>
            <p className="text-[10px] text-slate-500">ক্রিয়েটিভ এআই সিস্টেম</p>
          </div>
        </div>

        {/* Action Button: New Chat */}
        <div className="p-4">
          <button
            onClick={() => {
              setActiveTab("chat");
              // Quick reload/reset simulation by resetting tool
            }}
            className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs font-bold py-3 px-4 rounded-xl text-emerald-400 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            + নতুন চ্যাট তৈরি করুন (New Chat)
          </button>
        </div>

        {/* Sidebar Menu Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 py-2">
            এআই ক্রিয়েটিভ প্লেগ্রাউন্ড
          </p>

          <button
            onClick={() => setActiveTab("chat")}
            className={`w-full text-left px-3 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
              activeTab === "chat"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
            }`}
          >
            <Brain className="w-4 h-4 text-emerald-500" />
            💬 আর এফ এআই চ্যাট (Smart Chat)
          </button>

          <button
            onClick={() => setActiveTab("logo")}
            className={`w-full text-left px-3 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
              activeTab === "logo"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-500" />
            🎨 ভেক্টর লোগো মেকার (Logo Studio)
          </button>

          <button
            onClick={() => setActiveTab("code")}
            className={`w-full text-left px-3 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
              activeTab === "code"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-500" />
            💻 ডেভ কোড প্লেগ্রাউন্ড (Sandbox)
          </button>

          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 pt-4 pb-2">
            হোয়াটসঅ্যাপ অটোমেশন
          </p>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`w-full text-left px-3 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
              activeTab === "simulator"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            📱 কাস্টমার সিমুলেটর (WhatsApp)
          </button>

        </nav>

        {/* Sidebar Footer Details */}
        <div className="p-4 border-t border-slate-850/60 space-y-3.5 bg-slate-950/40">
          
          {/* User badge */}
          {user && (
            <div className="flex items-center gap-2.5 bg-slate-900/85 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200">
              <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-[10px] text-white font-black">
                {user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : "U")}
              </div>
              <div className="truncate flex-1">
                <p className="font-bold text-slate-200 leading-none">{user.displayName || "User"}</p>
                <p className="text-[9px] text-slate-500 truncate mt-0.5">{user.email}</p>
              </div>
            </div>
          )}

          {/* Model connections */}
          <div className="space-y-1.5">
            {usingRealGemini ? (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold px-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Gemini ২.৫ ফ্ল্যাশ সক্রিয়
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-semibold px-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                ডেমো সিমুলেশন চ্যাট
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 px-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {systemTime || "১২:০০ PM"}
            </div>
          </div>

          {/* Logout Trigger */}
          {user && (
            <button
              onClick={async () => {
                await signOut(auth);
                setUser(null);
              }}
              className="w-full flex items-center justify-center gap-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              সিস্টেম থেকে লগআউট
            </button>
          )}

        </div>

      </aside>

      {/* Main Right Content Panel */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Mobile Navbar Header */}
        <header className="bg-slate-900 border-b border-slate-800 py-3.5 px-4 flex md:hidden items-center justify-between text-white select-none shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">
              RF
            </div>
            <span className="font-extrabold text-sm tracking-wide">RF AI Creative</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick trigger switch tabs for mobile convenience */}
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="bg-slate-850 border border-slate-700 text-xs text-slate-200 py-1.5 px-2.5 rounded-xl focus:outline-none"
            >
              <option value="chat">💬 চ্যাট রুম (Smart Chat)</option>
              <option value="logo">🎨 লোগো মেকার (Logo Maker)</option>
              <option value="code">💻 কোড প্লেগ্রাউন্ড (Sandbox)</option>
              <option value="simulator">📱 কাস্টমার সিমুলেটর</option>
            </select>

            {user && (
              <button
                onClick={async () => {
                  await signOut(auth);
                  setUser(null);
                }}
                className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg"
                title="লগআউট"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Top Mini status info bar on desktop */}
        <header className="bg-white border-b border-slate-200/80 px-8 py-4 flex items-center justify-between shrink-0 hidden md:flex select-none">
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              {activeTab === "chat" && "💬 RF স্মার্ট চ্যাট (AI Chat)"}
              {activeTab === "logo" && "🎨 ভেক্টর লোগো মেকার (Logo Studio)"}
              {activeTab === "code" && "💻 ডেভ কোড প্লেগ্রাউন্ড (Sandbox Preview)"}
              {activeTab === "simulator" && "📱 কাস্টমার লাইভ সিমুলেটর (WhatsApp Mockup)"}
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {activeTab === "chat" && "Gemini এআই চ্যাট জেনারেটর প্লেগ্রাউন্ড"}
              {activeTab === "logo" && "প্রম্পট লিখুন এবং ডাউনলোডযোগ্য কোড ও এইচডি ছবি পান"}
              {activeTab === "code" && "এইচটিএমএল, সিএসএস এবং জাভাস্ক্রিপ্ট সরাসরি ব্রাউজারে রান করুন"}
              {activeTab === "simulator" && "গ্রাহকদের সাথে হোয়াটসঅ্যাপ সাপোর্টের স্বয়ংক্রিয় সিমুলেশন করুন"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "simulator" && (
              <button
                onClick={handleTriggerSimulatedCustomer}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow text-emerald-400" />
                নতুন কাস্টমার চ্যাট আনুন
              </button>
            )}

            <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 font-extrabold text-[10px] px-3 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              ২৪/৭ সক্রিয় (LIVE)
            </div>
          </div>
        </header>

        {/* Dynamic Workspace Panel Container (Full height scrollable body) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/40">
          
          {/* ChatGPT-style integrated workspace views */}
          {(activeTab === "chat" || activeTab === "logo" || activeTab === "code") && (
            <AIPowerWorkspace activeTool={activeTab} setActiveTool={(tool) => setActiveTab(tool)} />
          )}

          {/* Tab: Customer Simulator View */}
          {activeTab === "simulator" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto">
              
              {/* WhatsApp Phone Mockup */}
              <div className="lg:col-span-5 flex justify-center">
                <CustomerSimulator
                  currentContact={selectedContact}
                  onNewMessage={handleNewCustomerMessage}
                  isAiTyping={isAiTyping}
                  knowledgeBase={knowledgeBase || {
                    companyName: "RF Tech",
                    businessType: "",
                    businessHours: "",
                    contactInfo: "",
                    productsAndPricing: "",
                    refundPolicy: "",
                    faqs: [],
                    systemInstructions: ""
                  }}
                />
              </div>

              {/* Explanatory Panel & Instructions */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Introduction Greeting */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    RF AI কিভাবে কাজ করছে?
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    এই সিমুলেটরে বামপাশে একটি গ্রাহকের স্মার্টফোন স্ক্রিন দেখানো হয়েছে। আপনি কাস্টমার হিসেবে যেকোনো প্রশ্ন লিখতে পারেন (যেমন: পণ্যের দাম, ওয়ারেন্টি, শোরুমের ঠিকানা ইত্যাদি)।
                  </p>
                  
                  <div className="mt-5">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs">
                      <span className="font-bold text-slate-800 block mb-1">🤖 স্বয়ংক্রিয় এআই উত্তর (Auto-Pilot):</span>
                      আপনার মেসেজ পাঠানো মাত্রই <strong>RF AI</strong> নলেজ বেস থেকে রিয়েল-টাইম তথ্য খুঁজে বের করে বাংলায় অত্যন্ত সুন্দরভাবে সাজানো উত্তর দেবে।
                    </div>
                  </div>
                </div>

                {/* Contact Switcher for Testing */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5">
                    অন্য কাস্টমার দিয়ে টেস্ট করুন
                  </h4>
                  <div className="space-y-2.5">
                    {contacts.map((c) => {
                      const isSelected = c.id === selectedContactId;
                      return (
                        <div
                          key={c.id}
                          onClick={() => handleSelectContact(c.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected 
                              ? "bg-emerald-50/40 border-emerald-400/80 shadow-sm" 
                              : "border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{c.avatar}</span>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{c.name}</p>
                              <p className="text-[10px] text-slate-400">{c.phoneNumber}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {c.aiAutoPilot ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded">
                                🤖 AI Auto-Pilot
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded">
                                👤 Manual
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({c.messages.length}টি মেসেজ)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Secrets Reminder */}
                {!usingRealGemini && (
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-900 text-xs leading-relaxed flex gap-3 animate-pulse">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block mb-0.5">Gemini API Key সেটআপ করুন!</strong>
                      আপনার নিজের প্রফেশনাল এআই জেনারেটিভ উত্তর পেতে স্ক্রিনের ডানপাশে উপরে বা সেটিংসে <strong>GEMINI_API_KEY</strong> ভ্যালু সেট করুন। বর্তমানে সিস্টেমটি উন্নত রেগুলার এক্সপ্রেশন ও লোকাল ফলব্যাক টেক্সট ব্যবহার করে অত্যন্ত সুন্দরভাবে উত্তর সিমুলেট করছে।
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}



        </main>

      </div>
    </div>
  );
}
