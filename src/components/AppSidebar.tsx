import { useState } from "react";
import { MessageCircle, History, Tags, SearchCheck, ClipboardCheck, TrendingUp, Search, ShieldAlert, Image, Palette, Eraser, ZoomIn, FileImage, Upload, FileText, Calculator, QrCode, Rocket, Volume2, ImageDown, Key, ChevronDown, Crown, Sparkles, Bot } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { PricingModal } from "@/components/PricingModal";

type ToolGroup = {
  label: string;
  color: string;
  items: { title: string; url: string; icon: React.ElementType; pro?: boolean; color: string }[];
};

const toolGroups: ToolGroup[] = [
  {
    label: "AI Tools",
    color: "from-purple-500 to-purple-600",
    items: [
      { title: "AI Chatbot", url: "/chat", icon: MessageCircle, color: "#7C3AED" },
    ],
  },
  {
    label: "Listing Tools",
    color: "from-orange-500 to-orange-600",
    items: [
      { title: "Product Keywords", url: "/keywords", icon: Tags, color: "#FF6B35" },
      { title: "Listing Scorer", url: "/listing-scorer", icon: ClipboardCheck, color: "#FF6B35" },
      { title: "Product SEO", url: "/product-seo", icon: SearchCheck, color: "#FF6B35", pro: true },
      { title: "Trending Products", url: "/trending-products", icon: TrendingUp, color: "#FF6B35", pro: true },
      { title: "Competitor Analysis", url: "/competitor", icon: Search, color: "#FF6B35", pro: true },
      { title: "Fake Review Detector", url: "/fake-review-detector", icon: ShieldAlert, color: "#FF6B35", pro: true },
    ],
  },
  {
    label: "Design Tools",
    color: "from-blue-500 to-blue-600",
    items: [
      { title: "Banner Maker", url: "/banner", icon: Image, color: "#3B82F6" },
      { title: "Logo Maker", url: "/logo-maker", icon: Palette, color: "#3B82F6" },
      { title: "BG Remover", url: "/bg-remover", icon: Eraser, color: "#3B82F6" },
      { title: "Image Upscaler", url: "/image-upscaler", icon: ZoomIn, color: "#3B82F6" },
      { title: "Image Compressor", url: "/image-compressor", icon: FileImage, color: "#3B82F6" },
      { title: "Image to URL", url: "/image-to-url", icon: Upload, color: "#3B82F6" },
      { title: "Image Extractor", url: "/images", icon: ImageDown, color: "#3B82F6" },
    ],
  },
  {
    label: "Finance Tools",
    color: "from-emerald-500 to-emerald-600",
    items: [
      { title: "GST Invoice", url: "/invoice", icon: FileText, color: "#10B981" },
      { title: "Pricing Calculator", url: "/pricing-calculator", icon: Calculator, color: "#10B981" },
      { title: "Barcode/QR", url: "/barcode-generator", icon: QrCode, color: "#10B981" },
    ],
  },
  {
    label: "Other",
    color: "from-gray-500 to-gray-600",
    items: [
      { title: "Startup Guide", url: "/startup-guide", icon: Rocket, color: "#8888A0" },
      { title: "Text to Speech", url: "/text-to-speech", icon: Volume2, color: "#8888A0" },
      { title: "API Settings", url: "/api-settings", icon: Key, color: "#8888A0" },
      { title: "History", url: "/history", icon: History, color: "#8888A0" },
    ],
  },
];

export function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [pricingOpen, setPricingOpen] = useState(false);

  const isActive = (url: string) => {
    if (url === "/chat") return location.pathname === "/chat";
    return location.pathname.startsWith(url);
  };

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();
  const plan = "Free";

  return (
    <div className={cn(
      "flex flex-col h-full transition-all duration-200",
      "bg-[#16161D] border-r border-[#2A2A38]",
      collapsed ? "w-[60px]" : "w-60"
    )}>
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-[#2A2A38] flex-shrink-0">
        <div className="h-8 w-8 rounded-lg bg-[#FF6B35] flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-heading text-base font-bold text-[#F1F1F5] tracking-tight">NayraTools</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin py-2 px-2 space-y-1">
        {toolGroups.map((group) => {
          const groupOpen = openGroups.includes(group.label);
          return (
            <div key={group.label}>
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#8888A0]/60 hover:text-[#8888A0] transition-colors"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-[#FF6B35]" />
                  {group.label}
                  <ChevronDown className={cn("h-3 w-3 ml-auto transition-transform", groupOpen && "rotate-180")} />
                </button>
              )}
              {groupOpen && group.items.map((item) => {
                const active = isActive(item.url);
                return (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    className={cn(
                      "group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                      collapsed ? "justify-center mx-0" : "mx-0",
                      active
                        ? "bg-[#FF6B35]/10 text-[#F1F1F5] font-medium"
                        : "text-[#8888A0] hover:text-[#F1F1F5] hover:bg-white/[0.04]"
                    )}
                  >
                    {active && !collapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-[#FF6B35] shadow-[0_0_8px_#FF6B3555]" />
                    )}
                    <div className={cn(
                      "h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200",
                      active
                        ? "bg-[#FF6B35]/10"
                        : "group-hover:bg-white/[0.04]"
                    )}>
                      <item.icon className="h-4 w-4" style={{ color: active ? '#FF6B35' : item.color }} />
                    </div>
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1">{item.title}</span>
                        {item.pro && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-[#7C3AED] bg-[#7C3AED]/10 px-1.5 py-0.5 rounded-full">
                            <Crown className="h-2.5 w-2.5" />
                            PRO
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.pro && (
                      <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-[#7C3AED] rounded-full flex items-center justify-center">
                        <Crown className="h-2 w-2 text-white" />
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="border-t border-[#2A2A38] p-3">
        {!collapsed ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-[#FF6B35] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F1F1F5] truncate">{displayName}</p>
                <p className="text-[11px] text-[#7C3AED] font-semibold">{plan} Plan</p>
              </div>
            </div>
            <button onClick={() => setPricingOpen(true)} className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-[#FF6B35] text-white text-xs font-semibold hover:brightness-110 transition-all">
              <Crown className="h-3.5 w-3.5" />
              Upgrade to Pro
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#FF6B35] flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <button onClick={() => setPricingOpen(true)} className="h-7 w-7 rounded-lg bg-[#FF6B35] flex items-center justify-center hover:brightness-110 transition-all">
              <Crown className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        )}
      </div>
      <PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} />
    </div>
  );
}
