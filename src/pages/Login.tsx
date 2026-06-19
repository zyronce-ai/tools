import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, CheckCircle, Loader2, Sparkles, MessageCircle, PenTool, Image, TrendingUp, Search, Calculator, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPw?: string; general?: string }>({});

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const pwMinLen = password.length >= 6;
  const pwHasUpper = /[A-Z]/.test(password);
  const pwHasNum = /[0-9]/.test(password);
  const pwsMatch = password === confirmPw;
  const pwStrength = [pwMinLen, pwHasUpper, pwHasNum].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = "Email address is required";
    else if (!emailValid) errs.email = "Please enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (isSignUp && !pwMinLen) errs.password = "At least 6 characters needed";
    if (isSignUp && !confirmPw) errs.confirmPw = "Please confirm your password";
    else if (isSignUp && !pwsMatch) errs.confirmPw = "Passwords do not match";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setErrors({ general: error.message === "User already registered" ? "Ye email already registered hai. Login karo." : error.message });
        setLoading(false);
        return;
      }
      setErrors({ general: "✅ Account ban gaya! Email me confirmation link check karo aur login karo." });
      setLoading(false);
      setIsSignUp(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrors({ general: error.message === "Invalid login credentials" ? "Email ya password galat hai." : error.message });
      setLoading(false);
      return;
    }
    navigate("/chat");
  };

  const toggleMode = () => { setIsSignUp(!isSignUp); setErrors({}); setConfirmPw(""); };

  return (
    <div className="min-h-screen flex">
      {/* LEFT — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-400/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 bg-orange-300/10 rounded-full blur-3xl" />
        <div className="flex flex-col justify-between p-12 w-full relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center"><Sparkles className="h-5 w-5 text-white" /></div>
            <span className="text-xl font-bold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>NayraTools</span>
          </Link>
          <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">Grow Your Ecommerce Business with AI</h1>
              <p className="text-orange-100 text-lg mb-10">Join 10,000+ sellers using 25+ AI tools to scale their online business.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="grid grid-cols-3 gap-3">
                  {[MessageCircle, PenTool, Image, TrendingUp, Search, Calculator].map((Icon, i) => (
                    <div key={i} className="bg-white/10 rounded-xl p-3 flex flex-col items-center gap-1.5">
                      <Icon className="h-6 w-6 text-white" />
                      <span className="text-[10px] text-orange-100 font-medium">{["ChatBot", "Content", "Images", "Trends", "Research", "Pricing"][i]}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 h-2 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full w-3/4 bg-white/20 rounded-full" /></div>
              </div>
            </motion.div>
          </div>
          <div className="flex items-center gap-6 text-sm text-orange-200">
            <span>⭐ 4.8 Rating</span>
            <span>🛡️ Secure Login</span>
            <span>🌍 Trusted Globally</span>
          </div>
        </div>
      </div>

      {/* RIGHT — Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[400px]">
          <Link to="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center"><Sparkles className="h-4 w-4 text-white" /></div>
            <span className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>NayraTools</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{isSignUp ? "Create Free Account 🚀" : "Welcome Back 👋"}</h1>
            <p className="text-gray-500">{isSignUp ? "Join 10,000+ sellers. Sign up in 30 seconds." : "Login to access your AI seller toolkit."}</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {errors.general && (
              <div className={`rounded-xl p-3 text-sm ${errors.general.includes("✅") ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                {errors.general}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className={`relative rounded-xl border-2 transition-all ${errors.email ? "border-red-400" : emailValid && email ? "border-green-400" : "border-gray-200 focus-within:border-orange-400"}`}>
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.email ? "text-red-400" : "text-gray-400"}`} />
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }} placeholder="you@example.com" className="w-full pl-10 pr-10 py-3 bg-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none text-sm" />
                {emailValid && email && <CheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{isSignUp ? "Create Password" : "Password"}</label>
              <div className={`relative rounded-xl border-2 transition-all ${errors.password ? "border-red-400" : "border-gray-200 focus-within:border-orange-400"}`}>
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.password ? "text-red-400" : "text-gray-400"}`} />
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }} placeholder={isSignUp ? "Create a strong password" : "Enter your password"} className="w-full pl-10 pr-10 py-3 bg-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none text-sm" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              {isSignUp && password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1.5">{Array.from({ length: 3 }).map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < pwStrength ? (pwStrength >= 3 ? "bg-green-500" : pwStrength >= 2 ? "bg-orange-400" : "bg-red-400") : "bg-gray-200"}`} />)}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span className={`flex items-center gap-1 ${pwMinLen ? "text-green-600" : "text-gray-400"}`}>{pwMinLen ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}6+ characters</span>
                    <span className={`flex items-center gap-1 ${pwHasUpper ? "text-green-600" : "text-gray-400"}`}>{pwHasUpper ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}A-Z</span>
                    <span className={`flex items-center gap-1 ${pwHasNum ? "text-green-600" : "text-gray-400"}`}>{pwHasNum ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}0-9</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password (signup only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <div className={`relative rounded-xl border-2 transition-all ${errors.confirmPw ? "border-red-400" : confirmPw && pwsMatch ? "border-green-400" : "border-gray-200 focus-within:border-orange-400"}`}>
                  <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.confirmPw ? "text-red-400" : "text-gray-400"}`} />
                  <input type={showConfirmPw ? "text" : "password"} value={confirmPw} onChange={(e) => { setConfirmPw(e.target.value); setErrors((p) => ({ ...p, confirmPw: undefined })); }} placeholder="Re-enter your password" className="w-full pl-10 pr-10 py-3 bg-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none text-sm" />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  {confirmPw && pwsMatch && <CheckCircle className="absolute right-12 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                </div>
                {errors.confirmPw && <p className="text-red-500 text-xs mt-1">{errors.confirmPw}</p>}
              </div>
            )}

            {/* Remember + Forgot */}
            {!isSignUp && <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-orange-600 hover:text-orange-700">Forgot Password?</a>
            </div>}

            {/* Submit */}
            <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all text-base font-semibold">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : isSignUp ? "Create Free Account" : "Login to Dashboard"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div><div className="relative flex justify-center"><span className="bg-white px-4 text-sm text-gray-400">or continue with</span></div></div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })} className="flex items-center justify-center gap-2.5 rounded-xl border-2 border-gray-200 py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"><svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>Google</button>
            <button type="button" onClick={() => supabase.auth.signInWithOAuth({ provider: "github" })} className="flex items-center justify-center gap-2.5 rounded-xl border-2 border-gray-200 py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>GitHub</button>
          </div>

          {/* Toggle */}
          <p className="text-center text-sm text-gray-500 mt-8">{isSignUp ? "Already have an account?" : "Don't have an account?"} <button type="button" onClick={toggleMode} className="font-bold text-orange-600 hover:text-orange-700">{isSignUp ? "Login" : "Sign Up Free"}</button></p>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-4">By logging in, you agree to our <a href="/terms" className="text-orange-600 hover:underline">Terms of Service</a> and <a href="/privacy-policy" className="text-orange-600 hover:underline">Privacy Policy</a>.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
