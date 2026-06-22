import { useState } from "react";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import ToolLoadingOverlay from "@/components/ToolLoadingOverlay";
import { streamFromEdge } from "@/lib/ai-stream";
import ReactMarkdown from "react-markdown";

const budgetOptions = [
  { value: "under-10k", label: "Under ₹10,000" },
  { value: "10k-50k", label: "₹10,000 - ₹50,000" },
  { value: "50k-1l", label: "₹50,000 - ₹1,00,000" },
  { value: "1l-5l", label: "₹1,00,000 - ₹5,00,000" },
  { value: "5l-10l", label: "₹5,00,000 - ₹10,00,000" },
  { value: "10l+", label: "₹10,00,000+" },
  { value: "any", label: "Budget Flexible" },
];

const ideaCategories: Record<string, string[]> = {
  "🛒 E-Commerce & Reselling": [
    "Online Clothing Store", "Dropshipping Business", "Reselling on Meesho/Flipkart",
    "Print on Demand T-shirts", "Amazon FBA Seller", "Wholesale Business",
  ],
  "🍔 Food & Beverage": [
    "Cloud Kitchen", "Food Truck Business", "Tiffin Service", "Bakery / Cake Business",
    "Chai / Coffee Shop", "Ice Cream Parlour", "Juice & Smoothie Bar", "Pickle / Papad Making",
  ],
  "💻 IT & Digital": [
    "Digital Marketing Agency", "Web Development Agency", "App Development",
    "Social Media Management", "SEO Agency", "YouTube Channel", "Blogging",
    "Graphic Design Studio", "SaaS Product",
  ],
  "📚 Education & Coaching": [
    "Tuition / Online Coaching", "Skill Training Institute", "Spoken English Classes",
    "Competitive Exam Coaching", "Online Course Creator", "EdTech Startup",
  ],
  "🏥 Health & Beauty": [
    "Beauty & Skincare Brand", "Gym / Fitness Center", "Yoga Studio",
    "Salon / Parlour", "Ayurvedic Products", "Pharmacy / Medical Store",
  ],
  "🏭 Manufacturing & Production": [
    "Agarbatti Making", "Candle Making", "Detergent / Soap Making",
    "Paper Plate / Cup Making", "Garment Manufacturing", "Furniture Manufacturing",
    "LED Bulb Assembly", "Spice Grinding & Packaging",
  ],
  "🚗 Automobile & Transport": [
    "Car Washing Center", "Bike / Car Rental", "EV Charging Station",
    "Auto Parts Shop", "Logistics & Courier Service", "Driving School",
  ],
  "🏠 Home & Lifestyle": [
    "Home Decor & Handicrafts", "Interior Design Studio", "Laundry / Dry Cleaning",
    "Event Management", "Wedding Planning", "Pest Control Service",
    "Cleaning Service", "Nursery / Plant Business",
  ],
  "📱 Mobile & Electronics": [
    "Mobile Accessories Business", "Mobile Repair Shop", "CCTV Installation",
    "Computer / Laptop Repair", "Electronics Retail Store",
  ],
  "🌾 Agriculture & Rural": [
    "Organic Farming", "Dairy Farm", "Poultry Farm", "Mushroom Farming",
    "Fish Farming", "Honey Production", "Vermicompost Business",
  ],
  "💰 Finance & Services": [
    "Insurance Agency", "Stock Market Training", "CA / Tax Consultancy",
    "Real Estate Agency", "Franchise Business", "ATM Franchise",
  ],
  "📸 Creative & Media": [
    "Photography / Videography", "Video Editing Service", "Podcast Studio",
    "Content Writing Agency", "Animation Studio", "Music Production",
  ],
};


export default function StartupGuide() {
  const { toast } = useToast();
  const [businessIdea, setBusinessIdea] = useState("");
  const [budget, setBudget] = useState("any");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const analyze = async () => {
    if (!businessIdea.trim()) {
      toast({ title: "Enter a business idea!", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult("");
    await streamFromEdge({
      functionName: "startup-guide",
      body: { businessIdea, budget, location: location || "India" },
      onDelta: (text) => setResult((prev) => prev + text),
      onDone: () => {
        setLoading(false);
        toast({ title: "Startup guide ready! 🚀" });
      },
      onError: (err) => {
        setLoading(false);
        toast({ title: "Error", description: err, variant: "destructive" });
      },
    });
  };

  return (
    <main className="space-y-6 max-w-4xl mx-auto">
      <SEO title="Startup Guide" description="Step-by-step guide to launching your ecommerce business" path="/startup-guide" />
      <AnimatePresence>
        {loading && !result && <ToolLoadingOverlay message="Your business guide is being created…" />}
      </AnimatePresence>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Rocket className="h-6 w-6 text-primary" />
          Business Startup Guide
        </h1>
        <p className="text-muted-foreground mt-1">Enter any business idea — AI will tell you how to start, how much to invest, how much to earn</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle className="text-lg">Business Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Business Idea *</Label>
              <Input
                placeholder="e.g. Online Clothing Store"
                value={businessIdea}
                onChange={(e) => setBusinessIdea(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">💡 All Industries — click a category to select</Label>
              <div className="mt-1.5 space-y-1 max-h-[300px] overflow-y-auto pr-1">
                {Object.entries(ideaCategories).map(([category, ideas]) => (
                  <div key={category}>
                    <button
                      onClick={() => setExpandedCat(expandedCat === category ? null : category)}
                      className="w-full text-left text-xs font-semibold px-2 py-1.5 rounded-md bg-muted/40 hover:bg-muted/70 transition-colors flex items-center justify-between"
                    >
                      {category}
                      <span className="text-[10px] text-muted-foreground">{ideas.length}</span>
                    </button>
                    {expandedCat === category && (
                      <div className="flex flex-wrap gap-1 mt-1 mb-1.5 pl-1">
                        {ideas.map((idea) => (
                          <button
                            key={idea}
                            onClick={() => setBusinessIdea(idea)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                              businessIdea === idea
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/30 border-border hover:bg-muted/60"
                            }`}
                          >
                            {idea}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Budget</Label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {budgetOptions.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Location (optional)</Label>
              <Input
                placeholder="e.g. Mumbai, Delhi, Jaipur"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <Button onClick={analyze} disabled={loading} className="w-full" size="lg">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Rocket className="h-4 w-4 mr-2" />}
              {loading ? "Generating Guide..." : "Get Startup Guide"}
            </Button>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          {loading && !result && (
            <Card className="flex items-center justify-center h-80">
              <div className="text-center space-y-3">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">AI is creating your complete business guide...</p>
              </div>
            </Card>
          )}
          {result && (
            <Card>
              <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </CardContent>
            </Card>
          )}
          {!result && !loading && (
            <Card className="flex items-center justify-center h-80">
              <div className="text-center text-muted-foreground space-y-2">
                <Rocket className="h-12 w-12 mx-auto opacity-30" />
                <p>Select a business idea and get your guide!</p>
                <p className="text-xs">Investment, profit, suppliers, marketing — sab milega</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
