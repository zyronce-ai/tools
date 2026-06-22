import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { Bell, Search, Crown, Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingModal } from "@/components/PricingModal";
import { BreadcrumbSchema } from "@/components/JsonLd";

const breadcrumbNames: Record<string, string> = {
  "chat": "AI Chat",
  "history": "Content History",
  "images": "Image Extractor",
  "keywords": "Keyword Research",
  "pricing-calculator": "Pricing Calculator",
  "competitor": "Competitor Analysis",
  "banner": "Banner Maker",
  "invoice": "GST Invoice",
  "bg-remover": "Background Remover",
  "listing-scorer": "Listing Scorer",
  "image-upscaler": "Image Upscaler",
  "text-to-speech": "Text to Speech",
  "image-to-url": "Image to URL",
  "logo-maker": "Logo Maker",
  "trending-products": "Trending Products",
  "fake-review-detector": "Fake Review Detector",
  "product-seo": "Product SEO",
  "startup-guide": "Startup Guide",
  "api-settings": "API Settings",
  "barcode-generator": "Barcode Generator",
  "image-compressor": "Image Compressor",
  "profile": "Profile",
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const firstSegment = pathSegments[0] || "";
  const breadcrumbItems = [{ name: "Home", path: "/" }];
  if (firstSegment && breadcrumbNames[firstSegment]) {
    breadcrumbItems.push({ name: breadcrumbNames[firstSegment], path: `/${firstSegment}` });
  }

  return (
    <>
    <BreadcrumbSchema items={breadcrumbItems} />
    <div className="dashboard-dark min-h-screen flex bg-[#0F0F13] text-[#F1F1F5]">
      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-60 animate-slide-in">
            <AppSidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 max-h-screen">
        <header className="h-14 flex items-center gap-3 px-4 border-b border-[#2A2A38] bg-[#0F0F13]/80 backdrop-blur-md sticky top-0 z-30 flex-shrink-0">
          <button className="md:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-white/[0.06] text-[#8888A0]" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden md:flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-[#FF6B35] flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-heading text-sm font-bold text-[#F1F1F5]">NayraTools</span>
          </div>

          <div className="hidden sm:flex items-center flex-1 max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8888A0]" />
            <input
              type="text"
              placeholder="Search tools..."
              className="w-full h-9 pl-9 pr-4 rounded-xl bg-[#1E1E28] border border-[#2A2A38] text-sm text-[#F1F1F5] placeholder-[#8888A0]/60 focus:outline-none focus:border-[#FF6B35]/50 focus:ring-1 focus:ring-[#FF6B35]/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="h-9 w-9 rounded-xl bg-[#1E1E28] border border-[#2A2A38] flex items-center justify-center text-[#8888A0] hover:text-[#F1F1F5] hover:border-[#FF6B35]/30 transition-all relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-[#FF6B35] rounded-full text-[9px] font-bold text-white flex items-center justify-center">3</span>
            </button>
            <button onClick={() => setPricingOpen(true)}>
              <Button className="hidden sm:flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#FF6B35] text-white text-xs font-semibold hover:brightness-110 transition-all">
                <Crown className="h-3.5 w-3.5" />
                Upgrade to Pro
              </Button>
            </button>
            <UserProfileDropdown />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-0">
          {children}
        </main>
      </div>
      <PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} />
    </div>
    </>
  );
}
