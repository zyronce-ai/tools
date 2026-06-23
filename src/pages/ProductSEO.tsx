import { useState } from "react";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import ToolLoadingOverlay from "@/components/ToolLoadingOverlay";
import { streamFromEdge } from "@/lib/ai-stream";
import ReactMarkdown from "react-markdown";
import { FAQ } from "@/components/FAQ";

const platforms = [
  { value: "amazon", label: "Amazon India" },
  { value: "flipkart", label: "Flipkart" },
  { value: "meesho", label: "Meesho" },
  { value: "general", label: "General / Multi-platform" },
];

export default function ProductSEO() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [platform, setPlatform] = useState("general");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const analyze = async () => {
    if (!title.trim()) {
      toast({ title: "Enter product title!", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult("");
    await streamFromEdge({
      functionName: "product-seo",
      body: { title, description, keywords, platform },
      onDelta: (text) => setResult((prev) => prev + text),
      onDone: () => {
        setLoading(false);
        toast({ title: "SEO analysis ready! 📊" });
      },
      onError: (err) => {
        setLoading(false);
        toast({ title: "Error", description: err, variant: "destructive" });
      },
    });
  };

  return (
    <main className="space-y-6 max-w-4xl mx-auto">
      <SEO title="Product SEO Optimizer for Ecommerce" description="Optimize your Amazon & Flipkart product listings for higher search rankings. AI-powered SEO tool for ecommerce sellers." path="/product-seo" />
      <AnimatePresence>
        {loading && !result && <ToolLoadingOverlay message="Running SEO analysis…" />}
      </AnimatePresence>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          Product SEO Analyzer & Optimizer for Amazon, Flipkart & Ecommerce
        </h1>
        <p className="text-muted-foreground mt-1">Check your listing's SEO score and improve it</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Product Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Product Title *</Label>
            <Input
              placeholder="e.g. Cotton Kurti Set for Women - Pack of 3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label>Product Description (optional)</Label>
            <Textarea
              placeholder="Paste your current product description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <Label>Current Keywords (optional)</Label>
            <Input
              placeholder="e.g. kurti, women kurti, cotton kurti set"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
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
          <Button onClick={analyze} disabled={loading} className="w-full" size="lg">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            {loading ? "Analyzing SEO..." : "Analyze SEO"}
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
      <FAQ title="Frequently Asked Questions" id="product-seo" items={[
        { question: "What is product SEO and why is it important for ecommerce?", answer: "Product SEO is the process of optimizing your product listings to rank higher in search results on platforms like Amazon, Flipkart, and Google. Good SEO increases visibility, drives organic traffic, and directly boosts sales without ad spend." },
        { question: "How to rank higher on Amazon India?", answer: "Focus on backend search terms, use relevant keywords in your title and bullet points, maintain a high click-through rate, get positive reviews, and ensure your listing is complete with all specifications. Our analyzer checks these factors and scores your listing." },
        { question: "What keywords should I target for my product?", answer: "Target a mix of high-volume generic keywords and long-tail specific keywords. For example, instead of just 'kurti', target 'cotton kurti for women', 'printed kurti set', or 'festival wear kurti'. The tool analyzes your input to recommend the best keyword strategy." },
        { question: "How long should my product title be for SEO?", answer: "For Amazon, use up to 200 characters with the most important keywords first. For Flipkart, keep it between 60-80 characters. Include brand, product type, key attributes (color, size, material), and primary use case." },
        { question: "What is a good SEO score for a product listing?", answer: "A score above 80/100 is considered excellent. Scores between 60-80 indicate room for improvement. Our tool provides a detailed breakdown so you know exactly which elements need optimization." },
      ]} />
    </main>
  );
}
