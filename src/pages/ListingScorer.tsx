import { useState } from "react";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardCheck, Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { streamFromEdge } from "@/lib/ai-stream";
import ReactMarkdown from "react-markdown";
import { AnimatePresence } from "framer-motion";
import ToolLoadingOverlay from "@/components/ToolLoadingOverlay";
import { SEO } from "@/components/SEO";

export default function ListingScorer() {
  const { toast } = useToast();
  const [listingUrl, setListingUrl] = useState("");
  const [platform, setPlatform] = useState("auto");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const analyze = async () => {
    if (!listingUrl.trim()) { toast({ title: "Enter product listing URL", variant: "destructive" }); return; }
    setLoading(true); setResult("");
    try {
      let content = "";
      await streamFromEdge({
        functionName: "listing-scorer", body: { listingUrl, platform },
        onDelta: (chunk) => { content += chunk; setResult(content); },
        onDone: () => setLoading(false),
        onError: (err) => { toast({ title: "Error", description: err, variant: "destructive" }); setLoading(false); },
      });
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const copyResult = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); toast({ title: "Copied! ✅" }); };

  return (
    <main>
      <SEO title="Listing Scorer" description="Score and optimize your product listings for better sales" path="/listing-scorer" />
      <div className="space-y-6 max-w-4xl mx-auto">
      <AnimatePresence>
        {loading && !result && <ToolLoadingOverlay message="Scoring your listing…" />}
      </AnimatePresence>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardCheck className="h-6 w-6 text-primary" />{"Listing Quality Scorer"}</h1>
        <p className="text-muted-foreground mt-1">{"Paste your product listing link — AI will score it and give improvement tips"}</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Product Listing</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{"Product Listing URL *"}</Label>
            <Input placeholder="e.g. https://www.flipkart.com/product/..." value={listingUrl} onChange={(e) => setListingUrl(e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1">{"Paste any Flipkart, Meesho, or Amazon product link"}</p>
          </div>
          <div>
            <Label>{"Platform"}</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto Detect</SelectItem>
                <SelectItem value="flipkart">Flipkart</SelectItem>
                <SelectItem value="meesho">Meesho</SelectItem>
                <SelectItem value="amazon">Amazon India</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={analyze} disabled={loading} className="w-full" size="lg">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ClipboardCheck className="h-4 w-4 mr-2" />}
            {loading ? "Analyzing..." : "Analyze Listing"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{"Analysis Report"}</CardTitle>
            <Button variant="outline" size="sm" onClick={copyResult}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>
          </CardHeader>
          <CardContent><div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div></CardContent>
        </Card>
      )}
    </div>
    </main>
  );
}
