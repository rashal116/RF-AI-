import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables.");
}

// Helper function to call Gemini with robust retries and fallback models (e.g. to avoid 503 errors)
async function generateContentWithRetry(params: {
  contents: any;
  config?: any;
  preferredModel?: string;
}) {
  if (!ai) {
    throw new Error("Gemini AI is not initialized.");
  }

  // Sequentially try different models for maximum reliability
  const modelsToTry = [
    params.preferredModel || "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-3.1-flash-lite",
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Gemini API] Requesting model "${model}" - Attempt ${attempt}/2`);
        const response = await ai.models.generateContent({
          model: model,
          contents: params.contents,
          config: params.config,
        });
        
        if (response) {
          console.log(`[Gemini API] Success using model "${model}" on attempt ${attempt}`);
          return response;
        }
        
        throw new Error("Empty response received from Gemini model.");
      } catch (error: any) {
        lastError = error;
        console.warn(`[Gemini API Error] Failed using model "${model}" on attempt ${attempt}. Error: ${error.message || error}`);
        
        // Wait 300ms before next attempt/fallback
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
  }

  throw lastError || new Error("Failed to generate content after retrying multiple models.");
}

// Memory database for user custom knowledge base
let currentKnowledgeBase = {
  companyName: "RF Tech & Gadgets (আর এফ টেক অ্যান্ড গ্যাজেটস)",
  businessType: "Electronics, Premium Smart Devices & Accessories Retailer",
  businessHours: "সকাল ১০:০০ টা থেকে রাত ৯:৩০ টা (প্রতিদিন খোলা, শুক্রবার দুপুর ২:০০ টা থেকে রাত ১০:০০ টা)",
  contactInfo: "হটলাইন: ০১৭০০-১১২২৩৩, ০১৯৯৯-৪৪৫৫৬৬, ইমেইল: support@rftech.com, শোরুম: আর এফ আইটি প্লাজা, লেভেল ৪, শপ নং ৪০৫, পান্থপথ, ঢাকা-১২১৫",
  productsAndPricing: `📦 আমাদের ক্যাটাগরি অনুযায়ী প্রডাক্ট এবং প্রাইস লিস্ট নিচে দেওয়া হলো:

📱 স্মার্টফোন সিরিজ (Smartphones):
১. RF Pro Max Ultra (5G) - ৫৪,৯৯৯ টাকা (১২ জিবি র‍্যাম, ২৫৬ জিবি রম, ১২০Hz এমোলেড স্ক্রিন, ৫০ মেগাপিক্সেল ট্রিপল ক্যামেরা, ৫০০০ mAh ব্যাটারি)
২. RF Lite 10s (4G) - ১৮,৫০০ টাকা (৮ জিবি র‍্যাম, ১২৮ জিবি রম, ওএলইডি ডিসপ্লে, ৫০০০ mAh ব্যাটারি, ৩৩ ওয়াট ফাস্ট চার্জিং)

⌚️ পরিধানযোগ্য গ্যাজেটস (Smartwatches & Audio):
৩. RF Wave Smartwatch V2 - ৪,৮০০ টাকা (১.৯৬ ইঞ্চি অলওয়েজ-অন এমোলেড ডিসপ্লে, হার্ট রেট ও SpO2 ট্র্যাকিং, IP68 ওয়াটারপ্রুফ, ১২ দিনের ব্যাটারি লাইফ)
৪. RF Fit Band Pro - ২,৫০০ টাকা (মেটাল বডি, ফিটনেস ট্র্যাকিং, কল নোটিফিকেশন, ১ বছরের অফিসিয়াল ওয়ারেন্টি)
৫. RF SoundPod Wireless Earbuds (ANC) - ৩,৫০০ টাকা (৩৪ ডেসিবল একটিভ নয়েজ ক্যান্সেলেশন, ট্রু বাস স্পিকার, গেমিং আল্ট্রা-লো লেটেন্সি মোড, ৩৬ ঘণ্টার মোট প্লেব্যাক)
৬. RF Studio Over-Ear Headphones - ৬,২০০ টাকা (হাই-রেস অডিও সার্টিফাইড, মেমোরি ফোম কুশন, ওয়্যারলেস ও ওয়্যারড ডুয়াল মোড)

💻 কম্পিউটার ও এক্সেসরিজ (IT Accessories):
৭. RF SlimBook 14 Laptop - ৪২,০০০ টাকা (ইন্টেল কোর i5 ১১ জেনারেশন, ৮ জিবি ডিডিআর৪ র‍্যাম, ৫১২ জিবি এনভিএমই এসএসডি, উইন্ডোজ ১১ লাইফটাইম অ্যাক্টিভেটেড)
৮. RF MechKey RGB Keyboard - ২,৮০০ টাকা (ব্লু সুইচেস, মেকানিক্যাল কি-বোর্ড, ১৮টি কাস্টম আরজিবি ব্যাকলিট মোড)
৯. RF Precision Wireless Mouse - ১,২০০ টাকা (৩২০০ ডিপিআই, টাইপ-সি রিচার্জেবল ব্যাটারি, এরগোনমিক গ্রিপ)`,
  refundPolicy: "🔄 রিটার্ন, রিফান্ড এবং ওয়ারেন্টি পলিসি:\n" +
    "১. পণ্য হাতে পাওয়ার পর থেকে আগামী ৭ দিনের মধ্যে ম্যানুফ্যাকচারিং ত্রুটি দেখা দিলে সম্পূর্ণ বিনামূল্যে পরিবর্তন (হ্যান্ড-টু-হ্যান্ড রিপ্লেসমেন্ট ওয়ারেন্টি) করে দেওয়া হবে।\n" +
    "২. রিফান্ডের ক্ষেত্রে পণ্যটি অব্যবহৃত অবস্থায়, আসল ক্যাশ মেমো, ইনট্যাক্ট বক্স এবং সমস্ত এক্সেসরিজ সহ ক্রয়ের ৩ দিনের মধ্যে আমাদের শোরুমে এসে রিটার্ন করতে হবে। পেমেন্ট গেটওয়ের চার্জ বাদ দিয়ে ২৪-৪৮ ঘণ্টার মধ্যে টাকা ফেরত দেওয়া হবে।\n" +
    "৩. আমাদের সকল প্রধান গ্যাজেটসে (স্মার্টফোন, ল্যাপটপ, ইয়ারবাডস এবং ওয়াচ) রয়েছে ১ বছরের অফিসিয়াল পার্টস এবং সার্ভিস ওয়ারেন্টি এবং লাইফটাইম কাস্টমার কেয়ার সাপোর্ট।",
  faqs: [
    { id: "1", question: "হোম ডেলিভারি সিস্টেম এবং ডেলিভারি চার্জ কত?", answer: "আমরা সমগ্র বাংলাদেশে নির্ভরযোগ্য কুরিয়ার সার্ভিসের মাধ্যমে সুপার-ফাস্ট হোম ডেলিভারি দিয়ে থাকি। ঢাকার ভেতরে ডেলিভারি চার্জ মাত্র ৬০ টাকা (১-২ দিন সময় লাগে) এবং ঢাকার বাইরে ডেলিভারি চার্জ ১৫০ টাকা (২-৩ দিন সময় লাগে)। আপনি চাইলে ক্যাশ অন ডেলিভারি (পণ্য দেখে মূল্য পরিশোধ) করতে পারেন।" },
    { id: "2", question: "পেমেন্ট করার নিয়মগুলো কী কী? ইএমআই সুবিধা আছে কি?", answer: "আমরা বিকাশ (bKash), নগদ (Nagad), রকেট (Rocket), যেকোনো ব্যাংকের ক্রেডিট/ডেবিট কার্ড এবং ক্যাশ অন ডেলিভারি গ্রহণ করি। এছাড়াও ১০,০০০ টাকার উপরের যেকোনো পণ্য ক্রয়ের ক্ষেত্রে প্রধান প্রধান ব্যাংকের ক্রেডিট কার্ডে ৩ থেকে ১২ মাস পর্যন্ত ০% সুদে EMI (সহজ কিস্তি) সুবিধা রয়েছে।" },
    { id: "3", question: "আপনাদের ফিজিক্যাল শোরুমের ঠিকানা কী? এসে দেখে কেনা যাবে?", answer: "হ্যাঁ, অবশ্যই! আপনি সরাসরি আমাদের শোরুমে এসে পণ্যগুলো যাচাই করে পছন্দমতো কিনতে পারেন। আমাদের ঠিকানা: আর এফ আইটি প্লাজা, লেভেল ৪, শপ নং ৪০৫, পান্থপথ (বসুন্ধরা সিটির পাশে), ঢাকা-১২১৫।" },
    { id: "4", question: "অর্ডার করার নিয়মটি বুঝিয়ে বলুন।", answer: "অর্ডার কনফার্ম করার জন্য আমাদের পণ্যগুলোর নাম, আপনার সম্পূর্ণ নাম, সচল মোবাইল নাম্বার এবং পণ্য ডেলিভারি নেওয়ার জন্য একটি নিখুঁত ঠিকানা (জেলা, থানা ও এলাকার নাম সহ) ইনবক্সে পাঠিয়ে দিন। আমাদের কাস্টমার রিলেশন টিম দ্রুত আপনার অর্ডারটি প্রসেস করে মেসেজের মাধ্যমে ট্র্যাকিং কোড জানিয়ে দেবে।" },
    { id: "5", question: "আপনাদের পণ্যগুলো কি ১০০% অরিজিনাল ও অফিসিয়াল?", answer: "হ্যাঁ, আর এফ টেক অ্যান্ড গ্যাজেটস-এর প্রতিটি পণ্য সরাসরি গ্লোবাল ব্র্যান্ড থেকে আমদানীকৃত এবং শতভাগ জেনুইন ও অরিজিনাল। প্রত্যেকটি অর্ডারের সাথে আপনি কিউআর কোড ভেরিফিকেশন সহ একটি সিলযুক্ত অফিসিয়াল ক্যাশ মেমো ও ওয়ারেন্টি কার্ড পাবেন।" }
  ],
  systemInstructions: "You are 'RF AI', an exceptionally smart, polite, professional, and empathetic 24/7 automated WhatsApp customer support assistant for RF Tech & Gadgets. Respond warmheartedly in Fluent Bengali (or English if the customer writes in English). Use formatting like bold terms, bullet points, and clean lists to make messages clean and easy to read on WhatsApp. Always include relevant emojis to remain super engaging and helpful. Use the exact knowledge base information to answer. If a pricing, discount, address, or warranty inquiry is made, look at the knowledge base and reply comprehensively. If the customer asks for something you don't know, offer to transfer them to a human agent, but try to resolve their inquiry first."
};

// --- Resilient Fallback Utility Functions (SVG and Text Generators) ---

function getProceduralSvg(prompt: string) {
  const cleanPrompt = (prompt || "RF AI").trim();
  const initials = cleanPrompt.split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 3) || "AI";
  
  let charCodeSum = 0;
  for (let i = 0; i < cleanPrompt.length; i++) {
    charCodeSum += cleanPrompt.charCodeAt(i);
  }
  const colorHue1 = charCodeSum % 360;
  const colorHue2 = (colorHue1 + 140) % 360;
  
  const color1 = `hsl(${colorHue1}, 75%, 55%)`;
  const color2 = `hsl(${colorHue2}, 80%, 50%)`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="fallbackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="#090d16" rx="24"/>
  <circle cx="200" cy="180" r="100" fill="none" stroke="url(#fallbackGrad)" stroke-width="4" stroke-dasharray="10, 5" opacity="0.4" />
  <circle cx="200" cy="180" r="80" fill="url(#fallbackGrad)" opacity="0.1" />
  <path d="M200 80 L300 180 L200 280 L100 180 Z" fill="none" stroke="url(#fallbackGrad)" stroke-width="6" stroke-linejoin="round" filter="url(#glow)"/>
  <text x="200" y="200" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="52" fill="#ffffff" text-anchor="middle" letter-spacing="2">${initials}</text>
  <text x="200" y="325" font-family="'Inter', sans-serif" font-weight="bold" font-size="20" fill="#ffffff" text-anchor="middle" opacity="0.95">${cleanPrompt.toUpperCase()}</text>
  <text x="200" y="355" font-family="'JetBrains Mono', monospace" font-size="11" fill="url(#fallbackGrad)" text-anchor="middle" font-weight="bold" letter-spacing="3">RF AI DELUXE DESIGN</text>
</svg>`;
}

