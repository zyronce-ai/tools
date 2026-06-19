import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Bot, User, MessageCircle, Plus, Trash2, PanelLeftClose, PanelLeft, ImagePlus, X } from "lucide-react";
import { ChatMessage, Conversation, getConversations, saveConversation, deleteConversation } from "@/lib/content-store";
import { streamFromEdge } from "@/lib/ai-stream";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/language-context";

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function extractText(content: string | any[]): string {
  if (typeof content === "string") return content;
  const text = content.find(p => p.type === "text")?.text || "";
  return text;
}
function generateTitle(msg: string) { return msg.length > 30 ? msg.slice(0, 30) + "…" : msg; }

const ChatBot = () => {
  const [conversations, setConversations] = useState<Conversation[]>(() => getConversations());
  const [activeId, setActiveId] = useState<string | null>(conversations[0]?.id ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>(conversations[0]?.messages ?? []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLang();

  useEffect(() => {
    const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (viewport) {
      setTimeout(() => { viewport.scrollTop = viewport.scrollHeight; }, 50);
    }
  }, [messages]);

  useEffect(() => {
    if (!activeId || messages.length === 0) return;
    const conv: Conversation = {
      id: activeId,
      title: generateTitle(extractText(messages.find((m) => m.role === "user")?.content ?? "New Chat")),
      messages,
      createdAt: conversations.find((c) => c.id === activeId)?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveConversation(conv);
    setConversations(getConversations());
  }, [messages, activeId]);

  const startNewChat = () => { const id = generateId(); setActiveId(id); setMessages([]); setInput(""); };
  const switchTo = (conv: Conversation) => { setActiveId(conv.id); setMessages(conv.messages); setInput(""); };
  const handleDelete = (id: string) => {
    deleteConversation(id);
    const updated = getConversations();
    setConversations(updated);
    if (activeId === id) { updated.length > 0 ? switchTo(updated[0]) : startNewChat(); }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = () => setAttachedImage(reader.result as string);
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setAttachedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const send = async () => {
    if ((!input.trim() && !attachedImage) || loading) return;
    let currentId = activeId;
    if (!currentId) { currentId = generateId(); setActiveId(currentId); }
    let content: ChatMessage["content"];
    if (attachedImage) {
      const parts: { type: "text" | "image_url"; text?: string; image_url?: { url: string } }[] = [];
      if (input.trim()) parts.push({ type: "text", text: input });
      parts.push({ type: "image_url", image_url: { url: attachedImage } });
      content = parts;
    } else {
      content = input;
    }
    const userMsg: ChatMessage = { role: "user", content };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages); setInput(""); setAttachedImage(null); setLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      const text = assistantSoFar;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: text } : m));
        return [...prev, { role: "assistant", content: text }];
      });
    };

    await streamFromEdge({
      functionName: "chat",
      body: { messages: allMessages },
      onDelta: upsertAssistant,
      onDone: () => setLoading(false),
      onError: (err) => { toast({ title: "Error", description: err, variant: "destructive" }); setLoading(false); },
    });
  };

  const renderMessageContent = (content: string | any[]) => {
    if (typeof content === "string") return content;
    return content.map((part, i) => {
      if (part.type === "image_url") {
        return <img key={i} src={part.image_url?.url} alt="Attached image" className="max-w-[300px] rounded-lg my-1" />;
      }
      if (part.type === "text") {
        return <span key={i}>{part.text}</span>;
      }
      return null;
    });
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-0 overflow-hidden -mx-4 -mt-2 md:-mx-6">
      <AnimatePresence>
        {historyOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background z-20 md:hidden" onClick={() => setHistoryOpen(false)} />
            <motion.div initial={{ x: -280, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -280, opacity: 0 }} transition={{ duration: 0.2 }} className="fixed md:relative z-30 w-[280px] border-r border-border bg-sidebar flex flex-col overflow-hidden flex-shrink-0 h-full">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-sidebar-foreground truncate">{t("chat.history")}</h2>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={startNewChat}><Plus className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setHistoryOpen(false)}><PanelLeftClose className="h-4 w-4" /></Button>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {conversations.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">{t("chat.no_history")}</p>}
                  {conversations.map((conv) => (
                    <div key={conv.id} className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-colors text-sm ${conv.id === activeId ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50 text-sidebar-foreground"}`} onClick={() => { switchTo(conv); setHistoryOpen(false); }}>
                      <MessageCircle className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
                      <span className="truncate flex-1">{conv.title}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={(e) => { e.stopPropagation(); handleDelete(conv.id); }}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
          {!historyOpen && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setHistoryOpen(true)}><PanelLeft className="h-4 w-4" /></Button>}
          <h1 className="text-lg font-bold flex items-center gap-2"><Bot className="h-5 w-5 text-accent" />{t("chat.title")}</h1>
          {!historyOpen && <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto" onClick={startNewChat}><Plus className="h-4 w-4" /></Button>}
        </div>

        <ScrollArea className="flex-1 px-4 py-2" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <Bot className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-lg">{t("chat.greeting")}</p>
              <p className="text-muted-foreground/70 text-sm mt-1">{t("chat.greeting_sub")}</p>
            </div>
          )}
          <div className="max-w-3xl mx-auto">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1"><Bot className="h-4 w-4 text-accent" /></div>}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"}`}>
                    {msg.role === "assistant" ? <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{msg.content as string}</ReactMarkdown></div> : renderMessageContent(msg.content)}
                  </div>
                  {msg.role === "user" && <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1"><User className="h-4 w-4 text-primary" /></div>}
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0"><Bot className="h-4 w-4 text-accent" /></div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="max-w-3xl mx-auto">
            {attachedImage && (
              <div className="relative inline-block mb-2">
                <img src={attachedImage} alt="Attached" className="h-20 rounded-lg border" />
                <button type="button" className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center" onClick={() => setAttachedImage(null)}><X className="h-3 w-3" /></button>
              </div>
            )}
            <div className="flex gap-2">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
              <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={loading}><ImagePlus className="h-4 w-4" /></Button>
              <Input placeholder={t("chat.placeholder")} value={input} onChange={(e) => setInput(e.target.value)} onPaste={handlePaste} disabled={loading} className="flex-1" />
              <Button type="submit" disabled={loading || (!input.trim() && !attachedImage)} size="icon"><Send className="h-4 w-4" /></Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
