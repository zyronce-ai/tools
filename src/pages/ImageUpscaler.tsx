import { useState, useRef, useCallback } from "react";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { SEO } from "@/components/SEO";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, ZoomIn, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import ToolLoadingOverlay from "@/components/ToolLoadingOverlay";
import Upscaler from "upscaler";
import x4 from "@upscalerjs/esrgan-medium/4x";

// Keep the model's input capped so 4x upscaling lands near 4K instead of
// blowing past it (and past what a browser tab can hold in memory).
const MAX_INPUT_DIMENSION = 1024;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

async function capImageSize(dataUrl: string): Promise<string> {
  const img = await loadImage(dataUrl);
  const longSide = Math.max(img.width, img.height);
  if (longSide <= MAX_INPUT_DIMENSION) return dataUrl;

  const scale = MAX_INPUT_DIMENSION / longSide;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.92);
}

export default function ImageUpscaler() {
  const { toast } = useToast();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const compareRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const upscalerRef = useRef<InstanceType<typeof Upscaler> | null>(null);

  const getUpscaler = () => {
    if (!upscalerRef.current) {
      upscalerRef.current = new Upscaler({ model: x4 });
    }
    return upscalerRef.current;
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image must be under 10MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImage(reader.result as string);
      setUpscaledImage(null);
      setSliderPos(50);
    };
    reader.readAsDataURL(file);
  };

  const handleUpscale = async () => {
    if (!originalImage) {
      toast({ title: "Upload an image first", variant: "destructive" });
      return;
    }
    setLoading(true);
    setProgress(0);
    try {
      const input = await capImageSize(originalImage);
      const result = await getUpscaler().upscale(input, {
        patchSize: 64,
        padding: 4,
        progress: (amount: number) => setProgress(Math.round(amount * 100)),
      });
      setUpscaledImage(result);
      toast({ title: "Image upscaled to 4K!" });
    } catch (err: any) {
      toast({ title: err.message || "Upscale failed, try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging.current || !compareRef.current) return;
    const rect = compareRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  }, []);

  const handleDownload = () => {
    if (!upscaledImage) return;
    const link = document.createElement("a");
    link.href = upscaledImage;
    link.download = "upscaled-4k.png";
    link.click();
  };

  return (
    <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <SEO title="Image Upscaler" description="Upscale and enhance images with AI" path="/image-upscaler" />
      <AnimatePresence>
        {loading && (
          <ToolLoadingOverlay
            message={
              progress > 0
                ? `Upscaling your image to 4K… ${progress}%`
                : "Loading AI model (first run only)…"
            }
          />
        )}
      </AnimatePresence>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{"AI Image Upscaler"}</h1>
        <p className="text-muted-foreground mt-1">{"Upscale your product images to 4K quality with AI — runs entirely in your browser, no limits"}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{"Upload Image"}</CardTitle>
          <CardDescription>{"Max 10MB • JPG, PNG, WebP supported"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">{"Click to upload product image"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>

          {originalImage && (
            <div className="flex items-center gap-3">
              <img src={originalImage} alt="Original" className="h-20 w-20 object-cover rounded-lg border border-border" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{"Image uploaded"}</p>
                <p className="text-xs text-muted-foreground">{"Ready to upscale"}</p>
              </div>
              <Button onClick={handleUpscale} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ZoomIn className="h-4 w-4" />}
                {loading ? `Upscaling... ${progress}%` : "Upscale to 4K"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Before / After Comparison */}
      {originalImage && upscaledImage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              {"Before & After Comparison"}
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" /> {"Download"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={compareRef}
              className="relative w-full aspect-square max-h-[600px] overflow-hidden rounded-xl border border-border cursor-col-resize select-none"
              onMouseDown={() => { dragging.current = true; }}
              onMouseUp={() => { dragging.current = false; }}
              onMouseLeave={() => { dragging.current = false; }}
              onMouseMove={handleMouseMove}
              onTouchStart={() => { dragging.current = true; }}
              onTouchEnd={() => { dragging.current = false; }}
              onTouchMove={handleMouseMove}
            >
              {/* After (upscaled) - full width underneath */}
              <img
                src={upscaledImage}
                alt="Upscaled"
                className="absolute inset-0 w-full h-full object-contain"
              />
              {/* Before (original) - clipped */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={originalImage}
                  alt="Original"
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ width: compareRef.current?.offsetWidth || "100%", maxWidth: "none" }}
                />
              </div>
              {/* Slider line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-lg z-10"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-xl">
                  <span className="text-primary-foreground text-xs font-bold">⇔</span>
                </div>
              </div>
              {/* Labels */}
              <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-foreground text-xs font-semibold px-2 py-1 rounded-md z-20">
                {"BEFORE"}
              </div>
              <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-semibold px-2 py-1 rounded-md z-20">
                {"AFTER (4K)"}
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">{"👆 Drag the slider to compare before & after"}</p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <p className="text-muted-foreground font-medium">{"AI is enhancing your image to 4K quality in your browser..."}</p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
