import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { streamFromEdge } from "@/lib/ai-stream";
import ReactMarkdown from "react-markdown";
import { useLang } from "@/lib/language-context";
import { AnimatePresence } from "framer-motion";
import ToolLoadingOverlay from "@/components/ToolLoadingOverlay";

const categories = [
  "Clothing & Fashion", "Electronics", "Home & Kitchen", "Beauty & Health",
  "Jewelry & Accessories", "Bags & Footwear", "Toys & Kids", "Sports & Fitness",
  "Books & Stationery", "Food & Grocery", "Other",
];

export default function CompetitorAnalysis() {
  const { toast } = useToast();
  const { t } = useLang();
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [platform, setPlatform] = useState("all");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const analyze = async () => {
    if (!productName.trim()) { toast({ title: t("competitor.name_required"), variant: "destructive" }); return; }
    setLoading(true); setResult("");
    try {
      let content = "";
      await streamFromEdge({
        functionName: "competitor-analysis",
        body: { productName, category, platform },
        onDelta: (chunk) => { content += chunk; setResult(content); },
        onDone: () => setLoading(false),
        onError: (err) => { toast({ title: "Error", description: err, variant: "destructive" }); setLoading(false); },
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const copyResult = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); toast({ title: "Copied! ✅" }); };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <AnimatePresence>
        {loading && !result && <ToolLoadingOverlay message="Analyzing competitors…" />}
      </AnimatePresence>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Search className="h-6 w-6 text-primary" />{t("competitor.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("competitor.subtitle")}</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">{t("pricing.product_details")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t("competitor.product_name")}</Label>
            <Input placeholder="e.g. Cotton Kurti Set, Bluetooth Earbuds, Kitchen Organizer" value={productName} onChange={(e) => setProductName(e.target.value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder={t("competitor.category_placeholder")} /></SelectTrigger>
                <SelectContent>{categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("pricing.platform")}</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="flipkart">Flipkart</SelectItem>
                  <SelectItem value="meesho">Meesho</SelectItem>
                  <SelectItem value="amazon">Amazon India</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={analyze} disabled={loading} className="w-full" size="lg">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            {loading ? t("competitor.analyzing") : t("competitor.analyze")}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t("competitor.result")}</CardTitle>
            <Button variant="outline" size="sm" onClick={copyResult}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>
          </CardHeader>
          <CardContent><div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div></CardContent>
        </Card>
      )}
    </div>
  );
}
