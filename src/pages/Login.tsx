import { useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { Sparkles, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

const Login = () => {
  return (
    <>
      <SEO title="Sign In" description="Sign in to NayraTools to access your AI ecommerce tools" path="/login" />
      <main className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-400/30 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 bg-orange-300/10 rounded-full blur-3xl" />
          <div className="flex flex-col justify-between p-12 w-full relative z-10">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">NayraTools</span>
            </Link>
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Ek Platform.<br />Saare Tools.<br />Zyaada Sales.
              </h2>
              <div className="space-y-3">
                {["25+ AI ecommerce tools", "Free plan available", "Amazon • Flipkart • Shopify • Meesho"].map((t, i) => (
                  <div key={i} className="flex items-center gap-3 text-white/80">
                    <div className="h-2 w-2 rounded-full bg-white/60" />
                    <span className="text-sm">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Coming Soon Message */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md text-center"
          >
            <div className="mb-6">
              <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <Construction className="h-8 w-8 text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Login System Under Construction</h1>
              <p className="text-gray-500">We're building a better authentication system. Please check back soon!</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-700">
                <strong>Good news:</strong> You can still use all tools without login! Just navigate to any tool from the homepage.
              </p>
            </div>

            <Link to="/">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white py-6 px-8 rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all text-base font-semibold">
                ← Back to Home
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default Login;
