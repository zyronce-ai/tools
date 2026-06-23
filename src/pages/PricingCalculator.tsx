import { useState } from "react";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, IndianRupee, TrendingUp, Package } from "lucide-react";
import { SEO } from "@/components/SEO";
import { FAQ } from "@/components/FAQ";

type Platform = "flipkart" | "meesho" | "amazon" | "website";

const platformCommissions: Record<Platform, { commission: number; shipping: number; gst: number; label: string }> = {
  flipkart: { commission: 14, shipping: 50, gst: 18, label: "Flipkart" },
  meesho: { commission: 0, shipping: 30, gst: 18, label: "Meesho" },
  amazon: { commission: 15, shipping: 60, gst: 18, label: "Amazon" },
  website: { commission: 0, shipping: 0, gst: 18, label: "Own Website" },
};

export default function PricingCalculator() {
  const [platform, setPlatform] = useState<Platform>("flipkart");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [packagingCost, setPackagingCost] = useState("15");
  const [shippingCost, setShippingCost] = useState("");
  const [results, setResults] = useState<any>(null);

  const calculate = () => {
    const cp = parseFloat(costPrice) || 0;
    const sp = parseFloat(sellingPrice) || 0;
    const pkg = parseFloat(packagingCost) || 0;
    const config = platformCommissions[platform];
    const shipping = parseFloat(shippingCost) || config.shipping;
    const commissionAmt = (sp * config.commission) / 100;
    const gstOnCommission = (commissionAmt * config.gst) / 100;
    const totalDeductions = commissionAmt + gstOnCommission + shipping + pkg;
    const netRevenue = sp - totalDeductions;
    const profit = netRevenue - cp;
    const profitMargin = sp > 0 ? (profit / sp) * 100 : 0;
    setResults({ sellingPrice: sp, costPrice: cp, commission: commissionAmt, gstOnCommission, shipping, packaging: pkg, totalDeductions, netRevenue, profit, profitMargin });
  };

  const suggestPrice = () => {
    const cp = parseFloat(costPrice) || 0;
    const pkg = parseFloat(packagingCost) || 0;
    const config = platformCommissions[platform];
    const shipping = parseFloat(shippingCost) || config.shipping;
    const margins = [20, 25, 30, 40, 50];
    return margins.map((targetMargin) => {
      const factor = 1 - config.commission / 100 - (config.commission * config.gst) / 10000 - targetMargin / 100;
      const suggestedSP = factor > 0 ? (cp + shipping + pkg) / factor : 0;
      return { margin: targetMargin, price: Math.ceil(suggestedSP) };
    });
  };

  const suggestions = costPrice ? suggestPrice() : [];

  return (
    <main>
      <SEO title="Pricing Calculator" description="Calculate optimal pricing for your ecommerce products" path="/pricing-calculator" />
      <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Calculator className="h-6 w-6 text-primary" />{"Ecommerce Pricing Calculator with GST, Commission & Profit Margin"}</h1>
        <p className="text-muted-foreground mt-1">{"Calculate platform commission, shipping & profit margin"}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">{"Product Details"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{"Platform"}</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(platformCommissions).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label} (Commission: {val.commission}%)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>{"Cost Price (₹) - Product cost"}</Label><Input type="number" placeholder="e.g. 200" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} /></div>
            <div><Label>{"Selling Price (₹) - Price to sell at"}</Label><Input type="number" placeholder="e.g. 499" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} /></div>
            <div><Label>{"Packaging Cost (₹)"}</Label><Input type="number" placeholder="e.g. 15" value={packagingCost} onChange={(e) => setPackagingCost(e.target.value)} /></div>
            <div><Label>{"Shipping Cost (₹) - Leave empty for default"}</Label><Input type="number" placeholder={`Default: ₹${platformCommissions[platform].shipping}`} value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} /></div>
            <Button onClick={calculate} className="w-full" size="lg"><IndianRupee className="h-4 w-4 mr-2" /> {"Calculate Profit"}</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {results && (
            <Card className={results.profit >= 0 ? "border-green-500/50" : "border-destructive/50"}>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5" />{"Profit Breakdown"} - {platformCommissions[platform].label}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <Row label="Selling Price" value={results.sellingPrice} />
                  <div className="border-t border-dashed pt-2 space-y-2">
                    <Row label={`Commission (${platformCommissions[platform].commission}%)`} value={-results.commission} negative />
                    <Row label="GST on Commission (18%)" value={-results.gstOnCommission} negative />
                    <Row label="Shipping" value={-results.shipping} negative />
                    <Row label="Packaging" value={-results.packaging} negative />
                  </div>
                  <div className="border-t pt-2"><Row label="Total Deductions" value={-results.totalDeductions} negative bold /></div>
                  <div className="border-t pt-2"><Row label="Net Revenue" value={results.netRevenue} bold /><Row label="Cost Price" value={-results.costPrice} negative /></div>
                  <div className="border-t border-double pt-3">
                    <Row label="Net Profit" value={results.profit} bold highlight={results.profit >= 0 ? "green" : "red"} />
                    <Row label="Profit Margin" value={`${results.profitMargin.toFixed(1)}%`} bold highlight={results.profitMargin >= 20 ? "green" : "red"} isText />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {suggestions.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Package className="h-5 w-5" />{"Suggested Selling Prices"}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {suggestions.map((s) => (
                    <button key={s.margin} onClick={() => setSellingPrice(String(s.price))} className="p-3 rounded-lg border hover:border-primary transition-colors text-left">
                      <div className="text-xs text-muted-foreground">{s.margin}% Profit</div>
                      <div className="text-lg font-bold">₹{s.price}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">{"👆 Click to set selling price, then Calculate"}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
      <FAQ title="Frequently Asked Questions" id="pricing-calculator" items={[
        { question: "What profit margin should I keep for my ecommerce products?", answer: "We recommend a minimum net profit margin of 20-30% after accounting for platform commissions, GST, shipping, and packaging costs. Our calculator suggests selling prices for 20%, 25%, 30%, 40%, and 50% target margins so you can choose your strategy." },
        { question: "How is GST calculated on platform commissions?", answer: "GST is charged on the platform commission amount, not on the total selling price. For example, if your commission is ₹70, the GST at 18% is ₹12.60. Our calculator automatically computes this based on your platform's commission rate." },
        { question: "Does this calculator include Amazon and Flipkart fees?", answer: "Yes, it includes platform commission (14-15% for Amazon and Flipkart), shipping costs, and packaging costs. The calculator deducts all these charges from your selling price to show your true net profit." },
        { question: "How do I set the right selling price for my product?", answer: "Start with your cost price, add packaging and shipping costs, then factor in the platform commission and GST. Use our suggested price feature to see prices required for different profit margins, then click one to auto-fill the selling price." },
        { question: "What is the difference between net revenue and net profit?", answer: "Net revenue is your selling price minus platform deductions (commission, GST, shipping, packaging). Net profit is net revenue minus your product cost price. Our calculator shows both clearly in the breakdown." },
      ]} />
    </main>
  );
}

function Row({ label, value, negative, bold, highlight, isText }: { label: string; value: number | string; negative?: boolean; bold?: boolean; highlight?: "green" | "red"; isText?: boolean; }) {
  const colorClass = highlight === "green" ? "text-green-600 dark:text-green-400" : highlight === "red" ? "text-red-500" : negative ? "text-muted-foreground" : "";
  return (
    <div className={`flex justify-between ${bold ? "font-semibold" : ""} ${colorClass}`}>
      <span>{label}</span>
      <span>{isText ? value : `₹${typeof value === "number" ? Math.abs(value).toFixed(2) : value}`}</span>
    </div>
  );
}