function getFallbackChatText(message: string): string {
  const isBangla = /[\u0980-\u09FF]/.test(message);
  const msgLower = message.toLowerCase();

  if (msgLower.includes("code") || msgLower.includes("write") || msgLower.includes("create") || msgLower.includes("program") || msgLower.includes("কোড") || msgLower.includes("প্রোগ্রাম")) {
    return isBangla 
      ? `হ্যালো! এই মুহূর্তে মূল সার্ভার অতিরিক্ত ট্রাফিকের কারণে কিছুটা ব্যস্ত। তবে চিন্তার কিছু নেই! আমি আপনার অনুরোধের জন্য একটি সুন্দর ডেমো কোড নিচে প্রস্তুত করেছি:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>RF AI Demo App</title>
    <style>
        body {
            background: radial-gradient(circle, #1e293b, #0f172a);
            color: #ffffff;
            font-family: sans-serif;
            text-align: center;
            padding-top: 50px;
        }
        .container {
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(255,255,255,0.05);
            padding: 30px;
            border-radius: 16px;
            display: inline-block;
            box-shadow: 0 4px 30px rgba(0,0,0,0.5);
        }
        .btn {
            background: #10b981;
            border: none;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>RF AI লাইভ ডেমো কোড</h2>
        <p>সার্ভার রেসপন্স সাময়িকভাবে ব্যাহত হলেও এই কোডটি সম্পূর্ণ কার্যক্ষম।</p>
        <button class="btn" onclick="alert('Hello from RF AI!')">ক্লিক করুন</button>
    </div>
</body>
</html>
\`\`\`

দয়া করে ২-৩ সেকেন্ড পর আবার চেষ্টা করুন, মূল সিস্টেমটি রিলোড হয়ে যাবে!`
      : `Hello! The main Gemini AI servers are currently experiencing high demand. However, I have generated a beautiful, working demonstration code for you:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>RF AI Demo App</title>
    <style>
        body {
            background: radial-gradient(circle, #1e293b, #0f172a);
            color: #ffffff;
            font-family: sans-serif;
            text-align: center;
            padding-top: 50px;
        }
        .container {
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(255,255,255,0.05);
            padding: 30px;
            border-radius: 16px;
            display: inline-block;
            box-shadow: 0 4px 30px rgba(0,0,0,0.5);
        }
        .btn {
            background: #10b981;
            border: none;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>RF AI Live Demo</h2>
        <p>Even though the server is under high load, this sandbox is ready to run!</p>
        <button class="btn" onclick="alert('Hello from RF AI!')">Click Me</button>
    </div>
</body>
</html>
\`\`\`

Please try sending your message again in a few seconds once the traffic load drops!`;
  }

  return isBangla
    ? `হ্যালো! আমি RF AI। এই মুহূর্তে প্রধান সার্ভারে অত্যন্ত চাপ রয়েছে (Gemini 503 Service Unavailable)। 

তবে আমি আপনার মেসেজটি পেয়েছি: "${message}"। 

আমি সবসময় আপনাকে সর্বোত্তম সেবা দিতে প্রস্তুত। অনুগ্রহ করে কয়েক সেকেন্ড পরে আবার চেষ্টা করুন অথবা আমার অন্য কোনো সেবা (যেমন লোগো ডিজাইন বা কোড প্লেগ্রাউন্ড) ব্যবহার করে দেখুন!`
    : `Hello! I am RF AI. The primary Gemini model is currently experiencing extremely high demand (503 Service Unavailable).

However, I successfully received your query: "${message}".

Please try sending your request again in a few seconds, or try our other exciting utilities like the Vector Logo Maker and Code Sandbox!`;
}

