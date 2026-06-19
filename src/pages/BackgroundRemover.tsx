import { useState, useRef } from "react";
import { getGeminiApiKey } from "@/lib/api-key-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eraser, Upload, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/language-context";
import { AnimatePresence } from "framer-motion";
import ToolLoadingOverlay from "@/components/ToolLoadingOverlay";

const bgOptions = [
  { value: "white", label: "⬜ Pure White - E-commerce Ready" },
  { value: "gradient", label: "🌫️ Soft Gradient - Professional" },
  { value: "lifestyle", label: "🏡 Lifestyle Setting - Marketing" },
  { value: "transparent", label: "🔲 Clean Cutout - Transparent" },
];

export default function BackgroundRemover() {
  const { toast } = useToast();
  const { t } = useLang();
  const fileRef = useRef<HTMLInputElement>(null);
  const [originalImage, setOriginalImage] = useState("");
  const [resultImage, setResultImage] = useState("");
  const [backgroundType, setBackgroundType] = useState("white");
  const [loading, setLoading] = useState(false);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 1400; const scale = Math.min(1, maxWidth / img.width);
          const canvas = document.createElement("canvas"); canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext("2d"); if (!ctx) return reject(new Error("Image processing failed"));
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = () => reject(new Error("Image load failed"));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error("Image read failed"));
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast({ title: t("bgremover.too_large"), variant: "destructive" }); return; }
    try {
      const compressed = await compressImage(file);
      if (compressed.length > 3_500_000) { toast({ title: t("bgremover.too_heavy"), variant: "destructive" }); return; }
      setOriginalImage(compressed); setResultImage("");
    } catch { toast({ title: t("bgremover.process_failed"), variant: "destructive" }); }
  };

  const removeBackground = async () => {
    if (!originalImage) { toast({ title: t("bgremover.upload_first"), variant: "destructive" }); return; }
    setLoading(true); setResultImage("");
    try {
      const { data, error } = await supabase.functions.invoke("bg-remover", { body: { imageBase64: originalImage, backgroundType, userGeminiKey: getGeminiApiKey() || undefined } });
      if (error) throw new Error(error.message || "Background remove failed");
      const imageUrl = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (imageUrl) { setResultImage(imageUrl); toast({ title: "Background removed! ✨" }); }
      else { throw new Error(t("bgremover.remove_failed")); }
    } catch (err: any) {
      const msg = String(err?.message || "Unknown error");
      const networkHint = msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("network");
      toast({ title: "Error", description: networkHint ? t("bgremover.network_hint") : msg, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const downloadResult = () => { if (!resultImage) return; const link = document.createElement("a"); link.href = resultImage; link.download = "product-bg-removed.png"; link.click(); };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <AnimatePresence>
        {loading && <ToolLoadingOverlay message="Removing background from your image…" />}
      </AnimatePresence>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Eraser className="h-6 w-6 text-primary" />{t("bgremover.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("bgremover.subtitle")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">{t("bgremover.product_image")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            {originalImage ? (
              <div className="relative">
                <img src={originalImage} alt="Original" className="w-full rounded-lg border max-h-64 object-contain bg-muted" />
                <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={() => { setOriginalImage(""); setResultImage(""); }}>{t("change")}</Button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors text-muted-foreground">
                <Upload className="h-10 w-10" /><span>{t("bgremover.upload_text")}</span><span className="text-xs">{t("bgremover.upload_info")}</span>
              </button>
            )}
            <div><Label>{t("bgremover.bg_type")}</Label>
              <Select value={backgroundType} onValueChange={setBackgroundType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{bgOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent></Select>
            </div>
            <Button onClick={removeBackground} disabled={loading || !originalImage} className="w-full" size="lg">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eraser className="h-4 w-4 mr-2" />}
              {loading ? t("bgremover.processing") : t("bgremover.remove")}
            </Button>
          </CardContent>
        </Card>

        <div>
          {loading && (<Card className="flex items-center justify-center h-64"><div className="text-center space-y-3"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /><p className="text-muted-foreground">{t("bgremover.ai_processing")}</p></div></Card>)}
          {resultImage && !loading && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-lg">{t("bgremover.result")}</CardTitle><Button variant="outline" size="sm" onClick={downloadResult}><Download className="h-4 w-4 mr-1" /> {t("download")}</Button></CardHeader>
              <CardContent>
                <img src={resultImage} alt="Result" className="w-full rounded-lg border bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjBmMGYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=')]" />
                <p className="text-xs text-muted-foreground mt-3">{t("bgremover.tip")}</p>
              </CardContent>
            </Card>
          )}
          {!resultImage && !loading && (<Card className="flex items-center justify-center h-64"><div className="text-center text-muted-foreground space-y-2"><Eraser className="h-12 w-12 mx-auto opacity-30" /><p>{t("bgremover.preview_area")}</p></div></Card>)}
        </div>
      </div>
    </div>
  );
}
