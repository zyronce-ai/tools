import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import ToolLoadingOverlay from "@/components/ToolLoadingOverlay";
import { streamFromEdge } from "@/lib/ai-stream";
import ReactMarkdown from "react-markdown";

export default function FakeReviewDetector() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const analyze = async () => {
    if (!reviews.trim()) {
      toast({ title: "Reviews paste karo!", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult("");
    await streamFromEdge({
      functionName: "fake-review-detector",
      body: { reviews },
      onDelta: (text) => setResult((prev) => prev + text),
      onDone: () => {
        setLoading(false);
        toast({ title: "Review analysis ready! 🔍" });
      },
      onError: (err) => {
        setLoading(false);
        toast({ title: "Error", description: err, variant: "destructive" });
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <AnimatePresence>
        {loading && !result && <ToolLoadingOverlay message="Reviews analyze ho rahe hain…" />}
      </AnimatePresence>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" />
          Fake Review Detector
        </h1>
        <p className="text-muted-foreground mt-1">Competitors ke fake reviews detect karo — AI powered analysis</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Paste Reviews</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Reviews (ek line mein ek review ya copy-paste karein)</Label>
            <Textarea
              placeholder={"Review 1: This product is amazing, best purchase ever!\nReview 2: Very good quality, I love it so much...\nReview 3: Okay product, packaging was damaged but item is fine."}
              value={reviews}
              onChange={(e) => setReviews(e.target.value)}
              rows={8}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              💡 Amazon/Flipkart se reviews copy karke paste karo — AI detect karega kaunse fake hain
            </p>
          </div>
          <Button onClick={analyze} disabled={loading} className="w-full" size="lg">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldAlert className="h-4 w-4 mr-2" />}
            {loading ? "Detecting..." : "Detect Fake Reviews"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{result}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