function getFaqFallbackSupportReply(message: string, kb: any, customerName?: string): string {
  const isBangla = /[\u0980-\u09FF]/.test(message);
  const msgLower = message.toLowerCase();
  
  if (msgLower.includes("price") || msgLower.includes("দাম") || msgLower.includes("কত") || msgLower.includes("প্রোডাক্ট") || msgLower.includes("মোবাইল") || msgLower.includes("earbuds") || msgLower.includes("smartwatch") || msgLower.includes("ঘড়ি")) {
    return isBangla
      ? `আমাদের প্রোডাক্ট এবং দামের তালিকা নিম্নরূপ:
${kb.productsAndPricing}

কোনো পণ্য অর্ডার করতে চাইলে দয়া করে আপনার নাম, মোবাইল নাম্বার এবং ঠিকানা দিন।`
      : `Here are our products and prices:
${kb.productsAndPricing}

To place an order, please provide your name, phone number, and full address.`;
  }
  
  if (msgLower.includes("refund") || msgLower.includes("replacement") || msgLower.includes("ফেরত") || msgLower.includes("ওয়ারেন্টি") || msgLower.includes("চেঞ্জ") || msgLower.includes("রিটার্ন")) {
    return isBangla
      ? `আমাদের রিটার্ন ও ওয়ারেন্টি পলিসি:
${kb.refundPolicy}`
      : `Our return & warranty policy is:
${kb.refundPolicy}`;
  }

  for (const faq of kb.faqs) {
    const faqQ = faq.question.toLowerCase();
    const faqKeywords = faqQ.split(/\s+/).filter((w: string) => w.length > 3);
    const matches = faqKeywords.some((kw: string) => msgLower.includes(kw));
    if (matches) {
      return faq.answer;
    }
  }

  return isBangla
    ? `ধন্যবাদ, ${customerName || "গ্রাহক"}! এই মুহূর্তে আমাদের প্রধান AI সার্ভারে অতিরিক্ত ট্রাফিকের (503 High Demand) কারণে কিছুটা সমস্যা হচ্ছে। 

তবে আমাদের কন্টাক্ট ইনফো নিচে দেওয়া হলো:
📞 ${kb.contactInfo}
🕒 কাজের সময়: ${kb.businessHours}

আপনার কোনো অর্ডার থাকলে বা ডিরেক্ট সাপোর্ট দরকার হলে দয়া করে আপনার মোবাইল নাম্বার এবং অ্যাড্রেস ইনবক্স করুন, আমাদের হিউম্যান এজেন্ট খুব দ্রুত যোগাযোগ করবে।`
    : `Thank you, ${customerName || "Customer"}! Our primary AI model is currently under heavy traffic (503 High Demand).

Here is our business contact info:
📞 ${kb.contactInfo}
🕒 Business Hours: ${kb.businessHours}

If you want to order or need direct help, please leave your mobile number and address. A human agent will connect with you shortly.`;
}

