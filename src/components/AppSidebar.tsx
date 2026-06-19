import { MessageCircle, History, Moon, Sun, ImageDown, Tags, Calculator, Search, Image, FileText, Eraser, ClipboardCheck, ZoomIn, Volume2, Languages, Upload, Sparkles, Palette, TrendingUp, ShieldAlert, SearchCheck, Rocket, Key, QrCode, Flame, FileImage } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/language-context";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "AI Chatbot", url: "/", icon: MessageCircle },
  { title: "Startup Guide", url: "/startup-guide", icon: Rocket },
  { title: "Image & Video Extractor", url: "/images", icon: ImageDown },
  { title: "Product Keywords", url: "/keywords", icon: Tags },
  { title: "Pricing Calculator", url: "/pricing", icon: Calculator },
  { title: "Competitor Analysis", url: "/competitor", icon: Search },
  { title: "Banner Maker", url: "/banner", icon: Image },
  { title: "GST Invoice", url: "/invoice", icon: FileText },
  { title: "BG Remover", url: "/bg-remover", icon: Eraser },
  { title: "Listing Scorer", url: "/listing-scorer", icon: ClipboardCheck },
  { title: "Image Upscaler", url: "/image-upscaler", icon: ZoomIn },
  { title: "Text to Speech", url: "/text-to-speech", icon: Volume2 },
  { title: "Image to URL", url: "/image-to-url", icon: Upload },
  { title: "Logo Maker", url: "/logo-maker", icon: Palette },
  { title: "Trending Products", url: "/trending-products", icon: TrendingUp },
  { title: "Fake Review Detector", url: "/fake-review-detector", icon: ShieldAlert },
  { title: "Product SEO", url: "/product-seo", icon: SearchCheck },
  { title: "Barcode/QR", url: "/barcode-generator", icon: QrCode },
  { title: "Image Compressor", url: "/image-compressor", icon: FileImage },
  { title: "⚙️ API Settings", url: "/api-settings", icon: Key },
  { title: "History", url: "/history", icon: History },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { lang, setLang, t } = useLang();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <Sidebar collapsible="icon" className="bg-gradient-to-b from-sidebar-background via-sidebar-background to-sidebar-background border-r border-sidebar-border/50">
      <SidebarContent className="gap-6">
        {/* Header */}
        <SidebarGroup className="py-6 px-0 space-y-4">
          <SidebarGroupLabel className="px-4 space-y-3 flex items-center justify-between">
            <div className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              {!collapsed && (
                <span className="text-base font-bold tracking-tight text-sidebar-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  NayraTools
                </span>
              )}
            </div>
          </SidebarGroupLabel>
        </SidebarGroup>

        {/* Tools */}
        <SidebarGroup className="px-0 space-y-1">
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/60">
            {!collapsed && "Tools"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="group relative px-3 py-2.5 mx-2 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground transition-all duration-300 hover:bg-sidebar-accent/30"
                      activeClassName="bg-gradient-to-r from-sidebar-primary/20 to-sidebar-primary/10 text-sidebar-primary font-medium shadow-sm"
                    >
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-sidebar-primary/0 to-sidebar-primary/0 group-hover:from-sidebar-primary/5 group-hover:to-sidebar-primary/10 transition-all duration-300 pointer-events-none" />
                      <item.icon className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                      {!collapsed && (
                        <span className="text-sm group-hover:font-medium transition-all duration-300">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border/30 space-y-2 p-3">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={() => setLang(lang === "en" ? "hi" : "en")}
          className="group relative rounded-lg px-3 py-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 transition-all duration-300 w-full justify-start"
        >
          <Languages className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
          {!collapsed && <span className="text-sm ml-2 group-hover:font-medium transition-all">{lang === "en" ? "हिंदी" : "English"}</span>}
        </Button>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={() => setDark(!dark)}
          className="group relative rounded-lg px-3 py-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 transition-all duration-300 w-full justify-start"
        >
          {dark ? (
            <Sun className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
          ) : (
            <Moon className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
          )}
          {!collapsed && <span className="text-sm ml-2 group-hover:font-medium transition-all">{dark ? "Light" : "Dark"}</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
