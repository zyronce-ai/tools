import { useState, useRef, useCallback } from "react";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, Trash2, FileImage } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CompressedImage {
  original: File;
  originalSize: number;
  compressedBlob: Blob;
  compressedSize: number;
  preview: string;
  compressedPreview: string;
  reduction: number;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function compressImage(file: File, targetReduction: number): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const originalUrl = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }

      ctx.drawImage(img, 0, 0);

      const targetSize = file.size * (1 - targetReduction);
      let quality = 0.5;
      let low = 0.01;
      let high = 1.0;

      const tryCompress = (attempts: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Compression failed"));
              return;
            }

            if (attempts <= 0 || Math.abs(blob.size - targetSize) / file.size < 0.02) {
              const compressedUrl = URL.createObjectURL(blob);
              resolve({
                original: file,
                originalSize: file.size,
                compressedBlob: blob,
                compressedSize: blob.size,
                preview: originalUrl,
                compressedPreview: compressedUrl,
                reduction: ((file.size - blob.size) / file.size) * 100,
              });
              return;
            }

            if (blob.size > targetSize) {
              high = quality;
              quality = (low + quality) / 2;
            } else {
              low = quality;
              quality = (quality + high) / 2;
            }

            tryCompress(attempts - 1);
          },
          "image/jpeg",
          quality,
        );
      };

      tryCompress(12);
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = originalUrl;
  });
}

const ImageCompressor = () => {
  const [result, setResult] = useState<CompressedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [reductionPercent, setReductionPercent] = useState(90);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const runCompression = useCallback(
    async (file: File, percent: number) => {
      setLoading(true);
      setResult((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev.preview);
          URL.revokeObjectURL(prev.compressedPreview);
        }
        return null;
      });

      try {
        const compressed = await compressImage(file, percent / 100);
        setResult(compressed);
      } catch {
        toast({ title: "Compression failed", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large (max 20MB)", variant: "destructive" });
      return;
    }

    setSelectedFile(file);
    await runCompression(file, reductionPercent);
  };

  const handleSliderLiveChange = (value: number[]) => {
    setReductionPercent(value[0]);
  };

  const handleSliderCommit = async (value: number[]) => {
    const committedPercent = value[0];
    if (selectedFile) {
      await runCompression(selectedFile, committedPercent);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      void handleFile(file);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const a = document.createElement("a");
    a.href = result.compressedPreview;
    const name = result.original.name.replace(/\.[^.]+$/, "");
    a.download = `${name}_compressed.jpg`;
    a.click();

    toast({ title: `Compressed ${result.reduction.toFixed(0)}% and downloaded` });
  };

  const handleClear = () => {
    setResult((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev.preview);
        URL.revokeObjectURL(prev.compressedPreview);
      }
      return null;
    });

    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <SEO title="Image Compressor" description="Compress images without losing quality" path="/image-compressor" />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <FileImage className="h-6 w-6 text-primary" />
          Image Compressor
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload image, drag slider for desired compression %, then download.
        </p>
      </motion.div>

      <Card className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Compression Level</span>
          <span className="text-2xl font-bold text-primary">{reductionPercent}%</span>
        </div>
        <Slider
          value={[reductionPercent]}
          onValueChange={handleSliderLiveChange}
          onValueCommit={handleSliderCommit}
          min={10}
          max={95}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>10% (Light)</span>
          <span>50% (Medium)</span>
          <span>95% (Max)</span>
        </div>
      </Card>

      <Card
        className="cursor-pointer border-2 border-dashed border-border/60 p-10 text-center transition-colors hover:border-primary/50"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              void handleFile(file);
            }
          }}
        />
        <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="font-medium text-muted-foreground">Click or drag & drop your image here</p>
        <p className="mt-1 text-xs text-muted-foreground/70">JPG, PNG, WebP — Max 20MB</p>
      </Card>

      {loading && (
        <Card className="space-y-3 p-6 text-center">
          <p className="animate-pulse text-sm text-muted-foreground">Compressing image...</p>
          <Progress value={60} className="w-full" />
        </Card>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Card className="p-5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Original Size</p>
                  <p className="text-lg font-bold text-destructive">{formatSize(result.originalSize)}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Compressed Size</p>
                  <p className="text-lg font-bold text-primary">{formatSize(result.compressedSize)}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Reduction</p>
                  <p className="text-lg font-bold text-primary">{result.reduction.toFixed(0)}% ↓</p>
                </div>
              </div>
              <Progress value={result.reduction} className="mt-4" />
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card className="space-y-2 p-3">
                <p className="text-center text-xs font-medium text-muted-foreground">Original</p>
                <img src={result.preview} alt="Original" className="max-h-60 w-full rounded-lg object-contain" />
              </Card>
              <Card className="space-y-2 p-3">
                <p className="text-center text-xs font-medium text-muted-foreground">Compressed</p>
                <img src={result.compressedPreview} alt="Compressed" className="max-h-60 w-full rounded-lg object-contain" />
              </Card>
            </div>

            <div className="flex justify-center gap-3">
              <Button onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" /> Download Compressed
              </Button>
              <Button variant="outline" onClick={handleClear} className="gap-2">
                <Trash2 className="h-4 w-4" /> Clear
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default ImageCompressor;