// --- API Routes ---

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", usingRealGemini: !!ai });
});

// 2. Fetch Knowledge Base
app.get("/api/knowledge", (req, res) => {
  res.json(currentKnowledgeBase);
});

// 3. Update Knowledge Base
app.post("/api/knowledge", (req, res) => {
  const { companyName, businessType, businessHours, contactInfo, productsAndPricing, refundPolicy, faqs, systemInstructions } = req.body;
  
  currentKnowledgeBase = {
    companyName: companyName || currentKnowledgeBase.companyName,
    businessType: businessType || currentKnowledgeBase.businessType,
    businessHours: businessHours || currentKnowledgeBase.businessHours,
    contactInfo: contactInfo || currentKnowledgeBase.contactInfo,
    productsAndPricing: productsAndPricing || currentKnowledgeBase.productsAndPricing,
    refundPolicy: refundPolicy || currentKnowledgeBase.refundPolicy,
    faqs: faqs || currentKnowledgeBase.faqs,
    systemInstructions: systemInstructions || currentKnowledgeBase.systemInstructions
  };

  res.json({ success: true, knowledge: currentKnowledgeBase });
});

// 4. Send Message to RF AI (WhatsApp support)
app.post("/api/chat", async (req, res) => {
  const { message, history, customerName, knowledge } = req.body || {};
  const kb = knowledge || currentKnowledgeBase;
  try {
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // Prepare custom business context prompt
    const systemPrompt = `
${kb.systemInstructions}

Here is the authentic information about our business:
- Company Name: ${kb.companyName}
- Business Type: ${kb.businessType}
- Working Hours / Business Hours: ${kb.businessHours}
- Contact Details: ${kb.contactInfo}
- Products & Prices: 
${kb.productsAndPricing}
- Refund & Replacement Policy: ${kb.refundPolicy}

Frequently Asked Questions (FAQs):
${kb.faqs.map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}

Important Customer Context:
- Customer Name: ${customerName || "Customer"}
- Channel: WhatsApp

Conversational History:
${history ? history.map((h: any) => `${h.sender === "customer" ? "Customer" : "RF AI"}: ${h.text}`).join("\n") : ""}

Please reply to the customer's last message: "${message}"
Response rules:
- Directly answer the message with natural tone.
- Be highly responsive and resolve the issues using the authorized business info above.
- Never make up information or promise anything outside our policies.
- Keep responses clean, concise, properly formatted for WhatsApp with bullet points or paragraphs, and use emojis if appropriate.
- Answer in the same language the customer is using (if Bengali, use polite Bengali; if English, use polite English).
`;

    // Fallback if Gemini Client is not initialized (e.g. key missing)
    if (!ai) {
      // Simulate intelligent support with a mock response based on language detection
      const isBangla = /[\u0980-\u09FF]/.test(message);
      let replyText = "";
      if (isBangla) {
        replyText = `ধন্যবাদ, ${customerName || "গ্রাহক"}! আমি আর এফ এআই (RF AI)। দুঃখিত যে আমার এপিআই কি (API Key) এই মুহূর্তে কনফিগার করা নেই। তবে আমি আপনার বার্তাটি পেয়েছি এবং এটি ড্যাশবোর্ডে সংরক্ষণ করেছি। আমাদের প্রোডাক্ট ও সেবার ব্যাপারে আপনার কোনো তথ্য জানতে চাইলে ড্যাশবোর্ডের সেটিংসে গিয়ে এপিআই কি সেট করে চেক করুন!`;
      } else {
        replyText = `Thank you, ${customerName || "Customer"}! I am RF AI. Currently, my Gemini API Key is not configured. However, I have saved your query: "${message}" inside the active chats dashboard. Please set up the GEMINI_API_KEY in the Secrets panel to activate my intelligent responses.`;
      }
      res.json({ text: replyText, sender: "ai", mock: true });
      return;
    }

    // Call real Gemini API with robust retries and fallbacks to prevent 503 errors
    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.5-flash",
      contents: systemPrompt,
    });

    const replyText = response.text || "I am here to assist you. How can I help today?";
    res.json({ text: replyText, sender: "ai", mock: false });

  } catch (error: any) {
    console.error("Gemini API Error in server (WhatsApp Chat):", error);
    const fallbackText = getFaqFallbackSupportReply(message, kb, customerName);
    res.json({ text: fallbackText, sender: "ai", mock: true, error: error.message });
  }
});

