import { Link } from "react-router-dom";
import { MessageCircle, History, Sparkles, ImageDown, Tags, Calculator, Search, Image, FileText, Eraser, ClipboardCheck, ZoomIn, Volume2, Palette, TrendingUp, ShieldAlert, SearchCheck, Rocket, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getContentHistory, platformIcons } from "@/lib/content-store";
import { motion } from "framer-motion";
import { useLang } from "@/lib/language-context";

const quickActions = [
  { title: "AI Chatbot", descKey: "card.ai_chatbot.desc", icon: MessageCircle, to: "/chat", bgGradient: "from-blue-500/20 to-blue-600/20", iconBg: "bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white" },
  { title: "Image Extractor", descKey: "card.image_extractor.desc", icon: ImageDown, to: "/images", bgGradient: "from-purple-500/20 to-purple-600/20", iconBg: "bg-purple-100 text-purple-600 group-hover:bg-purple-500 group-hover:text-white" },
  { title: "Product Keywords", descKey: "card.product_keywords.desc", icon: Tags, to: "/keywords", bgGradient: "from-green-500/20 to-green-600/20", iconBg: "bg-green-100 text-green-600 group-hover:bg-green-500 group-hover:text-white" },
  { title: "Pricing Calculator", descKey: "card.pricing_calculator.desc", icon: Calculator, to: "/pricing", bgGradient: "from-pink-500/20 to-pink-600/20", iconBg: "bg-pink-100 text-pink-600 group-hover:bg-pink-500 group-hover:text-white" },
  { title: "Competitor Analysis", descKey: "card.competitor_analysis.desc", icon: Search, to: "/competitor", bgGradient: "from-indigo-500/20 to-indigo-600/20", iconBg: "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white" },
  { title: "Banner Maker", descKey: "card.banner_maker.desc", icon: Image, to: "/banner", bgGradient: "from-rose-500/20 to-rose-600/20", iconBg: "bg-rose-100 text-rose-600 group-hover:bg-rose-500 group-hover:text-white" },
  { title: "GST Invoice", descKey: "card.gst_invoice.desc", icon: FileText, to: "/invoice", bgGradient: "from-cyan-500/20 to-cyan-600/20", iconBg: "bg-cyan-100 text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white" },
  { title: "BG Remover", descKey: "card.bg_remover.desc", icon: Eraser, to: "/bg-remover", bgGradient: "from-amber-500/20 to-amber-600/20", iconBg: "bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white" },
  { title: "Listing Scorer", descKey: "card.listing_scorer.desc", icon: ClipboardCheck, to: "/listing-scorer", bgGradient: "from-teal-500/20 to-teal-600/20", iconBg: "bg-teal-100 text-teal-600 group-hover:bg-teal-500 group-hover:text-white" },
  { title: "Image Upscaler", descKey: "card.image_upscaler.desc", icon: ZoomIn, to: "/image-upscaler", bgGradient: "from-fuchsia-500/20 to-fuchsia-600/20", iconBg: "bg-fuchsia-100 text-fuchsia-600 group-hover:bg-fuchsia-500 group-hover:text-white" },
  { title: "Text to Speech", descKey: "card.tts.desc", icon: Volume2, to: "/text-to-speech", bgGradient: "from-lime-500/20 to-lime-600/20", iconBg: "bg-lime-100 text-lime-600 group-hover:bg-lime-500 group-hover:text-white" },
  { title: "Logo Maker", descKey: "card.logo_maker.desc", icon: Palette, to: "/logo-maker", bgGradient: "from-violet-500/20 to-violet-600/20", iconBg: "bg-violet-100 text-violet-600 group-hover:bg-violet-500 group-hover:text-white" },
  { title: "Trending Products", descKey: "card.trending_products.desc", icon: TrendingUp, to: "/trending-products", bgGradient: "from-red-500/20 to-red-600/20", iconBg: "bg-red-100 text-red-600 group-hover:bg-red-500 group-hover:text-white" },
  { title: "Fake Review Detector", descKey: "card.fake_review.desc", icon: ShieldAlert, to: "/fake-review-detector", bgGradient: "from-yellow-500/20 to-yellow-600/20", iconBg: "bg-yellow-100 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white" },
  { title: "Product SEO", descKey: "card.product_seo.desc", icon: SearchCheck, to: "/product-seo", bgGradient: "from-emerald-500/20 to-emerald-600/20", iconBg: "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white" },
  { title: "Startup Guide", descKey: "card.startup_guide.desc", icon: Rocket, to: "/startup-guide", bgGradient: "from-sky-500/20 to-sky-600/20", iconBg: "bg-sky-100 text-sky-600 group-hover:bg-sky-500 group-hover:text-white" },
  { title: "Barcode/QR", descKey: "card.barcode.desc", icon: QrCode, to: "/barcode-generator", bgGradient: "from-stone-500/20 to-stone-600/20", iconBg: "bg-stone-100 text-stone-600 group-hover:bg-stone-500 group-hover:text-white" },
  { title: "History", descKey: "card.history.desc", icon: History, to: "/history", bgGradient: "from-gray-500/20 to-gray-600/20", iconBg: "bg-gray-100 text-gray-600 group-hover:bg-gray-500 group-hover:text-white" },
];

const Index = () => {
  const recent = getContentHistory().slice(0, 5);
  const { t } = useLang();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          {t("welcome.title")}
        </h1>
        <p className="text-muted-foreground text-lg">{t("welcome.subtitle")}</p>
      </motion.div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
         {quickActions.map((action, i) => (
           <motion.div 
             key={action.title} 
             initial={{ opacity: 0, y: 20 }} 
             animate={{ opacity: 1, y: 0 }} 
             whileHover={{ y: -6, scale: 1.02 }}
             transition={{ delay: i * 0.08, duration: 0.3 }}
           >
             <Link to={action.to}>
               <Card className={`group relative overflow-hidden hover:shadow-2xl hover:shadow-primary/15 transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30 h-full bg-gradient-to-br ${action.bgGradient}`}>
                 {/* Glow effect on hover */}
                 <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 group-hover:from-white/40 group-hover:to-white/20 transition-all duration-300 pointer-events-none" />
                 
                 <CardContent className="p-6 flex items-start gap-4 relative z-10">
                   <motion.div 
                     className={`p-3 rounded-xl ${action.iconBg} transition-all duration-300`}
                     whileHover={{ rotate: 12, scale: 1.15 }}
                     transition={{ duration: 0.3 }}
                   >
                     <action.icon className="h-6 w-6" />
                   </motion.div>
                   <div className="flex-1">
                     <h3 className="font-semibold text-lg group-hover:text-primary transition-colors duration-300">{action.title}</h3>
                     <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300">{t(action.descKey)}</p>
                   </div>
                 </CardContent>
               </Card>
             </Link>
           </motion.div>
         ))}
       </div>

      {recent.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t("recent_content")}</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/history">{t("view_all")}</Link>
            </Button>
          </div>
          <div className="space-y-2">
            {recent.map((item) => (
              <Card key={item.id} className="border-border/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-2xl">{platformIcons[item.platform]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.topic}</p>
                    <p className="text-sm text-muted-foreground truncate">{item.content.slice(0, 80)}...</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{item.createdAt.toLocaleDateString()}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Index;
