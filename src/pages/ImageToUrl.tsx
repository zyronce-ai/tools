import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Copy, Check, X, ImagePlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UploadedImage {
  file: File;
  preview: string;
  url?: string;
  uploading: boolean;
  error?: string;
}

const ImageToUrl = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newImages: UploadedImage[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 10)
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        uploading: false,
      }));

    if (newImages.length === 0) {
      toast({ title: "No valid images", description: "Please select image files (JPG, PNG, WebP, etc.)", variant: "destructive" });
      return;
    }
    setImages((prev) => [...prev, ...newImages].slice(0, 10));
  }, [toast]);

  const removeImage = (index: number) => {
    setImages((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const uploadAll = async () => {
    const toUpload = images.filter((img) => !img.url);
    if (toUpload.length === 0) {
      toast({ title: "All images already uploaded!" });
      return;
    }

    setUploading(true);
    const updated = [...images];

    await Promise.all(
      updated.map(async (img, i) => {
        if (img.url) return;
        updated[i] = { ...img, uploading: true };
        setImages([...updated]);

        try {
          const ext = img.file.name.split(".").pop() || "jpg";
          const fileName = `img2url/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error } = await supabase.storage.from("ai-temp").upload(fileName, img.file, {
            contentType: img.file.type,
            upsert: false,
          });

          if (error) throw error;

          // Generate custom domain URL
          const customUrl = `https://nayratrendz.in/i/${fileName}`;
          updated[i] = { ...img, uploading: false, url: customUrl };
        } catch (err: any) {
          updated[i] = { ...img, uploading: false, error: err.message || "Upload failed" };
        }
        setImages([...updated]);
      })
    );

    setUploading(false);
    toast({ title: "Upload complete!", description: `${updated.filter((i) => i.url).length} images uploaded successfully.` });
  };

  const copyUrl = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({ title: "URL copied!" });
  };

  const copyAllUrls = () => {
    const urls = images.filter((i) => i.url).map((i) => i.url).join("\n");
    if (!urls) return;
    navigator.clipboard.writeText(urls);
    toast({ title: "All URLs copied!" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Image to URL</h1>
        <p className="text-muted-foreground mt-1">Upload multiple images and get their public URLs instantly</p>
      </div>

      <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
        <CardContent className="p-8">
          <label className="flex flex-col items-center justify-center cursor-pointer gap-3">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ImagePlus className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Click to select images</p>
              <p className="text-sm text-muted-foreground">or drag & drop • JPG, PNG, WebP • Max 10 images</p>
            </div>
            <Input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">{images.length} image(s) selected</p>
            <div className="flex gap-2">
              {images.some((i) => i.url) && (
                <Button variant="outline" size="sm" onClick={copyAllUrls}>
                  <Copy className="h-4 w-4 mr-1" /> Copy All URLs
                </Button>
              )}
              <Button size="sm" onClick={uploadAll} disabled={uploading || images.every((i) => i.url)}>
                {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
                {uploading ? "Uploading..." : "Upload All"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {images.map((img, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="relative">
                  <img src={img.preview} alt="" className="w-full h-40 object-cover" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full"
                    onClick={() => removeImage(i)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {img.uploading && (
                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3 space-y-2">
                  <p className="text-xs text-muted-foreground truncate">{img.file.name}</p>
                  {img.url ? (
                    <div className="flex items-center gap-2">
                      <Input value={img.url} readOnly className="text-xs h-8 bg-muted" />
                      <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => copyUrl(img.url!, i)}>
                        {copiedIndex === i ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  ) : img.error ? (
                    <p className="text-xs text-destructive">{img.error}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Ready to upload</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageToUrl;
