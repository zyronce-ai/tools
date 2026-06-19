import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Play, Pause, Download, Loader2, Mic, Sparkles, User, AudioLines } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";

const voices = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", gender: "Female", accent: "American", style: "Soft & Warm", emoji: "👩" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", gender: "Male", accent: "American", style: "Deep & Confident", emoji: "👨" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", gender: "Female", accent: "American", style: "Upbeat & Friendly", emoji: "👩‍🦰" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", gender: "Male", accent: "Australian", style: "Casual & Natural", emoji: "🧑" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", gender: "Male", accent: "British", style: "Warm & Narrative", emoji: "🧔" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum", gender: "Male", accent: "Transatlantic", style: "Intense & Hoarse", emoji: "👨‍🦱" },
  { id: "SAz9YHcvj6GT2YYXdXww", name: "River", gender: "Non-binary", accent: "American", style: "Confident", emoji: "🧑‍🎤" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", gender: "Male", accent: "American", style: "Articulate & Confident", emoji: "👱‍♂️" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", gender: "Female", accent: "British", style: "Confident & Posh", emoji: "👸" },
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda", gender: "Female", accent: "American", style: "Warm & Friendly", emoji: "👩‍🦳" },
  { id: "bIHbv24MWmeRgasZH58o", name: "Will", gender: "Male", accent: "American", style: "Friendly & Warm", emoji: "🧑‍💼" },
  { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica", gender: "Female", accent: "American", style: "Expressive & Cheerful", emoji: "💃" },
  { id: "cjVigY5qzO86Huf0OWal", name: "Eric", gender: "Male", accent: "American", style: "Friendly & Calm", emoji: "🕺" },
  { id: "iP95p4xoKVk53GoZ742B", name: "Chris", gender: "Male", accent: "American", style: "Casual & Conversational", emoji: "🧑‍🔧" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", gender: "Male", accent: "American", style: "Deep & Smooth", emoji: "🎙️" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", gender: "Male", accent: "British", style: "Deep & Authoritative", emoji: "🎩" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", gender: "Female", accent: "British", style: "Warm & Soothing", emoji: "🌸" },
  { id: "pqHfZKP75CvOlQylNhV4", name: "Bill", gender: "Male", accent: "American", style: "Trustworthy & Grounded", emoji: "👔" },
];

const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { t } = useLang();
  const { toast } = useToast();

  const generateSpeech = async () => {
    if (!text.trim()) {
      toast({ title: t("tts.text_required"), variant: "destructive" });
      return;
    }
    setLoading(true);
    setAudioUrl(null);
    setIsPlaying(false);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: text.trim(), voiceId: selectedVoice }),
        }
      );

      if (!response.ok) {
        throw new Error("TTS request failed");
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      toast({ title: t("tts.success") });
    } catch (err) {
      console.error(err);
      toast({ title: t("tts.failed"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "speech.mp3";
    a.click();
  };

  const selectedVoiceData = voices.find((v) => v.id === selectedVoice);
  const charPercent = Math.min((text.length / 5000) * 100, 100);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-accent/10 to-primary/5 border border-primary/20 p-8"
      >
        <div className="absolute top-4 right-4 opacity-10">
          <AudioLines className="h-32 w-32 text-primary" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Mic className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("tts.title")}</h1>
            <p className="text-muted-foreground mt-1">{t("tts.subtitle")}</p>
          </div>
        </div>
        <div className="relative z-10 flex gap-3 mt-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Sparkles className="h-3 w-3" /> AI Powered
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
            <User className="h-3 w-3" /> 18 Voices
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Text Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardContent className="p-6 space-y-4 h-full flex flex-col">
              <label className="text-sm font-semibold flex items-center gap-2">
                ✍️ {t("tts.text_label")}
              </label>
              <Textarea
                placeholder={t("tts.text_placeholder")}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                maxLength={5000}
                className="resize-none flex-1 text-base"
              />
              {/* Character count bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{text.length} characters</span>
                  <span>5000 max</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    animate={{ width: `${charPercent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <Button onClick={generateSpeech} disabled={loading || !text.trim()} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    {t("tts.generating")}
                  </>
                ) : (
                  <>
                    <Volume2 className="h-5 w-5 mr-2" />
                    {t("tts.generate_btn")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: Voice Picker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardContent className="p-5 space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2">
                🎙️ {t("tts.voice_label")}
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                {voices.map((voice) => (
                  <motion.button
                    key={voice.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      selectedVoice === voice.id
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-sm"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-xl">{voice.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm truncate">{voice.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{voice.accent} • {voice.style}</div>
                    </div>
                    {selectedVoice === voice.id && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Audio Player */}
      <AnimatePresence>
        {audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
          >
            <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  🎧 {t("tts.result")}
                </h2>

                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />

                <div className="flex items-center gap-4 bg-background/80 backdrop-blur rounded-2xl p-5 border border-border/50">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button onClick={togglePlay} size="icon" className="h-14 w-14 rounded-full shadow-lg">
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                    </Button>
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base">{selectedVoiceData?.emoji} {selectedVoiceData?.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{text.slice(0, 100)}{text.length > 100 ? "..." : ""}</p>
                  </div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button onClick={downloadAudio} variant="outline" size="icon" className="h-11 w-11 rounded-full">
                      <Download className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>

                <p className="text-xs text-muted-foreground text-center">{t("tts.tip")}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TextToSpeech;
