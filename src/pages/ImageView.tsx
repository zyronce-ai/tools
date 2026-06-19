import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Download, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const ImageView = () => {
  const { "*": filePath } = useParams();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!filePath) {
      setError(true);
      setLoading(false);
      return;
    }
    const { data } = supabase.storage.from("ai-temp").getPublicUrl(filePath);
    if (data?.publicUrl) {
      setImageUrl(data.publicUrl);
    } else {
      setError(true);
    }
    setLoading(false);
  }, [filePath]);

  const handleDownload = async () => {
    if (!imageUrl) return;
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filePath?.split("/").pop() || "image";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-lg">Image not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button variant="secondary" size="sm" onClick={handleCopy} className="gap-1">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy URL"}
        </Button>
        <Button variant="secondary" size="sm" onClick={handleDownload} className="gap-1">
          <Download className="h-4 w-4" /> Download
        </Button>
      </div>
      <img
        src={imageUrl}
        alt="Shared image"
        className="max-w-full max-h-[90vh] object-contain rounded-lg"
        onError={() => setError(true)}
      />
      <p className="text-white/40 text-xs mt-4">nayratrendz.in</p>
    </div>
  );
};

export default ImageView;
