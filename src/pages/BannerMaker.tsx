import { useState } from "react";
import { getGeminiApiKey } from "@/lib/api-key-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/language-context";
import { AnimatePresence } from "framer-motion";
import ToolLoadingOverlay from "@/components/ToolLoadingOverlay";

const styles = [
  { value: "modern", label: "Modern & Clean" },
  { value: "festive", label: "Festive / Sale" },
  { value: "minimal", label: "Minimal & Elegant" },
  { value: "bold", label: "Bold & Colorful" },
  { value: "luxury", label: "Premium / Luxury" },
];

const platforms = [
  { value: "instagram", label: "Instagram (1080x1080)" },
  { value: "facebook", label: "Facebook (1200x628)" },
  { value: "whatsapp", label: "WhatsApp Status (800x800)" },
  { value: "website", label: "Website Banner (1920x950)" },
];

export default function BannerMaker() {
  const { toast } = useToast();
  const { t } = useLang();
  const [productName, setProductName] = useState("");
  const [offerText, setOfferText] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [style, setStyle] = useState("modern");
  const [loading, setLoading] = useState(false);
  const [bannerUrl, setBannerUrl] = useState("");
  const [generatedPlatform, setGeneratedPlatform] = useState<string | null>(null);

  const sizeMap: Record<string, { w: number; h: number }> = {
    instagram: { w: 1080, h: 1080 }, facebook: { w: 1200, h: 628 }, whatsapp: { w: 800, h: 800 }, website: { w: 1920, h: 950 },
  };

  const toExactSize = (src: string, w: number, h: number) =>
    new Promise<string>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => { const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h; const ctx = canvas.getContext("2d"); if (!ctx) return reject(new Error("Canvas unavailable")); ctx.drawImage(img, 0, 0, w, h); resolve(canvas.toDataURL("image/png")); };
      img.onerror = () => reject(new Error("Image resize failed"));
      img.src = src;
    });

  const generate = async () => {
    if (!productName.trim() || !offerText.trim()) { toast({ title: t("banner.required"), variant: "destructive" }); return; }
    setLoading(true); setBannerUrl(""); setGeneratedPlatform(null);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/banner-maker`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ productName, offerText, platform, style, userGeminiKey: getGeminiApiKey() || undefined }),
      });
      if (!resp.ok) { const err = await resp.json(); throw new Error(err.error || "Banner generate failed"); }
      const data = await resp.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (imageUrl) {
        const { w, h } = sizeMap[platform] || { w: 1080, h: 1080 };
        const exactSizedImage = await toExactSize(imageUrl, w, h);
        setBannerUrl(exactSizedImage); setGeneratedPlatform(platform);
        toast({ title: `Banner ready (${w}x${h}) 🎨` });
      } else { throw new Error(t("banner.failed")); }
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const downloadBanner = () => {
    if (!bannerUrl) return;
    const targetPlatform = generatedPlatform || platform;
    const { w, h } = sizeMap[targetPlatform] || { w: 1080, h: 1080 };
    const link = document.createElement("a"); link.href = bannerUrl;
    link.download = `banner-${productName.replace(/\s+/g, "-")}-${w}x${h}.png`; link.click();
    toast({ title: `Downloaded ${w}x${h}` });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <AnimatePresence>
        {loading && <ToolLoadingOverlay message="Creating your banner with AI…" />}
      </AnimatePresence>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Image className="h-6 w-6 text-primary" />{t("banner.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("banner.subtitle")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">{t("banner.details")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>{t("banner.product_name")}</Label><Input placeholder="e.g. Cotton Kurti Set, Bluetooth Earbuds" value={productName} onChange={(e) => setProductName(e.target.value)} /></div>
            <div><Label>{t("banner.offer_text")}</Label><Input placeholder="e.g. Flat 50% OFF, Buy 2 Get 1 Free, ₹299 Only" value={offerText} onChange={(e) => setOfferText(e.target.value)} /></div>
            <div>
              <Label>{t("banner.platform")}</Label>
              <Select value={platform} onValueChange={setPlatform}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{platforms.map((p) => (<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>))}</SelectContent></Select>
            </div>
            <div>
              <Label>{t("banner.style")}</Label>
              <Select value={style} onValueChange={setStyle}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{styles.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent></Select>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full" size="lg">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Image className="h-4 w-4 mr-2" />}
              {loading ? t("banner.generating") : t("banner.generate")}
            </Button>
          </CardContent>
        </Card>

        <div>
          {loading && (
            <Card className="flex items-center justify-center h-64">
              <div className="text-center space-y-3"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /><p className="text-muted-foreground">{t("banner.ai_creating")}</p></div>
            </Card>
          )}
          {bannerUrl && !loading && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{t("banner.result")}</CardTitle>
                <Button variant="outline" size="sm" onClick={downloadBanner}><Download className="h-4 w-4 mr-1" /> {t("download")}</Button>
              </CardHeader>
              <CardContent>
                <img src={bannerUrl} alt="Generated promotional banner" className="w-full rounded-lg border" />
                <p className="text-xs text-muted-foreground mt-3">{t("banner.tip")}</p>
              </CardContent>
            </Card>
          )}
          {!bannerUrl && !loading && (
            <Card className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground space-y-2"><Image className="h-12 w-12 mx-auto opacity-30" /><p>{t("banner.preview_area")}</p></div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
