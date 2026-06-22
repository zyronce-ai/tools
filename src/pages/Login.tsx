import { useState } from "react";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { Link, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle, signInWithGitHub } from "@/lib/firebase";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = "Email address is required";
    if (!password) errs.password = "Password is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setErrors({ general: error.message === "User already registered" ? "This email is already registered. Please login." : error.message });
        setLoading(false);
        return;
      }
      setErrors({ general: "✅ Account created! Please login." });
      setLoading(false);
      setIsSignUp(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrors({ general: error.message === "Invalid login credentials" ? "Invalid email or password." : error.message });
      setLoading(false);
      return;
    }
    navigate("/chat");
  };

  return (
    <>
    <SEO title="Sign In" description="Sign in to NayraTools to access your AI ecommerce tools" path="/login" />
    <main className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-400/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 bg-orange-300/10 rounded-full blur-3xl" />
        <div className="flex flex-col justify-between p-12 w-full relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center"><Sparkles className="h-5 w-5 text-white" /></div>
            <span className="text-xl font-bold text-white">NayraTools</span>
          </Link>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white leading-tight">Ek Platform.<br />Saare Tools.<br />Zyaada Sales.</h2>
            <div className="space-y-3">
              {["25+ AI ecommerce tools", "Free plan available", "Amazon • Flipkart • Shopify • Meesho"].map((t, i) => (
                <div key={i} className="flex items-center gap-3 text-white/80"><div className="h-2 w-2 rounded-full bg-white/60" /><span className="text-sm">{t}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{isSignUp ? "Create Free Account" : "Welcome Back"}</h1>
            <p className="text-gray-500 mt-2">{isSignUp ? "Join 10,000+ sellers" : "Login to your NayraTools account"}</p>
          </div>

          {errors.general && <div className="mb-4 p-3 rounded-xl bg-orange-50 border border-orange-200 text-sm text-orange-700 text-center">{errors.general}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all" /></div>
              {errors.email && <p className="text-xs text-red-500 mt-1 ml-1">{errors.email}</p>}
            </div>
            <div>
              <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type={showPw ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-12 pl-10 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all" /><button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
              {errors.password && <p className="text-xs text-red-500 mt-1 ml-1">{errors.password}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all text-base font-semibold">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : isSignUp ? "Create Free Account" : "Login to Dashboard"}
            </Button>
          </form>

          <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div><div className="relative flex justify-center"><span className="bg-white px-4 text-sm text-gray-400">or continue with</span></div></div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={async () => { try { await signInWithGoogle(); navigate("/chat"); } catch (e: any) { setErrors({ general: e?.message || "Google login failed" }); } }} className="flex items-center justify-center gap-2.5 rounded-xl border-2 border-gray-200 py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"><svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>Google</button>
            <button type="button" onClick={async () => { try { await signInWithGitHub(); navigate("/chat"); } catch (e: any) { setErrors({ general: e?.message || "GitHub login failed" }); } }} className="flex items-center justify-center gap-2.5 rounded-xl border-2 border-gray-200 py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>GitHub</button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">{isSignUp ? "Already have an account?" : "Don't have an account?"} <button type="button" onClick={() => { setIsSignUp(!isSignUp); setErrors({}); }} className="font-bold text-orange-600 hover:text-orange-700">{isSignUp ? "Login" : "Sign Up Free"}</button></p>

          <p className="text-center text-xs text-gray-400 mt-4">By logging in, you agree to our <a href="/terms" className="text-orange-600 hover:underline">Terms of Service</a> and <a href="/privacy-policy" className="text-orange-600 hover:underline">Privacy Policy</a>.</p>
        </motion.div>
      </div>
    </main>
    </>
  );
};

export default Login;