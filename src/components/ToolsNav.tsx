import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/language-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle, History, ImageDown, Tags, Calculator,
  Search, Image, FileText, Eraser, ClipboardCheck, ZoomIn, Volume2,
  Menu, Moon, Sun, Languages, Bot, Upload, FileImage,
} from "lucide-react";

const tools = [
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
  { title: "Image Compressor", url: "/image-compressor", icon: FileImage },
  { title: "History", url: "/history", icon: History },
];

export function ToolsNav() {
  const location = useLocation();
  const { lang, setLang, t } = useLang();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const isHome = location.pathname === "/" || location.pathname === "/chat";

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 font-bold text-sm">
          <Bot className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">NayraBot</span>
        </Link>
      </div>

      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <Menu className="h-4 w-4" />
              <span className="hidden sm:inline">Tools</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-auto">
            {tools.map((tool) => (
              <DropdownMenuItem key={tool.url} asChild>
                <Link to={tool.url} className="flex items-center gap-2 cursor-pointer">
                  <tool.icon className="h-4 w-4" />
                  {tool.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLang(lang === "en" ? "hi" : "en")}>
          <Languages className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDark(!dark)}>
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