// 4b. RF AI Advanced Workspace - General Chat, Coding & Multi-tool
app.post("/api/general-chat", async (req, res) => {
  const { message, history } = req.body || {};
  try {
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    if (!ai) {
      const isBangla = /[\u0980-\u09FF]/.test(message);
      let mockReply = "";
      if (isBangla) {
        mockReply = `হ্যালো! আমি RF AI। আপনার বার্তাটি পেয়েছি: "${message}"। আপনার Gemini API Key কনফিগার করা নেই, তাই আমি সিমুলেশন মোডে উত্তর দিচ্ছি। কিন্তু আসল API কি সেট করলে আমি সম্পূর্ণ প্রফেশনাল লেভেলে কোডিং লিখতে, লোগো ডিজাইন করতে এবং যেকোনো জটিল সমস্যার সমাধান রিয়েল-টাইমে করে দিতে পারি!`;
      } else {
        mockReply = `Hello! I am RF AI. I received your message: "${message}". Since your Gemini API key is not configured, I am responding in simulation mode. Once you configure your GEMINI_API_KEY in the Secrets panel, I can write professional code, generate custom SVG logos, and chat intelligently!`;
      }
      res.json({ text: mockReply, mock: true });
      return;
    }

    // Assemble dynamic instruction + conversation history for Gemini
    const systemPrompt = `
You are 'RF AI', a highly advanced multi-tool AI Assistant created by RF.
You specialize in general conversation, professional coding assistance (writing high-quality, fully commented code), software design, and creative analysis.
You always response in a friendly, polite, and intelligent tone.
Use Markdown for formatting. If the user asks for code, provide clean, copyable code blocks with the correct language identifier.
If the user speaks in Bengali, reply in Bengali. If they speak in English, reply in English. Always match their language gracefully.

Conversation History:
${history ? history.map((h: any) => `${h.sender === "user" ? "User" : "RF AI"}: ${h.text}`).join("\n") : ""}

User's current query: "${message}"
`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.5-flash",
      contents: systemPrompt,
    });

    res.json({ text: response.text || "I'm sorry, I couldn't process that.", mock: false });
  } catch (error: any) {
    console.error("General Chat Gemini Error:", error);
    const fallbackReply = getFallbackChatText(message);
    res.json({ text: fallbackReply, mock: true, error: error.message });
  }
});

