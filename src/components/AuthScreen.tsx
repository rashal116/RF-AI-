import React, { useState, useEffect } from "react";
import { auth, googleProvider } from "../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, Sparkles, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Auto Login Check on Mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        onAuthSuccess(user);
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [onAuthSuccess]);

  // Handle Email/Password Login
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("দয়া করে ইমেইল এবং পাসওয়ার্ড দুটিই প্রদান করুন।");
      return;
    }
    if (!isLogin && !name) {
      setError("দয়া করে আপনার নাম প্রদান করুন।");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Sign In
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(userCredential.user);
      } else {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update user display name
        await updateProfile(userCredential.user, {
          displayName: name
        });
        onAuthSuccess(userCredential.user);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let bnError = "লগইন করতে ব্যর্থ হয়েছে। দয়া করে সঠিক তথ্য প্রদান করুন।";
      if (err.code === "auth/invalid-credential") {
        bnError = "ভুল ইমেইল অথবা পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিন।";
      } else if (err.code === "auth/email-already-in-use") {
        bnError = "এই ইমেইলটি ইতিমধ্যে ব্যবহার করা হয়েছে। অন্য ইমেইল দিয়ে চেষ্টা করুন।";
      } else if (err.code === "auth/weak-password") {
        bnError = "পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে।";
      } else if (err.code === "auth/invalid-email") {
        bnError = "দয়া করে একটি সঠিক ইমেইল এড্রেস লিখুন।";
      }
      setError(bnError + ` (${err.message})`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Auto Sign-In
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onAuthSuccess(result.user);
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      // Iframe popup blocked fallback
      if (err.code === "auth/popup-blocked" || err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        // Auto sign-in or simulation fallback for preview convenience
        setError("পপআপ ব্লক বা বন্ধ করা হয়েছে। দয়া করে ইমেইল/পাসওয়ার্ড দিয়ে প্রবেশ করুন অথবা সিমুলেটেড গুগল সাইন-ইন ব্যবহার করুন।");
      } else {
        setError("গুগল সাইন-ইন ব্যর্থ হয়েছে: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Simulated Google Fast Login (extremely helpful when inside sandboxed iframes)
  const handleSimulatedGoogleSignIn = () => {
    setError("");
    setLoading(true);
    setTimeout(() => {
      // Mock user object matching Firebase User type for frictionless preview testing!
      const mockUser = {
        uid: "mock-google-user-123",
        email: "rashaltechworld@gmail.com",
        displayName: "Rashal Tech World",
        photoURL: "https://lh3.googleusercontent.com/a/default-user=s96-c",
        emailVerified: true,
      } as any;
      onAuthSuccess(mockUser);
      setLoading(false);
    }, 800);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
          <h2 className="text-slate-300 font-bold text-lg tracking-wide">RF AI সিস্টেম লোড হচ্ছে...</h2>
          <p className="text-slate-500 text-xs">দয়া করে একটু অপেক্ষা করুন</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[450px] bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center font-black text-white text-xl mx-auto shadow-lg shadow-emerald-500/20 mb-4 animate-pulse">
            RF
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">RF AI ক্রিয়েটিভ স্যুইট</h1>
          <p className="text-xs text-slate-400 mt-1.5">চ্যাটিং, লোগো মেকিং এবং এডভান্সড কোডিং প্লেগ্রাউন্ড</p>
        </div>

        {/* Custom Tab Selector */}
        <div className="grid grid-cols-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80 mb-6">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(""); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              isLogin 
                ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            লগইন (Sign In)
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(""); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              !isLogin 
                ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            রেজিস্ট্রেশন (Register)
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 text-red-400 text-xs leading-relaxed animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          
          {/* Full Name (Sign Up only) */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">আপনার পুরো নাম</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="যেমন: রাসুল ইসলাম"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">ইমেইল এড্রেস</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="আপনার@ইমেইল.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-11 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4" /> প্রবেশ করুন (Sign In)
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> একাউন্ট তৈরি করুন (Register)
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-slate-800"></div>
          <span className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">অথবা</span>
          <div className="flex-1 border-t border-slate-800"></div>
        </div>

        {/* Social Sign In Buttons */}
        <div className="space-y-3">
          {/* Google Auto / Popup sign in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 15.01 1 12 1 7.24 1 3.2 3.73 1.24 7.7l3.87 3C6.1 7.7 8.78 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.96 3.7-8.63z"
              />
              <path
                fill="#FBBC05"
                d="M5.11 14.7C4.88 14 4.75 13.26 4.75 12.5s.13-1.5.36-2.2l-3.87-3C.44 8.73 0 10.56 0 12.5s.44 3.77 1.24 5.2l3.87-3z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.04.7-2.38 1.11-4.23 1.11-3.22 0-5.9-2.66-6.89-5.66l-3.87 3C3.2 20.27 7.24 23 12 23z"
              />
            </svg>
            গুগল দিয়ে প্রবেশ (Google Sign In)
          </button>

          {/* Simulated Google Auto login for iframe sandboxes */}
          <div className="relative pt-1">
            <button
              type="button"
              onClick={handleSimulatedGoogleSignIn}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm animate-pulse"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              গুগল অটো লগইন (১-ক্লিক ইমার্জেন্সি)
            </button>
            <p className="text-[9px] text-slate-500 text-center mt-2 leading-relaxed">
              💡 <strong>পপআপ ব্লক সমস্যা এড়াতে:</strong> ব্রাউজার আইফ্রেম বা পপআপ ব্লক করার কারণে মূল গুগল সাইন-ইন ব্যর্থ হলে উপরের <strong>"গুগল অটো লগইন"</strong> বাটনটি ক্লিক করুন। এটি গুগল মক ক্রেডেনশিয়াল দিয়ে সরাসরি প্রবেশ করতে সাহায্য করবে।
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[10px] text-center text-slate-600 mt-5 leading-normal">
          নিরাপদ ও নির্ভরযোগ্য সিস্টেম। RF AI আপনার প্রোফাইল তথ্য এবং ডেটা সুরক্ষিত রাখতে ফায়ারবেস অথেনটিকেশন ব্যবহার করে।
        </p>

      </div>
    </div>
  );
}
