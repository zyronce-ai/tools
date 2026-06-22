import { useState } from "react";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import ToolLoadingOverlay from "@/components/ToolLoadingOverlay";
import { streamFromEdge } from "@/lib/ai-stream";
import ReactMarkdown from "react-markdown";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "fashion", label: "Fashion & Clothing" },
  { value: "electronics", label: "Electronics & Gadgets" },
  { value: "beauty", label: "Beauty & Skincare" },
  { value: "home", label: "Home & Kitchen" },
  { value: "health", label: "Health & Fitness" },
  { value: "toys", label: "Toys & Baby Products" },
  { value: "food", label: "Food & Grocery" },
];

const platforms = [
  { value: "all", label: "All Platforms" },
  { value: "amazon", label: "Amazon India" },
  { value: "flipkart", label: "Flipkart" },
  { value: "meesho", label: "Meesho" },
];

export default function TrendingProducts() {
  const { toast } = useToast();
  const [category, setCategory] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const analyze = async () => {
    setLoading(true);
    setResult("");
    await streamFromEdge({
      functionName: "trending-products",
      body: { category, platform },
      onDelta: (text) => setResult((prev) => prev + text),
      onDone: () => {
        setLoading(false);
        toast({ title: "Trending products analysis ready! 🔥" });
      },
      onError: (err) => {
        setLoading(false);
        toast({ title: "Error", description: err, variant: "destructive" });
      },
    });
  };

  return (
    <main className="space-y-6 max-w-4xl mx-auto">
      <SEO title="Trending Products" description="Discover trending products and market trends" path="/trending-products" />
      <AnimatePresence>
        {loading && !result && <ToolLoadingOverlay message="Finding trending products…" />}
      </AnimatePresence>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Trending Products Finder
        </h1>
        <p className="text-muted-foreground mt-1">What's trending on marketplaces right now — find out with AI</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Search Filters</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={analyze} disabled={loading} className="w-full" size="lg">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TrendingUp className="h-4 w-4 mr-2" />}
            {loading ? "Analyzing..." : "Find Trending Products"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{result}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
