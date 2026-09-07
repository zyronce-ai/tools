import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ImageView = () => {
  const { "*": filePath } = useParams();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!filePath) return;
    const { data } = supabase.storage.from("ai-temp").getPublicUrl(filePath);
    if (data?.publicUrl) {
      setImageUrl(data.publicUrl);
    }
  }, [filePath]);

  if (!imageUrl) return null;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <img
        src={imageUrl}
        alt="Shared image"
        className="max-w-full max-h-[90vh] object-contain rounded-lg"
      />
    </div>
  );
};

export default ImageView;