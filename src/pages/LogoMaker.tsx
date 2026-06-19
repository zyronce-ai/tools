import { useState } from "react";
import { getGeminiApiKey } from "@/lib/api-key-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Loader2, Download, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import ToolLoadingOverlay from "@/components/ToolLoadingOverlay";

const styles = [
  { value: "modern", label: "Modern & Minimal" },
  { value: "classic", label: "Classic & Elegant" },
  { value: "bold", label: "Bold & Vibrant" },
  { value: "playful", label: "Playful & Fun" },
  { value: "luxury", label: "Premium / Luxury" },
  { value: "tech", label: "Tech / Startup" },
];

const industries = [
  { value: "fashion", label: "Fashion & Clothing" },
  { value: "food", label: "Food & Restaurant" },
  { value: "tech", label: "Technology" },
  { value: "beauty", label: "Beauty & Cosmetics" },
  { value: "health", label: "Health & Fitness" },
  { value: "ecommerce", label: "Ecommerce / Online Store" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
];

const colorOptions = [
  { value: "auto", label: "Auto (AI Picks Best)" },
  { value: "blue", label: "Blue & White" },
  { value: "red", label: "Red & Black" },
  { value: "green", label: "Green & Gold" },
  { value: "purple", label: "Purple & Pink" },
  { value: "orange", label: "Orange & Yellow" },
  { value: "black", label: "Black & Gold" },
  { value: "multicolor", label: "Multicolor" },
];

export default function LogoMaker() {
  const { toast } = useToast();
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("ecommerce");
  const [style, setStyle] = useState("modern");
  const [colors, setColors] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");

  const generate = async () => {
    if (!brandName.trim()) {
      toast({ title: "Brand name daalo!", variant: "destructive" });
      return;
    }
    setLoading(true);
    setLogoUrl("");
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/logo-maker`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          brandName,
          industry,
          style,
          colors: colors === "auto" ? "auto-select best colors" : colors,
          userGeminiKey: getGeminiApiKey() || undefined,
        }),
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Logo generate failed");
      }
      const data = await resp.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (imageUrl) {
        setLogoUrl(imageUrl);
        toast({ title: "Logo ready! 🎨" });
      } else {
        throw new Error("Logo generate nahi ho paya");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const downloadLogo = () => {
    if (!logoUrl) return;
    const link = document.createElement("a");
    link.href = logoUrl;
    link.download = `${brandName.replace(/\s+/g, "-")}-logo.png`;
    link.click();
    toast({ title: "Logo downloaded! ✅" });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <AnimatePresence>
        {loading && <ToolLoadingOverlay message="AI se aapka brand logo bana raha hai…" />}
      </AnimatePresence>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          Logo Maker
        </h1>
        <p className="text-muted-foreground mt-1">AI se apne brand ka professional logo banao seconds mein</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Brand Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Brand Name *</Label>
              <Input
                placeholder="e.g. NayraFashion, TechZone, FoodieHub"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>
            <div>
              <Label>Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {industries.map((i) => (
                    <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Logo Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {styles.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Color Preference</Label>
              <Select value={colors} onValueChange={setColors}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {colorOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full" size="lg">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {loading ? "Generating Logo..." : "Generate Logo"}
            </Button>
          </CardContent>
        </Card>

        <div>
          {loading && (
            <Card className="flex items-center justify-center h-80">
              <div className="text-center space-y-3">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">AI aapka logo design kar raha hai...</p>
              </div>
            </Card>
          )}
          {logoUrl && !loading && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Your Logo</CardTitle>
                <Button variant="outline" size="sm" onClick={downloadLogo}>
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg p-6 border flex items-center justify-center">
                  <img src={logoUrl} alt={`${brandName} logo`} className="max-w-full max-h-80 object-contain" />
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  💡 Tip: Agar logo pasand nahi aaya to dubara generate karo — har baar naya design milega!
                </p>
              </CardContent>
            </Card>
          )}
          {!logoUrl && !loading && (
            <Card className="flex items-center justify-center h-80">
              <div className="text-center text-muted-foreground space-y-2">
                <Palette className="h-12 w-12 mx-auto opacity-30" />
                <p>Aapka logo yahan dikhega</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
