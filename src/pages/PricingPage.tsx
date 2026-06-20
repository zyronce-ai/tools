import { Link } from "react-router-dom";
import { Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/PricingSection";
import { useState } from "react";

const PricingPage = () => {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
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
              {["Features", "Pricing", "Blog", "About Us", "Contact"].map((item) => (
                <Link key={item} to={item === "Blog" ? "/blog" : item === "Pricing" ? "/pricing" : item === "About Us" ? "/about" : item === "Contact" ? "/contact" : `/${item.toLowerCase().replace(/\s+/g, "-")}`} className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">{item}</Link>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/login"><Button className="hidden md:inline-flex bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all">Get Started Free</Button></Link>
              <button className="md:hidden p-2" onClick={() => setNavOpen(!navOpen)}>{navOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-8">
        <PricingSection showHeader={true} showTable={true} />
      </div>

      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center"><Sparkles className="h-4 w-4 text-white" /></div>
                <span className="text-lg font-bold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>NayraTools</span>
              </Link>
              <p className="text-sm text-gray-400 mb-6 max-w-xs">The all-in-one AI platform for ecommerce sellers. 25+ tools to grow your business.</p>
            </div>
            <div><h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Product</h4><ul className="space-y-3"><li><Link to="/chat" className="text-sm text-gray-400 hover:text-orange-400 transition-colors">AI ChatBot</Link></li><li><Link to="/keywords" className="text-sm text-gray-400 hover:text-orange-400 transition-colors">Image Tools</Link></li><li><Link to="/pricing" className="text-sm text-gray-400 hover:text-orange-400 transition-colors">Pricing Calculator</Link></li></ul></div>
            <div><h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Company</h4><ul className="space-y-3"><li><Link to="/about" className="text-sm text-gray-400 hover:text-orange-400 transition-colors">About Us</Link></li><li><Link to="/blog" className="text-sm text-gray-400 hover:text-orange-400 transition-colors">Blog</Link></li><li><Link to="/contact" className="text-sm text-gray-400 hover:text-orange-400 transition-colors">Contact</Link></li></ul></div>
            <div><h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Legal</h4><ul className="space-y-3"><li><Link to="/terms" className="text-sm text-gray-400 hover:text-orange-400 transition-colors">Terms & Conditions</Link></li><li><Link to="/privacy-policy" className="text-sm text-gray-400 hover:text-orange-400 transition-colors">Privacy Policy</Link></li></ul></div>
          </div>
        </div>
        <div className="border-t border-gray-800"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center"><p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} NayraTools. All rights reserved.</p></div></div>
      </footer>
    </div>
  );
};

export default PricingPage;