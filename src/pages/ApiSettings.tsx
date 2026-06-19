import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Key, Eye, EyeOff, Check, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getGeminiApiKey, setGeminiApiKey, removeGeminiApiKey } from "@/lib/api-key-store";

export default function ApiSettings() {
  const { toast } = useToast();
  const [key, setKey] = useState(getGeminiApiKey() || "");
  const [showKey, setShowKey] = useState(false);
  const saved = !!getGeminiApiKey();

  const handleSave = () => {
    if (!key.trim()) {
      toast({ title: "API key daalo!", variant: "destructive" });
      return;
    }
    setGeminiApiKey(key.trim());
    toast({ title: "✅ Gemini API Key saved!", description: "Ab saare tools aapki apni key se chalenge" });
  };

  const handleRemove = () => {
    removeGeminiApiKey();
    setKey("");
    toast({ title: "API Key remove ho gayi", description: "Ab default system use hoga" });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Key className="h-6 w-6 text-primary" />
          API Settings
        </h1>
        <p className="text-muted-foreground mt-1">Apni Gemini API key lagao — FREE mein unlimited AI tools use karo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Google Gemini API Key
            {saved && <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full">Active ✓</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
            <p className="font-semibold">🆓 Free Gemini API Key kaise paayein:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                  Google AI Studio <ExternalLink className="h-3 w-3" />
                </a> pe jaao
              </li>
              <li>Google account se sign in karo</li>
              <li>"Create API Key" pe click karo</li>
              <li>Key copy karo aur yahan paste karo</li>
            </ol>
            <p className="text-xs text-muted-foreground mt-2">💡 Google free mein 15 RPM (requests per minute) deta hai — personal use ke liye kaafi hai!</p>
          </div>

          <div>
            <Label>Gemini API Key</Label>
            <div className="flex gap-2 mt-1">
              <div className="relative flex-1">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder="AIzaSy..."
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button onClick={handleSave}>
                <Check className="h-4 w-4 mr-1" /> Save
              </Button>
            </div>
          </div>

          {saved && (
            <Button variant="outline" size="sm" onClick={handleRemove} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-1" /> Remove Key
            </Button>
          )}

          <div className="bg-muted/20 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
            <p>🔒 <strong>Safe hai</strong> — Key sirf aapke browser mein save hoti hai, server pe nahi jaati</p>
            <p>⚡ <strong>Unlimited use</strong> — Google ke free tier mein 1500 requests/day milte hain</p>
            <p>🔄 <strong>Auto-switch</strong> — Agar key set hai to Gemini direct use hoga, nahi to default system chalega</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
