import { useState, useRef } from "react";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { streamFromEdge } from "@/lib/ai-stream";
import { Copy, Loader2, Tags, X, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import ToolLoadingOverlay from "@/components/ToolLoadingOverlay";
import { SEO } from "@/components/SEO";

type Platform = "flipkart" | "meesho" | "amazon" | "myntra" | "website";
type ListingType = "single" | "bulk";
const platformLabels: Record<Platform, string> = { flipkart: "🛒 Flipkart", meesho: "📦 Meesho", amazon: "📱 Amazon", myntra: "👗 Myntra", website: "🌐 Website" };
const platforms: Platform[] = ["flipkart", "meesho", "amazon", "myntra", "website"];
const fabricOptions = ["Cotton", "Silk", "Polyester", "Rayon", "Georgette", "Chiffon", "Crepe", "Linen", "Net", "Satin", "Velvet", "Lycra", "Denim", "Wool", "Other"];

const ProductKeywords = () => {
  const [productName, setProductName] = useState("");
  const [fabric, setFabric] = useState("");
  const [customFabric, setCustomFabric] = useState("");
  const [platform, setPlatform] = useState<Platform>("flipkart");
  const [listingType, setListingType] = useState<ListingType>("single");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast({ title: "Image too large", description: "Max 5MB allowed", variant: "destructive" }); return; }
    const reader = new FileReader();
    reader.onload = () => { const base64 = reader.result as string; setImagePreview(base64); setImageBase64(base64); };
    reader.readAsDataURL(file);
  };

  const removeImage = () => { setImagePreview(null); setImageBase64(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const generate = async () => {
    const selectedFabric = fabric === "Other" ? customFabric : fabric;
    if (!productName.trim() && !imageBase64) { toast({ title: "Enter product name or upload an image", variant: "destructive" }); return; }
    setLoading(true); setOutput("");
    let fullContent = "";
    await streamFromEdge({
      functionName: "product-keywords",
      body: { productName, fabric: selectedFabric, platform, listingType, imageBase64 },
      onDelta: (chunk) => { fullContent += chunk; setOutput(fullContent); },
      onDone: () => {
        setLoading(false);
        // For bulk listing, replace commas with :: in keyword sections
        if (platform === "flipkart" && listingType === "bulk" && fullContent) {
          const converted = fullContent.replace(
            /(## 🔥.*?(?=## )|## 🧩.*?(?=## )|## 🔍.*?(?=## |$))/gs,
            (section) => section.replace(/,\s*/g, " :: ")
          );
          setOutput(converted);
        }
        if (fullContent) toast({ title: "Keywords generated! 🏷️" });
      },
      onError: (err) => { toast({ title: "Error", description: err, variant: "destructive" }); setLoading(false); },
    });
  };

  const copyToClipboard = () => { navigator.clipboard.writeText(output); toast({ title: "Copied! 📋" }); };

  return (
    <main>
      <SEO title="Keyword Research Tool" description="Find high-ranking keywords for Amazon, Flipkart & Shopify products. AI-powered keyword research tool for ecommerce sellers." path="/keywords" />
      <div className="max-w-3xl mx-auto space-y-6">
      <AnimatePresence>
        {loading && !output && <ToolLoadingOverlay message="Finding best keywords for your product…" />}
      </AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Tags className="h-7 w-7 text-primary" />{"Product Keyword Generator"}</h1>
        <p className="text-muted-foreground mt-1">{"Upload product image, select fabric, get keywords & descriptions!"}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label>{"Product Image"}</Label>
              <div className="flex items-start gap-4">
                {imagePreview ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
                    <img src={imagePreview} alt="Product" className="w-full h-full object-cover" />
                    <button onClick={removeImage} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-80"><X className="h-3 w-3" /></button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors cursor-pointer">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" /><span className="text-xs text-muted-foreground">{"Upload"}</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="productName">{"Product Name"}</Label>
                  <Input id="productName" placeholder="e.g. Women's Banarasi Silk Saree" value={productName} onChange={(e) => setProductName(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{"Fabric"}</Label>
              <div className="flex flex-wrap gap-2">
                {fabricOptions.map((f) => (
                  <Button key={f} variant={fabric === f ? "default" : "outline"} size="sm" onClick={() => setFabric(f)} className="transition-all">{f}</Button>
                ))}
              </div>
              {fabric === "Other" && <Input placeholder={"Enter custom fabric name..."} value={customFabric} onChange={(e) => setCustomFabric(e.target.value)} className="mt-2" />}
            </div>

            <div className="space-y-2">
              <Label>{"Platform"}</Label>
              <div className="flex flex-wrap gap-2">
                {platforms.map((p) => (
                  <Button key={p} variant={platform === p ? "default" : "outline"} size="sm" onClick={() => setPlatform(p)} className="transition-all">{platformLabels[p]}</Button>
                ))}
              </div>
            </div>

            {platform === "flipkart" && (
              <div className="space-y-2">
                <Label>Listing Type</Label>
                <div className="flex flex-wrap gap-2">
                  <Button variant={listingType === "single" ? "default" : "outline"} size="sm" onClick={() => setListingType("single")} className="transition-all">
                    📦 Single Listing
                  </Button>
                  <Button variant={listingType === "bulk" ? "default" : "outline"} size="sm" onClick={() => setListingType("bulk")} className="transition-all">
                    📋 Bulk Listing
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {listingType === "single" ? "Keywords will be comma (,) separated" : "Keywords will be double colon (::) separated - for bulk upload"}
                </p>
              </div>
            )}

            <Button onClick={generate} disabled={loading} className="w-full" size="lg">
              {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>) : "🏷️ Generate Keywords & Description"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {output && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{"Generated Keywords & Description"}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-1" /> {"Copy"}</Button>
              <Button variant="outline" size="sm" onClick={generate} disabled={loading}>🔄 {"Regenerate"}</Button>
            </div>
          </div>
          {(() => {
            const sections = output.split(/^## /gm).filter(Boolean);
            const sectionColors = [
              "border-l-4 border-l-purple-500 bg-purple-500/5",
              "border-l-4 border-l-blue-500 bg-blue-500/5",
              "border-l-4 border-l-green-500 bg-green-500/5",
              "border-l-4 border-l-orange-500 bg-orange-500/5",
              "border-l-4 border-l-pink-500 bg-pink-500/5",
              "border-l-4 border-l-cyan-500 bg-cyan-500/5",
              "border-l-4 border-l-yellow-500 bg-yellow-500/5",
            ];
            return sections.map((section, i) => {
              const lines = section.split("\n");
              const title = lines[0]?.trim() || "";
              const body = lines.slice(1).join("\n").trim();
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className={`${sectionColors[i % sectionColors.length]} overflow-hidden`}>
                    <CardHeader className="pb-2 pt-4 px-5">
                      <CardTitle className="text-base font-bold">{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{body}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            });
          })()}
        </motion.div>
      )}
    </div>
    </main>
  );
};

export default ProductKeywords;
