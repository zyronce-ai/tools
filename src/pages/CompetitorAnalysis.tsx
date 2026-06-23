import { useState } from "react";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { streamFromEdge } from "@/lib/ai-stream";
import ReactMarkdown from "react-markdown";
import { AnimatePresence } from "framer-motion";
import ToolLoadingOverlay from "@/components/ToolLoadingOverlay";
import { SEO } from "@/components/SEO";
import { FAQ } from "@/components/FAQ";

const categories = [
  "Clothing & Fashion", "Electronics", "Home & Kitchen", "Beauty & Health",
  "Jewelry & Accessories", "Bags & Footwear", "Toys & Kids", "Sports & Fitness",
  "Books & Stationery", "Food & Grocery", "Other",
];

export default function CompetitorAnalysis() {
  const { toast } = useToast();
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [platform, setPlatform] = useState("all");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const analyze = async () => {
    if (!productName.trim()) { toast({ title: "Enter product name", variant: "destructive" }); return; }
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
    <main>
      <SEO title="Competitor Analysis Tool" description="Analyze competitor product listings with AI. Get pricing insights, keyword gaps, and optimization tips for Amazon & Flipkart sellers." path="/competitor" />
      <div className="space-y-6 max-w-4xl mx-auto">
      <AnimatePresence>
        {loading && !result && <ToolLoadingOverlay message="Analyzing competitors…" />}
      </AnimatePresence>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Search className="h-6 w-6 text-primary" />{"Competitor Analysis Tool for Ecommerce Sellers"}</h1>
        <p className="text-muted-foreground mt-1">{"Analyze product market — pricing, keywords, competition level"}</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">{"Product Details"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{"Product Name *"}</Label>
            <Input placeholder="e.g. Cotton Kurti Set, Bluetooth Earbuds, Kitchen Organizer" value={productName} onChange={(e) => setProductName(e.target.value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder={"Select category"} /></SelectTrigger>
                <SelectContent>{categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>{"Platform"}</Label>
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
            {loading ? "Analyzing..." : "Analyze Competition"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{"Analysis Result"}</CardTitle>
            <Button variant="outline" size="sm" onClick={copyResult}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>
          </CardHeader>
          <CardContent><div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div></CardContent>
        </Card>
      )}
    </div>
      <FAQ title="Frequently Asked Questions" id="competitor-analysis" items={[
        { q: "How to analyze competitor listings on Amazon and Flipkart?", a: "Simply enter your product name, select the category and platform (Amazon India, Flipkart, or Meesho), and click Analyze. Our AI will scan competitor listings to provide pricing insights, keyword gaps, and listing optimization tips." },
        { q: "What competitor metrics matter most for ecommerce?", a: "Key metrics include pricing strategy, keyword density in titles, rating distribution, review sentiment, image quality, feature comparison, and seller response patterns. Our tool analyzes all of these automatically." },
        { q: "How to find competitor keywords for better rankings?", a: "The tool identifies high-performing keywords used by top competitors in their product titles and descriptions. It highlights which keywords you are missing and suggests a prioritized keyword strategy to improve your search ranking." },
        { q: "Can I compare competitors across multiple platforms?", a: "Yes, you can analyze competitors across Amazon India, Flipkart, Meesho, or all platforms at once to understand how the same product category performs differently on each marketplace." },
        { q: "Is this competitor analysis tool free for sellers?", a: "Absolutely. The competitor analysis tool is free to use with no usage limits. You can run unlimited analyses for any product category to stay ahead of the competition." },
      ]} />
    </main>
  );
}