// 4c. RF AI Advanced Workspace - SVG Logo / Image Generator
app.post("/api/generate-svg", async (req, res) => {
  const logoPrompt = (req.body?.prompt || "") as string;
  try {
    if (!logoPrompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    if (!ai) {
      // Mock/Simulated beautiful logo SVG when key is missing so user experience is fully complete and premium!
      const mockSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="#0f172a" rx="30"/>
  <circle cx="200" cy="180" r="80" fill="url(#grad1)" opacity="0.15" />
  <path d="M150 240 L200 130 L250 240 Z" fill="none" stroke="url(#grad1)" stroke-width="8" stroke-linejoin="round"/>
  <circle cx="200" cy="180" r="30" fill="url(#grad1)"/>
  <text x="200" y="320" font-family="'Inter', sans-serif" font-weight="bold" font-size="28" fill="#ffffff" text-anchor="middle">RF AI CREATIVE</text>
  <text x="200" y="350" font-family="'JetBrains Mono', monospace" font-size="14" fill="#a1a1aa" text-anchor="middle">SIMULATED LOGO</text>
</svg>`;
      res.json({ svg: mockSvg, mock: true });
      return;
    }

    const systemPrompt = `
You are an expert Graphic and Vector UI Designer specializing in creating beautiful modern logo designs in SVG format.
The user wants you to design a logo/icon for the prompt: "${logoPrompt}"

Return ONLY valid, highly-styled, standalone vector SVG code.
Design rules:
- Must have a viewBox (e.g. viewBox="0 0 400 400").
- Use modern colors, gradients, soft shadows, rounded paths, and professional shapes.
- Use a dark background within the SVG (like deep blue, charcoal slate) or a beautiful transparent cutout so it looks premium.
- Do NOT wrap the output in markdown backticks or enclose in markdown formatting. Just return the raw SVG code starting with <svg> and ending with </svg>.
- Do NOT include any explanations, introductions, or comments outside of the SVG tags.
- Make it look stunning, professional, clean, and balanced.
`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.5-flash",
      contents: systemPrompt,
    });

    let svgText = response.text || "";
    // Clean up any potential markdown code blocks if the model ignored instructions
    svgText = svgText.replace(/```xml/g, "").replace(/```html/g, "").replace(/```svg/g, "").replace(/```/g, "").trim();

    res.json({ svg: svgText, mock: false });
  } catch (error: any) {
    console.error("SVG generation Gemini Error, using procedural fallback:", error);
    const fallbackSvg = getProceduralSvg(logoPrompt);
    res.json({ svg: fallbackSvg, mock: true, error: error.message });
  }
});

// 5. Categorize Customer Issue (AI Analysis Endpoint)
app.post("/api/analyze-issue", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || messages.length === 0) {
      res.json({ category: "unassigned", priority: "low" });
      return;
    }

    const conversationText = messages.map((m: any) => `${m.sender}: ${m.text}`).join("\n");
    
    if (!ai) {
      // Fallback
      res.json({ category: "support", priority: "medium" });
      return;
    }

    const prompt = `
Analyze the following customer WhatsApp chat conversation and classify it.
Output a JSON response with precisely two fields:
- "category": must be one of "support", "sales", "billing", "general", "unassigned"
- "priority": must be one of "low", "medium", "high"

Conversation:
${conversationText}

Provide only the raw JSON. No markdown backticks, no comments.
`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: "Classification category" },
            priority: { type: Type.STRING, description: "Priority level" }
          },
          required: ["category", "priority"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);

  } catch (e) {
    res.json({ category: "support", priority: "medium" });
  }
});

// --- Configure Express with Vite / Production serving ---

const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
