import { useState } from "react";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import ToolLoadingOverlay from "@/components/ToolLoadingOverlay";
import { streamFromEdge } from "@/lib/ai-stream";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

const markdownComponents: Components = {
  a: ({ href, children, ...props }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
  ),
};

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
  { value: "flipkart", label: "Flipkart" },
  { value: "amazon", label: "Amazon India" },
  { value: "meesho", label: "Meesho" },
];

const subCategories: Record<string, { value: string; label: string; url: string }[]> = {
  fashion: [
    { value: "all", label: "All Fashion", url: "" },
    { value: "men-topwear", label: "Men's Topwear", url: "https://www.flipkart.com/clothing-and-accessories/topwear/pr?sid=clo,ash" },
    { value: "men-bottomwear", label: "Men's Bottomwear", url: "https://www.flipkart.com/clothing-and-accessories/bottomwear/pr?sid=clo,vua" },
    { value: "men-winter", label: "Men's Winter Wear", url: "https://www.flipkart.com/clothing-and-accessories/winter-wear/pr?sid=clo,qvw" },
    { value: "women-kurtas", label: "Women's Kurtas & Kurtis", url: "https://www.flipkart.com/women-kurtas-kurtis/pr?sid=clo,cfr,x6l" },
    { value: "women-sarees", label: "Women's Sarees", url: "https://www.flipkart.com/sarees/pr?sid=clo,cfr,alj" },
    { value: "women-dresses", label: "Women's Dresses & Gowns", url: "https://www.flipkart.com/women-dresses-gowns/pr?sid=clo,cfr,voz" },
    { value: "women-jeans", label: "Women's Jeans", url: "https://www.flipkart.com/women-jeans/pr?sid=clo,cfr,vok" },
    { value: "men-footwear", label: "Men's Footwear", url: "https://www.flipkart.com/mens-footwear/pr?sid=osp,cil" },
    { value: "women-footwear", label: "Women's Footwear", url: "https://www.flipkart.com/womens-footwear/pr?sid=osp,iko" },
    { value: "handbags", label: "Women's Handbags", url: "https://www.flipkart.com/bags-wallets-belts/handbags-clutches/handbags/pr?sid=reh,ihu,m08" },
    { value: "watches", label: "Watches", url: "https://www.flipkart.com/watches/pr?sid=r18" },
    { value: "sunglasses", label: "Sunglasses", url: "https://www.flipkart.com/sunglasses/pr?sid=26x" },
  ],
  electronics: [
    { value: "all", label: "All Electronics", url: "" },
    { value: "mobiles", label: "Mobile Phones", url: "https://www.flipkart.com/mobiles/pr?sid=tyy,4io" },
    { value: "laptops", label: "Laptops", url: "https://www.flipkart.com/laptops/pr?sid=6bo,b5g" },
    { value: "tvs", label: "Televisions", url: "https://www.flipkart.com/televisions/pr?sid=ckf,czl" },
    { value: "headphones", label: "Headphones", url: "https://www.flipkart.com/headphones/pr?sid=0pm,0oo" },
    { value: "cameras", label: "Cameras", url: "https://www.flipkart.com/cameras/pr?sid=jek,p31" },
    { value: "smartwatches", label: "Smart Watches", url: "https://www.flipkart.com/smart-watches/pr?sid=ajby,n28" },
  ],
  beauty: [
    { value: "all", label: "All Beauty", url: "" },
    { value: "makeup", label: "Makeup", url: "https://www.flipkart.com/beauty-and-grooming/makeup/pr?sid=g9b,ffi" },
    { value: "haircare", label: "Hair Care", url: "https://www.flipkart.com/beauty-and-grooming/hair-care-and-accessory/pr?sid=g9b,lcf" },
    { value: "fragrances", label: "Fragrances", url: "https://www.flipkart.com/beauty-and-grooming/fragrances/pr?sid=g9b,0yh" },
    { value: "skincare", label: "Skin Care", url: "https://www.flipkart.com/beauty-and-grooming/skin-care/pr?sid=g9b,cl1" },
  ],
  home: [
    { value: "all", label: "All Home & Kitchen", url: "" },
    { value: "furniture", label: "Furniture", url: "https://www.flipkart.com/furniture/pr?sid=arb,g0k" },
    { value: "kitchen", label: "Kitchen & Dining", url: "https://www.flipkart.com/kitchen-dining/pr?sid=arb,hlx" },
    { value: "decor", label: "Home Decor", url: "https://www.flipkart.com/home-decor/pr?sid=arb,wbe" },
  ],
  health: [
    { value: "all", label: "All Health & Fitness", url: "" },
    { value: "fitness", label: "Fitness Equipment", url: "https://www.flipkart.com/fitness-equipment/pr?sid=hlc,2g4" },
    { value: "supplements", label: "Supplements", url: "https://www.flipkart.com/supplements/pr?sid=hlc,gt3" },
  ],
  toys: [
    { value: "all", label: "All Toys", url: "" },
    { value: "remote", label: "Remote Control Toys", url: "https://www.flipkart.com/remote-control-toys/pr?sid=mgl,wmq" },
  ],
  food: [
    { value: "all", label: "All Food & Grocery", url: "" },
    { value: "snacks", label: "Snacks & Branded Foods", url: "https://www.flipkart.com/snacks-and-branded-foods/pr?sid=eat,7d2" },
  ],
};

