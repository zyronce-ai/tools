import { useState } from "react";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ImageDown, Loader2, Globe, Download, AlertTriangle, ExternalLink, Video, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

interface ExtractResult { images: string[]; videos?: string[]; pageTitle: string; totalFound: number; totalVideos?: number; }

const ImageExtractor = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const { toast } = useToast();

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;
    setLoading(true); setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("extract-images", { body: { url: url.trim() } });
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      setResult(data);
      toast({ title: `${data.totalFound} images & ${data.totalVideos || 0} videos found! 🎉` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to extract images", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const ext = blob.type.split("/")[1] || "jpg";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `image-${index + 1}.${ext}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch { window.open(imageUrl, "_blank"); }
  };

  const downloadAll = async () => {
    if (!result) return;
    for (let i = 0; i < result.images.length; i++) {
      await downloadImage(result.images[i], i);
      await new Promise((r) => setTimeout(r, 300));
    }
    toast({ title: "All images downloading! 📥" });
  };

  const downloadVideo = async (videoUrl: string, index: number) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const ext = blob.type.split("/")[1] || "mp4";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `video-${index + 1}.${ext}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch { window.open(videoUrl, "_blank"); }
  };

  return (
    <main>
      <SEO title="Image Extractor" description="Extract text and data from images using AI" path="/images" />
      <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-1">
          <ImageDown className="h-7 w-7 text-accent" />
          {"Image Extractor"}
        </h1>
        <p className="text-muted-foreground mb-3">{"Enter any website URL and extract all images"}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            <ImageDown className="h-3.5 w-3.5" /> Images
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
            <Video className="h-3.5 w-3.5" /> Videos <Sparkles className="h-3 w-3" /> New
          </span>
        </div>

        <Card className="p-3 mb-4 border-destructive/30 bg-destructive/5">
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              {"This tool is for educational purposes only. Image copyrights belong to their original owners."}
              <Link to="/privacy-policy" className="text-primary hover:underline ml-1">{"Read Privacy Policy"}</Link>
            </p>
          </div>
        </Card>

        <Card className="p-4 border-border/50 mb-6">
          <form onSubmit={handleExtract} className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} disabled={loading} className="pl-10" />
            </div>
            <Button type="submit" disabled={loading || !url.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImageDown className="h-4 w-4 mr-2" />}
              Extract
            </Button>
          </form>
        </Card>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{result.pageTitle}</h2>
                  <p className="text-sm text-muted-foreground">{result.totalFound} images · {result.totalVideos || 0} videos found</p>
                </div>
                {result.images.length > 0 && (
                  <Button variant="outline" onClick={downloadAll} size="sm">
                    <Download className="h-4 w-4 mr-2" />{"Download All"}
                  </Button>
                )}
              </div>
              {result.images.length === 0 ? (
                <Card className="p-8 text-center"><p className="text-muted-foreground">{"No images found on this page"}</p></Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {result.images.map((img, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                      <Card className="group relative overflow-hidden border-border/50 hover:border-primary/50 transition-colors">
                        <div className="aspect-square bg-muted">
                          <img src={img} alt={`Image ${i + 1}`} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        </div>
                        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="icon" variant="secondary" onClick={() => downloadImage(img, i)} title="Download"><Download className="h-4 w-4" /></Button>
                          <Button size="icon" variant="secondary" onClick={() => window.open(img, "_blank")} title="Open"><ExternalLink className="h-4 w-4" /></Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {result.videos && result.videos.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Video className="h-5 w-5 text-accent" /> Videos ({result.videos.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {result.videos.map((vid, i) => (
                      <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                        <Card className="overflow-hidden border-border/50 hover:border-primary/50 transition-colors">
                          <div className="aspect-video bg-muted">
                            <video src={vid} controls preload="metadata" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex gap-2 p-2">
                            <Button size="sm" variant="secondary" className="flex-1" onClick={() => downloadVideo(vid, i)}>
                              <Download className="h-4 w-4 mr-1" /> Download
                            </Button>
                            <Button size="icon" variant="secondary" onClick={() => window.open(vid, "_blank")} title="Open"><ExternalLink className="h-4 w-4" /></Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
    </main>
  );
};

export default ImageExtractor;
