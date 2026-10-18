import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { signInWithGoogle } from "@/lib/firebase";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/chat", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      toast.success("Successfully logged in!");
      navigate("/chat");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error?.message || "Failed to login with Google");
    }
  };

  return (
    <>
      <SEO
        title="Login - NayraTools"
        description="Sign in to NayraTools with Google to access your AI ecommerce tools"
        path="/login"
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        {/* NAVBAR */}
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>NayraTools</span>
              </Link>
              <nav className="hidden md:flex items-center gap-8">
                <Link to="/#features" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">Features</Link>
                <Link to="/#pricing" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">Pricing</Link>
                <Link to="/blog" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">Blog</Link>
                <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">About Us</Link>
                <Link to="/contact" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">Contact</Link>
              </nav>
            </div>
          </div>
        </header>
        {/* Main Container */}
        <div className="flex-1 flex items-start justify-center pt-12">
          {/* Login Card */}
          <div className="w-[370px] bg-white rounded-[20px] border border-gray-200 shadow-lg p-7 flex flex-col items-center gap-4">

            {/* Logo Section */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-base">
                ✨
              </div>
              <span className="text-base font-bold text-gray-900">NayraTools</span>
            </div>

            {/* Heading */}
            <h1 className="text-[26px] font-bold text-gray-900 text-center mt-2">
              Welcome back
            </h1>

            {/* Subtitle */}
            <p className="text-xs text-gray-500 text-center">
              Sign in to access your AI tools
            </p>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-[312px] h-[45px] bg-white border border-gray-300 rounded-[11px] flex items-center justify-center gap-2 text-[15px] font-semibold text-gray-700 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 hover:shadow-md transition-all mt-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>

            {/* Help Button */}
            <button className="w-[312px] h-[41px] bg-gray-100 rounded-[11px] flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-all mt-3">
              <div className="w-[18px] h-[18px] rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                ?
              </div>
              Need help with sign in?
            </button>

            {/* Trust Indicators */}
            <div className="flex items-center gap-3 mt-3 mb-3">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px]">
                  ✓
                </div>
                Free forever
              </div>
              <div className="w-px h-3 bg-gray-300" />
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px]">
                  ✓
                </div>
                Secure
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-200 my-2" />

            {/* Footer Text */}
            <p className="text-[11px] text-gray-500 text-center leading-relaxed mt-2">
              Unlock all basic features instantly.<br />
              Upgrade anytime for pro tools.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-6 px-8 grid grid-cols-3 gap-8 items-center mt-auto">
          <div className="flex items-center gap-2 font-semibold text-sm text-gray-900">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-sm">
              ✨
            </div>
            NayraTools
          </div>
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="text-orange-500 font-bold">✓</span>
              Fast & Reliable
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="text-orange-500 font-bold">✓</span>
              Always Free
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="text-orange-500 font-bold">✓</span>
              Open APIs
            </div>
          </div>
          <div className="text-right text-xs text-gray-500">
            © 2026 NayraTools. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
};

export default Login;
