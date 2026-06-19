import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  MessageCircle, PenTool, Tags, Search, Calculator, Image,
  Eraser, ZoomIn, FileText, Sparkles, LayoutDashboard,
  ArrowRight, CheckCircle2, ImageDown,
  ClipboardCheck, Volume2, Palette, TrendingUp, ShieldAlert,
  SearchCheck, Rocket, QrCode, Star, ChevronDown, Menu, X,
  Layers, BarChart3, Globe, Clock, Users, GlobeIcon,
  Facebook, Twitter, Instagram, Linkedin, Youtube, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
const stagger = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.4 } };

const categories = [
  {
    name: "Text & Content", icon: PenTool,
    tools: [
      { icon: MessageCircle, name: "AI ChatBot", desc: "Ecommerce expert assistant — 24/7 support" },

      { icon: Tags, name: "Product Keywords", desc: "High-volume keyword research" },
      { icon: ClipboardCheck, name: "Listing Scorer", desc: "AI listing quality score & fixes" },
      { icon: SearchCheck, name: "Product SEO", desc: "SEO optimization for listings" },
      { icon: Search, name: "Competitor Analysis", desc: "Analyze competitor listings" },
    ],
  },
  {
    name: "Image Tools", icon: Image,
    tools: [
      { icon: Image, name: "Banner Maker", desc: "Eye-catching product banners" },
      { icon: Palette, name: "Logo Maker", desc: "Professional brand logos" },
      { icon: Eraser, name: "BG Remover", desc: "Remove image backgrounds" },
      { icon: ZoomIn, name: "Image Upscaler", desc: "Enhance image quality" },
      { icon: ImageDown, name: "Image Extractor", desc: "Extract from competitors" },
      { icon: Layers, name: "Image Compressor", desc: "Reduce image file size" },
    ],
  },
  {
    name: "Finance & Legal", icon: Calculator,
    tools: [
      { icon: Calculator, name: "Pricing Calculator", desc: "Profit margin & fee analysis" },
      { icon: FileText, name: "GST Invoice", desc: "Professional invoice generator" },
    ],
  },
  {
    name: "Research & Analysis", icon: BarChart3,
    tools: [
      { icon: TrendingUp, name: "Trending Products", desc: "Discover market trends" },
      { icon: ShieldAlert, name: "Fake Review Detector", desc: "Review authenticity check" },

    ],
  },
  {
    name: "Utility", icon: Zap,
    tools: [
      { icon: Volume2, name: "Text to Speech", desc: "Convert text to natural voice" },
      { icon: QrCode, name: "Barcode/QR", desc: "Generate barcodes & QR codes" },
      { icon: Rocket, name: "Startup Guide", desc: "Complete business start guide" },

    ],
  },
];

const benefits = [
  { icon: Layers, title: "25+ Tools in One Platform", desc: "Everything you need to grow your ecommerce business, all in one place." },
  { icon: Globe, title: "Works for All Platforms", desc: "Amazon, Flipkart, Shopify, Meesho — we support every marketplace." },
  { icon: Zap, title: "AI-Powered & Always Updated", desc: "Cutting-edge AI that improves daily. No manual work needed." },
  { icon: Clock, title: "Save Hours Every Day", desc: "Automate product research, content writing, and image editing." },
  { icon: Users, title: "Affordable for Every Seller", desc: "From startups to enterprise — pricing for every budget." },
  { icon: GlobeIcon, title: "Multi-Language Support", desc: "Work in Hindi, English, and more local languages." },
];

const testimonials = [
  { name: "Rahul Sharma", business: "Amazon Seller — Delhi", rating: 5, text: "NayraTools ne meri listing optimization me bahut madad ki. Keywords tool se maine 3x sales increase kiya." },
  { name: "Priya Patel", business: "Shopify Store — Mumbai", rating: 5, text: "NayraTools ne meri product listings optimize karke 3x sales increase kiya hai. Best tool for sellers!" },
  { name: "Amit Kumar", business: "Flipkart Seller — Bangalore", rating: 5, text: "Pricing Calculator se mujhe apni profit margins clear dikhti hain. Ab loss me koi product nahi bechta." },
];

const plans = [
  {
    name: "Free", price: "₹0", period: "forever", popular: false,
    features: ["AI ChatBot access", "Product Keywords (10/mo)", "Basic image tools", "Email support"],
  },
  {
    name: "Pro", price: "₹1,499", period: "/month", popular: true,
    features: ["All AI tools unlimited", "Advanced image editing", "Competitor analysis", "Trending products", "Priority support", "GST invoices", "Text to Speech"],
  },
  {
    name: "Business", price: "₹3,999", period: "/month", popular: false,
    features: ["Everything in Pro", "Unlimited requests", "API access", "Team accounts (5)", "Dedicated manager", "Custom integrations", "SLA guarantee"],
  },
];

