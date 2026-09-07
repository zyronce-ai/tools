import { useState, useMemo, useEffect, useCallback } from "react";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp, Loader2, Star, ExternalLink, Flame, ShoppingCart, Bookmark,
  BookmarkCheck, Trash2, Gauge, Target, Wallet,
} from "lucide-react";
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

interface SourcingLink { label: string; url: string }

interface TrendingProduct {
  name: string;
  brand?: string;
  url?: string;
  price: number;
  mrp?: number;
  off?: number;
  rating?: number;
  reviews?: number;
  demand?: number;
  competition?: number;
  profit?: number;
  verdict?: string;
  trend?: string;
  reason?: string;
  sourcing?: SourcingLink[];
}

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

const WATCHLIST_KEY = "nayra-trending-watchlist";

/** Build real, working sourcing search URLs from a product name. */
function buildSourcing(productName: string): SourcingLink[] {
  const q = encodeURIComponent(productName.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").trim().replace(/\s+/g, " "));
  return [
    { label: "IndiaMART Buy", url: `https://dir.indiamart.com/search.mp?ss=${q}` },
    { label: "Alibaba Bulk", url: `https://www.alibaba.com/trade/search?SearchText=${q}` },
    { label: "Meesho Supplier", url: `https://supplier.meesho.com/?q=${q}` },
  ];
}

/** Parse the streamed text. Returns summary markdown, product list, and footer markdown. */
function parseTrendResult(raw: string) {
  const token = "❯❯PRODUCT❮❮";
  const firstIdx = raw.indexOf(token);
  const summary = firstIdx === -1 ? raw.trim() : raw.slice(0, firstIdx).trim();

  // Action plan + insights footer from the explicit section header.
  const footer = (() => {
    const start = raw.indexOf("## 💡 Seller Action Plan");
    return start === -1 ? "" : raw.slice(start).trim();
  })();

  // Parse each product block.
  const products: TrendingProduct[] = [];
  const sep = raw.split(token);
  for (let i = 1; i < sep.length; i++) {
    const prod = tryParseLeadingJson(sep[i]);
    if (prod && typeof prod.name === "string" && typeof prod.price === "number") {
      prod.sourcing = buildSourcing(prod.name);
      products.push(prod);
    }
  }

  return { summary, products, footer };
}

/** Try to parse the leading JSON object in a chunk (handles line wrapping). */
function tryParseLeadingJson(chunk: string): any | null {
  const cleaned = chunk.trim().replace(/^```\w*\s*/, "").replace(/```$/, "").trim();
  if (!cleaned) return null;
  const lines = cleaned.split("\n");
  let tryStr = "";
  for (let i = 0; i < lines.length; i++) {
    tryStr = tryStr ? tryStr + "\n" + lines[i] : lines[i];
    if (!tryStr.includes("{")) continue;
    try {
      const obj = JSON.parse(tryStr.trim());
      if (obj && typeof obj === "object") return obj;
    } catch {
      // keep accumulating until JSON parses
    }
  }
  return null;
}

function formatPrice(n: number | undefined) {
  if (typeof n !== "number" || isNaN(n)) return "₹--";
  return "₹" + n.toLocaleString("en-IN");
}

function verdictStyle(v: string | undefined) {
  const verdict = (v || "").toUpperCase();
  if (verdict === "SELL") return { chip: "bg-emerald-500/15 text-emerald-600 border-emerald-500/40", label: "SELL ⚡" };
  if (verdict === "MAYBE") return { chip: "bg-amber-500/15 text-amber-600 border-amber-500/40", label: "MAYBE ⚖️" };
  if (verdict === "SKIP") return { chip: "bg-rose-500/15 text-rose-600 border-rose-500/40", label: "SKIP 🚫" };
  return { chip: "bg-muted text-muted-foreground border-border", label: verdict || "N/A" };
}

function ProductCard({
  product,
  index,
  saved,
  onToggleSave,
}: {
  product: TrendingProduct;
  index: number;
  saved: boolean;
  onToggleSave: (p: TrendingProduct) => void;
}) {
  const verdict = verdictStyle(product.verdict);
  const name = product.name || "Product";
  const mrpPct = product.mrp && product.mrp > product.price ? Math.round((receivedDiscount(product)) * 100) : (typeof product.off === "number" ? product.off : null);

  return (
    <Card className="overflow-hidden flex flex-col relative border-border/60 shadow-sm hover:shadow-md transition-shadow">
      <div className="h-1.5 w-full" style={{ background: product.verdict?.toUpperCase() === "SELL" ? "linear-gradient(90deg,#10b981,#059669)" : product.verdict?.toUpperCase() === "MAYBE" ? "linear-gradient(90deg,#f59e0b,#d97706)" : "linear-gradient(90deg,#f43f5e,#e11d48)" }} />
      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0 h-6 w-6 rounded-md bg-primary/10 text-primary text-xs font-bold inline-flex items-center justify-center">{index + 1}</span>
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground line-clamp-1">{product.brand || "Top pick"}</span>
          </div>
          <button
            onClick={() => onToggleSave(product)}
            className={`shrink-0 rounded-full p-1.5 transition-colors ${saved ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-muted"}`}
            title={saved ? "Remove from watchlist" : "Save to watchlist"}
          >
            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>

        <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2">{name}</h3>

        <div className="flex items-end gap-2 flex-wrap">
          <span className="text-xl font-extrabold text-foreground">{formatPrice(product.price)}</span>
          {product.mrp && product.mrp > (product.price || 0) && (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.mrp)}</span>
          )}
          {mrpPct != null && mrpPct > 0 && (
            <Badge className="border-transparent bg-rose-500/15 text-rose-600">{mrpPct}% OFF</Badge>
          )}
        </div>

        {(typeof product.rating === "number" || typeof product.reviews === "number") && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {typeof product.rating === "number" && (
              <span className="inline-flex items-center gap-1 text-foreground font-medium">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {product.rating.toFixed(1)}
              </span>
            )}
            {typeof product.reviews === "number" && (
              <span>· {product.reviews >= 1000 ? `${(product.reviews / 1000).toFixed(1)}k` : product.reviews} reviews</span>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <ScoreMeter label="Demand" icon={<Flame className="h-3 w-3" />} value={product.demand} color="bg-sky-500" />
          <ScoreMeter label="Competition" icon={<Target className="h-3 w-3" />} value={product.competition} color="bg-fuchsia-500" lowIsGood />
          <ScoreMeter label="Profit" icon={<Wallet className="h-3 w-3" />} value={product.profit} color="bg-emerald-500" />
        </div>

        <div className="flex items-center justify-between mt-auto pt-1">
          <Badge className={`border ${verdict.chip}`}>{verdict.label}</Badge>
          {product.off && typeof product.off === "number" && product.off > 0 && (
            <span className="text-[11px] text-muted-foreground">{product.off}% deal</span>
          )}
        </div>

        {product.reason && (
          <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-lg p-2 border border-border/40">💡 {product.reason}</p>
        )}
        {product.trend && (
          <p className="text-[11px] text-sky-600 bg-sky-500/5 rounded-lg p-2 border border-sky-500/20">🔥 {product.trend}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mt-1">
          {product.url && (
            <a href={product.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-medium bg-primary text-primary-foreground rounded-md px-2.5 py-1.5 hover:opacity-90">
              <ExternalLink className="h-3 w-3" /> Flipkart
            </a>
          )}
          {(product.sourcing || []).slice(0, 2).map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-medium bg-secondary text-secondary-foreground rounded-md px-2.5 py-1.5 hover:bg-secondary/80">
              <ShoppingCart className="h-3 w-3" /> {s.label}
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function receivedDiscount(p: TrendingProduct) {
  if (!p.mrp || !p.price || p.mrp <= p.price) return 0;
  return (p.mrp - p.price) / p.mrp;
}

function ScoreMeter({ label, value, color, lowIsGood, icon }: { label: string; value?: number; color: string; lowIsGood?: boolean; icon?: React.ReactNode }) {
  const v = typeof value === "number" ? Math.max(0, Math.min(100, value)) : 0;
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-2 border border-border/40">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1">{icon}{label}</span>
      <div className="flex items-center gap-1.5">
        <Progress value={v} className={`h-1.5 ${color}`} />
        <span className="text-xs font-bold text-foreground">{v}</span>
      </div>
    </div>
  );
}

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
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [watchlist, setWatchlist] = useState<TrendingProduct[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const { summary, products, footer } = useMemo(() => parseTrendResult(result), [result]);

  const isSaved = useCallback((name: string) => watchlist.some((w) => w.name === name), [watchlist]);

  const toggleSave = useCallback((p: TrendingProduct) => {
    setWatchlist((prev) => {
      const exists = prev.some((w) => w.name === p.name);
      if (exists) {
        return prev.filter((w) => w.name !== p.name);
      }
      return [...prev, p];
    });
  }, []);

  const removeFromWatchlist = useCallback((name: string) => {
    setWatchlist((prev) => prev.filter((w) => w.name !== name));
  }, []);

  const currentSubs = subCategories[category] || [];

  const analyze = useCallback(async () => {
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
  }, [category, platform, subCategory, currentSubs, priceMin, priceMax, sortBy, minDiscount, minRating, latchOnly, toast]);

  return (
    <main className="space-y-6 max-w-6xl mx-auto p-4">
      <SEO title="Trending Products" description="Discover profitable trending products with viability scores, demand and competition intel, and real sourcing links" path="/trending-products" />
      <BreadcrumbSchema items={[{ name: "Home", path: "/" }, { name: "Trending Products", path: "/trending-products" }]} />
      <AnimatePresence>
        {loading && !result && <ToolLoadingOverlay message="Finding profitable products…" />}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Trending Products Finder
          </h1>
          <p className="text-muted-foreground mt-1">Profitable trending products with viability scores, demand & competition intel, and real sourcing links</p>
        </div>
        {watchlist.length > 0 && (
          <Button variant={showWatchlist ? "secondary" : "outline"} onClick={() => setShowWatchlist((v) => !v)} className="gap-2">
            <BookmarkCheck className="h-4 w-4" />
            My Watchlist ({watchlist.length})
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-lg">Search Filters</CardTitle></CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => { setCategory(v); setSubCategory("all"); }}>
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
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <Checkbox checked={latchOnly} onCheckedChange={(v) => setLatchOnly(!!v)} />
            <span className="text-sm text-muted-foreground">Only products with Latch / Limited-Time Deals (⚡)</span>
          </label>
          <Button onClick={analyze} disabled={loading} className="w-full" size="lg">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TrendingUp className="h-4 w-4 mr-2" />}
            {loading ? "Analyzing…" : "Find Profitable Trending Products"}
          </Button>
        </CardContent>
      </Card>

      {/* Saved Watchlist */}
      {showWatchlist && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-lg flex items-center gap-2"><BookmarkCheck className="h-5 w-5 text-primary" /> My Watchlist</CardTitle>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { setWatchlist([]); toast({ title: "Watchlist cleared" }); }}>
              <Trash2 className="h-4 w-4 mr-1" /> Clear all
            </Button>
          </CardHeader>
          <CardContent>
            {watchlist.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved products yet. Tap the bookmark on any product to save it here.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {watchlist.map((p, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-4 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-foreground line-clamp-2">{p.name}</h4>
                        <button onClick={() => removeFromWatchlist(p.name)} className="text-muted-foreground hover:text-destructive" title="Remove">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-extrabold text-foreground">{formatPrice(p.price)}</span>
                        {typeof p.profit === "number" && (
                          <Badge className={`border ${verdictStyle(p.verdict).chip}`}>{verdictStyle(p.verdict).label} · {p.profit} profit</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{p.reason}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {p.url && (
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-medium bg-primary text-primary-foreground rounded-md px-2.5 py-1.5">
                            <ExternalLink className="h-3 w-3" /> Flipkart
                          </a>
                        )}
                        {(p.sourcing || []).slice(0, 3).map((s) => (
                          <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-medium bg-secondary text-secondary-foreground rounded-md px-2.5 py-1.5">
                            <ShoppingCart className="h-3 w-3" /> {s.label}
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {summary && (
            <Card>
              <CardContent className="p-5 prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </CardContent>
            </Card>
          )}

          {products.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Gauge className="h-5 w-5 text-primary" /> Top {products.length} Money-Making Picks
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p, i) => (
                  <ProductCard key={i} product={p} index={i} saved={isSaved(p.name)} onToggleSave={toggleSave} />
                ))}
              </div>
            </div>
          )}

          {footer && (
            <Card>
              <CardContent className="p-5 prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown components={markdownComponents}>{footer}</ReactMarkdown>
              </CardContent>
            </Card>
          )}

          {products.length === 0 && !footer && summary && (
            <Card>
              <CardContent className="p-5 prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown components={markdownComponents}>{result}</ReactMarkdown>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </main>
  );
}