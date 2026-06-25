export interface MessageAttachment {
  type: "image" | "code" | "video";
  name: string;
  url: string;
  content?: string;
  size?: string;
}

export interface Message {
  id: string;
  sender: "customer" | "ai" | "agent";
  text: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  attachment?: MessageAttachment;
}

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  avatar: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  messages: Message[];
  category: "general" | "sales" | "billing" | "support" | "unassigned";
  priority: "low" | "medium" | "high";
  status: "active" | "resolved" | "pending";
  aiAutoPilot: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface KnowledgeBase {
  companyName: string;
  businessType: string;
  businessHours: string;
  contactInfo: string;
  productsAndPricing: string;
  refundPolicy: string;
  faqs: FAQItem[];
  systemInstructions: string;
}

export interface AnalyticsSummary {
  totalChats: number;
  aiResolvedCount: number;
  avgResponseTimeSec: number;
  customerSatisfactionPercent: number;
  issueBreakdown: { name: string; value: number; color: string }[];
  hourlyActivity: { hour: string; aiChats: number; customerChats: number }[];
}