const faqs = [
  { q: "What is NayraTools?", a: "NayraTools is an all-in-one AI-powered platform with 25+ tools designed specifically for ecommerce sellers. From content writing to image editing, pricing analysis to competitor research — everything you need in one place." },
  { q: "Is there a free plan?", a: "Yes! Our Free plan gives you access to AI ChatBot, Product Keywords, and basic image tools with limited monthly requests. Upgrade to Pro when you need more." },
  { q: "Which marketplaces do you support?", a: "We support all major Indian and global marketplaces including Amazon, Flipkart, Meesho, Myntra, Shopify, JioMart, and more. Our tools work across any platform." },
  { q: "Can I use it in Hindi?", a: "Absolutely! NayraTools supports multiple languages including Hindi, English, and Hinglish. Our AI ChatBot can respond in your preferred language." },
  { q: "How is this different from ChatGPT?", a: "Unlike generic AI chatbots, NayraTools is purpose-built for ecommerce. Our tools are specialized for product keywords, competitor analysis, pricing, GST invoices, and more — with marketplace-specific knowledge." },
  { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription anytime with no penalties. Your data stays with you, and you can export everything before canceling." },
];

const footerLinks = {
  product: ["AI ChatBot", "Image Tools", "Pricing Calculator", "Startup Guide", "All Tools"],
  company: ["About Us", "Blog", "Contact", "API Settings", "Startup Guide"],
  legal: ["Terms & Conditions", "Privacy Policy", "Refund Policy", "Cookie Policy"],
};

const LandingPage = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
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
              {["Features", "Pricing", "Blog", "About Us", "Contact"].map((item) => (
                <Link key={item} to={item === "Blog" ? "/blog" : item === "About Us" ? "/about" : item === "Contact" ? "/contact" : `/${item.toLowerCase().replace(/\s+/g, "-")}`} className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">{item}</Link>
              ))}
            </nav>
            <div className="flex items-center gap-3">
                <Link to="/login"><Button className="hidden md:inline-flex bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <button className="md:hidden p-2" onClick={() => setNavOpen(!navOpen)}>{navOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
            </div>
          </div>
        </div>
        <AnimatePresence>{navOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden border-t border-gray-100 bg-white overflow-hidden"><div className="px-4 py-4 space-y-3"><Link to="/chat" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setNavOpen(false)}>Features</Link><Link to="/pricing" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setNavOpen(false)}>Pricing</Link><Link to="/blog" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setNavOpen(false)}>Blog</Link><Link to="/about" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setNavOpen(false)}>About Us</Link><Link to="/contact" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setNavOpen(false)}>Contact</Link><Link to="/login"><Button className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-2">Get Started Free</Button></Link></div></motion.div>}</AnimatePresence>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-white to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100/40 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">🚀 25+ AI Tools for Ecommerce Sellers</div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
                One AI Platform.<br />Every Tool Your<br /><span className="text-orange-500">Ecommerce Business</span> Needs.
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg">From product listings to competitor analysis, image editing to pricing — NayraTools gives you 25+ AI-powered tools to grow your online business.</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login"><Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-200 hover:shadow-orange-300 px-8 py-6 text-base">Start Free <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
                <Link to="/startup-guide"><Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-6 text-base">Watch Demo</Button></Link>
              </div>
              <div className="flex items-center gap-4 mt-10 pt-6 border-t border-gray-100">
                <div className="flex -space-x-2"><div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 border-2 border-white" /><div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 border-2 border-white" /><div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-300 to-green-500 border-2 border-white" /><div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-300 to-purple-500 border-2 border-white" /></div>
                <p className="text-sm text-gray-500">Trusted by <span className="font-semibold text-gray-900">10,000+</span> sellers worldwide</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-8 bg-gray-50 border-b border-gray-100 flex items-center gap-1.5 px-4"><div className="h-2.5 w-2.5 rounded-full bg-red-400" /><div className="h-2.5 w-2.5 rounded-full bg-yellow-400" /><div className="h-2.5 w-2.5 rounded-full bg-green-400" /></div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="bg-orange-50 rounded-xl p-4"><div className="h-2 w-16 bg-orange-200 rounded mb-3" /><div className="h-2 w-full bg-orange-100 rounded mb-2" /><div className="h-2 w-3/4 bg-orange-100 rounded" /></div>
                  <div className="bg-blue-50 rounded-xl p-4"><div className="h-2 w-16 bg-blue-200 rounded mb-3" /><div className="h-2 w-full bg-blue-100 rounded mb-2" /><div className="h-2 w-3/4 bg-blue-100 rounded" /></div>
                  <div className="bg-green-50 rounded-xl p-4"><div className="h-2 w-16 bg-green-200 rounded mb-3" /><div className="h-2 w-full bg-green-100 rounded mb-2" /><div className="h-2 w-3/4 bg-green-100 rounded" /></div>
                  <div className="bg-purple-50 rounded-xl p-4"><div className="h-2 w-16 bg-purple-200 rounded mb-3" /><div className="h-2 w-full bg-purple-100 rounded mb-2" /><div className="h-2 w-3/4 bg-purple-100 rounded" /></div>
                </div>
                <div className="mt-4 h-8 bg-gray-100 rounded-lg flex items-center px-3"><div className="h-2 w-32 bg-gray-300 rounded" /></div>
              </div>
              <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-orange-500/10 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* TOOLS SHOWCASE */}
      <section className="py-20 md:py-28 bg-gray-50" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Sell More</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">25+ AI-powered tools across 5 categories — purpose-built for ecommerce sellers.</p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat, i) => (
              <button key={cat.name} onClick={() => setActiveCategory(i)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === i ? "bg-orange-500 text-white shadow-lg shadow-orange-200" : "bg-white text-gray-600 hover:bg-orange-50 border border-gray-200"}`}><cat.icon className="h-4 w-4" />{cat.name}</button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeCategory} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories[activeCategory].tools.map((tool) => (
                <Link key={tool.name} to={`/${tool.name.toLowerCase().replace(/[&\s]+/g, "-").replace(/--+/g, "-").replace(/^-|-$/g, "")}`} className="group bg-white rounded-xl p-5 border border-gray-100 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/30 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center flex-shrink-0 transition-colors"><tool.icon className="h-5 w-5 text-orange-600" /></div>
                    <div><h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">{tool.name}</h3><p className="text-sm text-gray-500 mt-0.5">{tool.desc}</p></div>
                  </div>
                </Link>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Three simple steps to transform your ecommerce business.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200" />
            {[
              { step: "01", icon: Users, title: "Create Free Account", desc: "Sign up in 30 seconds. No credit card required." },
              { step: "02", icon: LayoutDashboard, title: "Pick Your Tool", desc: "Choose from 25+ AI tools for your task." },
              { step: "03", icon: TrendingUp, title: "Generate & Grow", desc: "Get AI-powered results and boost sales." },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }} className="text-center relative">
                <div className="h-16 w-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg shadow-orange-100"><item.icon className="h-7 w-7 text-orange-600" /></div>
                <div className="text-5xl font-black text-orange-100 absolute top-0 right-0 -z-10">{item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose NayraTools?</h2>
            <p className="text-lg text-gray-600">Built by sellers, for sellers. Here's why thousands trust us.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="bg-white rounded-xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/20 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center mb-4 transition-colors"><b.icon className="h-6 w-6 text-orange-600" /></div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Loved by Sellers</h2>
            <p className="text-lg text-gray-600">Hear from real ecommerce sellers using NayraTools.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="bg-gray-50 rounded-xl p-6 border border-gray-100 relative">
                <div className="flex items-center gap-1 mb-4">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-orange-400 text-orange-400" />)}</div>
                <p className="text-gray-700 mb-6 text-sm leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">{t.name[0]}</div>
                  <div><p className="font-semibold text-gray-900 text-sm">{t.name}</p><p className="text-xs text-gray-500">{t.business}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 md:py-28 bg-gray-50" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600">Start free, upgrade when you grow.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-xl ${plan.popular ? "border-orange-400 shadow-xl shadow-orange-100" : "border-gray-100 hover:border-orange-200"}`}>
                {plan.popular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6"><span className="text-4xl font-bold text-gray-900">{plan.price}</span><span className="text-gray-500 ml-1">{plan.period}</span></div>
                <ul className="space-y-3 mb-8"><li></li>{plan.features.map((f, j) => <li key={j} className="flex items-start gap-3 text-sm text-gray-600"><CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />{f}</li>)}</ul>
                <Link to="/login"><Button className={`w-full ${plan.popular ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}>{plan.name === "Free" ? "Get Started" : plan.name === "Business" ? "Contact Sales" : "Subscribe Now"}</Button></Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>{openFaq === i && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}><div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">{faq.a}</div></motion.div>}</AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-orange-400/40 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-orange-300/20 rounded-full blur-3xl" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Grow Your Ecommerce Business?</h2>
            <p className="text-orange-100 text-lg mb-8">Join 10,000+ sellers who trust NayraTools to save time and increase sales.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="Enter your email" className="flex-1 px-5 py-3.5 rounded-xl border-0 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-300 focus:outline-none shadow-lg" />
              <Link to="/login"><Button className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-3.5 text-base font-semibold shadow-xl">Start Free Trial</Button></Link>
            </div>
            <p className="text-orange-200 text-sm mt-4">No credit card required • 30-day free trial</p>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center"><Sparkles className="h-4 w-4 text-white" /></div>
                <span className="text-lg font-bold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>NayraTools</span>
              </Link>
              <p className="text-sm text-gray-400 mb-6 max-w-xs">The all-in-one AI platform for ecommerce sellers. 25+ tools to grow your business.</p>
              <div className="flex gap-3">
                {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="h-9 w-9 rounded-lg bg-gray-800 hover:bg-orange-500 flex items-center justify-center transition-colors"><Icon className="h-4 w-4" /></a>
                ))}
              </div>
            </div>
            {[
              { title: "Product", links: footerLinks.product },
              { title: "Company", links: footerLinks.company },
              { title: "Legal", links: footerLinks.legal },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}><Link to={`/${link.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and")}`} className="text-sm text-gray-400 hover:text-orange-400 transition-colors">{link}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} NayraTools. All rights reserved.</p>
            <p className="text-sm text-gray-600">Made with ❤️ for ecommerce sellers everywhere</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
