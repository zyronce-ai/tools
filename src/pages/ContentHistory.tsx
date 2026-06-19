import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getContentHistory, deleteContent, Platform, platformLabels, platformIcons, toneLabels } from "@/lib/content-store";
import { Copy, Trash2, History, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/language-context";

const allPlatforms: (Platform | "all")[] = ["all", "youtube", "instagram", "blog", "twitter"];

const ContentHistory = () => {
  const [filter, setFilter] = useState<Platform | "all">("all");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState(getContentHistory());
  const { toast } = useToast();
  const { t } = useLang();

  const filtered = items.filter((item) => {
    if (filter !== "all" && item.platform !== filter) return false;
    if (search && !item.topic.toLowerCase().includes(search.toLowerCase()) && !item.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCopy = (content: string) => { navigator.clipboard.writeText(content); toast({ title: "Copied! 📋" }); };
  const handleDelete = (id: string) => { deleteContent(id); setItems(getContentHistory()); toast({ title: "Deleted!" }); };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-2"><History className="h-7 w-7 text-chart-3" />{t("history.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("history.subtitle")}</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search content..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {allPlatforms.map((p) => (
            <Button key={p} variant={filter === p ? "default" : "outline"} size="sm" onClick={() => setFilter(p)}>
              {p === "all" ? "All" : platformLabels[p]}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <History className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">{t("history.no_content")}</p>
          <p className="text-muted-foreground/70 text-sm">{t("history.no_content_sub")}</p>
        </div>
      )}

      <AnimatePresence>
        {filtered.map((item) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="border-border/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{platformIcons[item.platform]}</span>
                    <div>
                      <h3 className="font-semibold">{item.topic}</h3>
                      <p className="text-xs text-muted-foreground">{platformLabels[item.platform]} · {toneLabels[item.tone]} · {item.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(item.content)}><Copy className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{item.content}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ContentHistory;