const sortOptions = [
  { value: "popularity", label: "Best Selling" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "recency_desc", label: "Newest First" },
];

const discountOptions = [
  { value: "any", label: "Any Discount" },
  { value: "30", label: "30% or more" },
  { value: "40", label: "40% or more" },
  { value: "50", label: "50% or more" },
  { value: "60", label: "60% or more" },
  { value: "70", label: "70% or more" },
];

const ratingOptions = [
  { value: "any", label: "Any Rating" },
  { value: "4", label: "4★ & above" },
  { value: "3", label: "3★ & above" },
];

export default function TrendingProducts() {
  const { toast } = useToast();
  const [category, setCategory] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [subCategory, setSubCategory] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [minDiscount, setMinDiscount] = useState("any");
  const [minRating, setMinRating] = useState("any");
  const [latchOnly, setLatchOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const currentSubs = subCategories[category] || [];

  const analyze = async () => {
    setLoading(true);
    setResult("");
    await streamFromEdge({
      functionName: "trending-products",
      body: {
        category,
        platform,
        subCategory: currentSubs.find((s) => s.value === subCategory)?.url || "",
        subCategoryLabel: currentSubs.find((s) => s.value === subCategory)?.label || "All",
        priceMin,
        priceMax,
        sortBy,
        minDiscount,
        minRating,
        latchOnly,
      },
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
      <SEO title="Trending Products" description="Discover trending products and market trends on Flipkart" path="/trending-products" />
      <AnimatePresence>
        {loading && !result && <ToolLoadingOverlay message="Finding trending products…" />}
      </AnimatePresence>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Trending Products Finder
        </h1>
        <p className="text-muted-foreground mt-1">What's trending on Flipkart right now — filter by price, sub-category, deals & more</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Search Filters</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => { setCategory(v); setSubCategory("all"); }}
              >
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
            {currentSubs.length > 0 && (
              <div>
                <Label>Sub-Category (Flipkart)</Label>
                <Select value={subCategory} onValueChange={setSubCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {currentSubs.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sortOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Min Price (₹)</Label>
              <Input type="number" min={0} placeholder="e.g. 500" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
            </div>
            <div>
              <Label>Max Price (₹)</Label>
              <Input type="number" min={0} placeholder="e.g. 5000" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
            </div>
            <div>
              <Label>Min Discount</Label>
              <Select value={minDiscount} onValueChange={setMinDiscount}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {discountOptions.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Min Rating</Label>
              <Select value={minRating} onValueChange={setMinRating}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ratingOptions.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={latchOnly} onCheckedChange={(v) => setLatchOnly(!!v)} />
            <span className="text-sm text-muted-foreground">Only products with Latch / Limited-Time Deals (⚡)</span>
          </label>
          <Button onClick={analyze} disabled={loading} className="w-full" size="lg">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TrendingUp className="h-4 w-4 mr-2" />}
            {loading ? "Analyzing..." : "Find Trending Products"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown components={markdownComponents}>{result}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
