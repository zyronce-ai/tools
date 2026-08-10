import { useState, useRef } from "react";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, FileText, Scissors, Trash2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default function LabelCropper() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  // Settings
  const [sortPlasticNpp, setSortPlasticNpp] = useState(false);
  const [sortSoldBy, setSortSoldBy] = useState(false);
  const [largeParcelBottom, setLargeParcelBottom] = useState(false);
  const [sortCourier, setSortCourier] = useState(false);
  const [keepInvoice, setKeepInvoice] = useState(true);
  const [mergeFiles, setMergeFiles] = useState(false);
  const [multiOrderBottom, setMultiOrderBottom] = useState(false);
  const [picklistInterval, setPicklistInterval] = useState(10);
  const [reviewOrders, setReviewOrders] = useState("");

  const validateFile = (f: File) => {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      toast({ title: "Only PDF files allowed", variant: "destructive" });
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    validateFile(e.dataTransfer.files?.[0]);
  };

  const handleProceed = async () => {
    if (!file) {
      toast({ title: "Upload a PDF file first", variant: "destructive" });
      return;
    }
    if (!SUPABASE_URL) {
      toast({ title: "Supabase not configured", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("sort_plastic_npp", String(sortPlasticNpp));
      form.append("sort_sold_by", String(sortSoldBy));
      form.append("large_parcel_bottom", String(largeParcelBottom));
      form.append("sort_courier", String(sortCourier));
      form.append("keep_invoice", String(keepInvoice));
      form.append("merge_files", String(mergeFiles));
      form.append("multi_order_bottom", String(multiOrderBottom));
      form.append("picklist_interval", String(picklistInterval));
      form.append("review_orders", reviewOrders);

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/label-cropper`, {
        method: "POST",
        headers: { Authorization: `Bearer ${SUPABASE_KEY}` },
        body: form,
      });

      if (!resp.ok) {
        let errMsg = `Request failed (${resp.status})`;
        try {
          const err = await resp.json();
          errMsg = err.error || errMsg;
        } catch { /* ignore */ }
        throw new Error(errMsg);
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = mergeFiles ? "merged-labels.pdf" : "cropped-labels.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "PDF downloaded successfully! ✅" });
    } catch (err: any) {
      toast({ title: err?.message || "Processing failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6 max-w-4xl mx-auto p-4 md:p-6">
      <SEO title="Flipkart Label Cropper & Sorter" description="Upload Flipkart shipping label PDFs, crop them to 4x6 thermal sticker size, and sort pages by courier, NPP, sold by, or parcel size. Free tool for Flipkart sellers." path="/label-cropper" />

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Scissors className="h-6 w-6 text-primary" />
          Flipkart Label Cropper & Sorter
        </h1>
        <p className="text-muted-foreground mt-1">
          Crop labels to 4x6 thermal sticker size, sort by courier / NPP / sold by, and download a print-ready PDF
        </p>
      </div>

      {/* Upload */}
      <Card>
        <CardContent className="p-5">
          <div
            className={`relative rounded-xl border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
              dragOver
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-border bg-muted/20 hover:border-primary/50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => validateFile(e.target.files?.[0])}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-10 w-10 text-primary" />
                <div className="text-left">
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · Click or drop to replace</p>
                </div>
                <button
                  type="button"
                  className="ml-2 h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <UploadCloud className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-foreground font-medium">Drag & drop your Flipkart label PDF here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse · .pdf only</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sorting Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:border-primary/40 transition-colors">
              <input type="checkbox" checked={sortPlasticNpp} onChange={(e) => setSortPlasticNpp(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
              <span>
                <span className="block text-sm font-medium text-foreground">Sort Plastic and NPP</span>
                <span className="block text-xs text-muted-foreground">Group NPP & plastic-packaged orders together</span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:border-primary/40 transition-colors">
              <input type="checkbox" checked={sortSoldBy} onChange={(e) => setSortSoldBy(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
              <span>
                <span className="block text-sm font-medium text-foreground">Sort Sold By</span>
                <span className="block text-xs text-muted-foreground">Group orders by the seller name on the label</span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:border-primary/40 transition-colors">
              <input type="checkbox" checked={largeParcelBottom} onChange={(e) => setLargeParcelBottom(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
              <span>
                <span className="block text-sm font-medium text-foreground">Large parcel at bottom</span>
                <span className="block text-xs text-muted-foreground">Move big/oversized shipments to the end</span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:border-primary/40 transition-colors">
              <input type="checkbox" checked={sortCourier} onChange={(e) => setSortCourier(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
              <span>
                <span className="block text-sm font-medium text-foreground">Sort Courier wise</span>
                <span className="block text-xs text-muted-foreground">Group by courier — Ekart, Delhivery, BlueDart, etc.</span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:border-primary/40 transition-colors">
              <input type="checkbox" checked={keepInvoice} onChange={(e) => setKeepInvoice(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
              <span>
                <span className="block text-sm font-medium text-foreground">Keep Invoice</span>
                <span className="block text-xs text-muted-foreground">Remove invoice pages from the final PDF if unchecked</span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:border-primary/40 transition-colors">
              <input type="checkbox" checked={mergeFiles} onChange={(e) => setMergeFiles(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
              <span>
                <span className="block text-sm font-medium text-foreground">Merge Files</span>
                <span className="block text-xs text-muted-foreground">Name the output "merged-labels.pdf"</span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:border-primary/40 transition-colors">
              <input type="checkbox" checked={multiOrderBottom} onChange={(e) => setMultiOrderBottom(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
              <span>
                <span className="block text-sm font-medium text-foreground">Multi order at bottom</span>
                <span className="block text-xs text-muted-foreground">Move combo / clubbed orders to the end</span>
              </span>
            </label>

            <div className="rounded-lg border border-border p-3">
              <Label htmlFor="picklist_interval">Add picklist page after [X] orders</Label>
              <Input
                id="picklist_interval"
                type="number"
                min={0}
                defaultValue={10}
                onChange={(e) => setPicklistInterval(parseInt(e.target.value, 10) || 0)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">0 disables picklist pages</p>
            </div>

            <div className="rounded-lg border border-border p-3 md:col-span-2">
              <Label htmlFor="review_orders">Separate Review Orders using list</Label>
              <Input
                id="review_orders"
                placeholder="Order IDs separated by comma, space or new line"
                value={reviewOrders}
                onChange={(e) => setReviewOrders(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">These orders are moved to the end of the PDF</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleProceed}
        disabled={loading || !file}
        className="w-full h-12 text-base font-semibold bg-[#FF6B35] hover:brightness-110 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Processing PDF...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Proceed Files
          </>
        )}
      </Button>

      <div className="bg-muted/30 rounded-lg p-4 text-xs text-muted-foreground space-y-1">
        <p>💡 <strong>How it works:</strong></p>
        <p>• Each A4 page is cropped to a 4x6 inch thermal sticker area (top-left region)</p>
        <p>• Sorting happens on the page sequence before the PDF is recompiled</p>
        <p>• The output PDF is downloaded directly to your device — print-ready</p>
      </div>
    </main>
  );
}