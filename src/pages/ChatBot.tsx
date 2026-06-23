import { useState, useRef, useEffect } from "react";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Bot, User, Plus, Trash2, MessageCircle, ImagePlus, X, Sparkles, Copy, Check, Settings } from "lucide-react";
import { ChatMessage, Conversation, getConversations, saveConversation, deleteConversation } from "@/lib/content-store";
import { streamFromEdge } from "@/lib/ai-stream";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/SEO";
import { FAQ } from "@/components/FAQ";

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function extractText(content: string | any[]): string {
  if (typeof content === "string") return content;
  const text = content.find(p => p.type === "text")?.text || "";
  return text;
}
function generateTitle(msg: string) { return msg.length > 30 ? msg.slice(0, 30) + "…" : msg; }

const quickActions = [
  { icon: "📦", label: "Write listing" },
  { icon: "💰", label: "GST help" },
  { icon: "🏆", label: "Beat competitor" },
  { icon: "🖼️", label: "Banner copy" },
];

export default function ChatBot() {
  const [conversations, setConversations] = useState<Conversation[]>(() => getConversations());
  const [activeId, setActiveId] = useState<string | null>(conversations[0]?.id ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>(conversations[0]?.messages ?? []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const el = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (el) setTimeout(() => el.scrollTop = el.scrollHeight, 50);
  }, [messages]);

  useEffect(() => {
    if (!activeId || messages.length === 0) return;
    const conv: Conversation = {
      id: activeId,
      title: generateTitle(extractText(messages.find(m => m.role === "user")?.content ?? "New Chat")),
      messages,
      createdAt: conversations.find(c => c.id === activeId)?.createdAt ?? new Date().toISOString(),
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
    if (activeId === id) updated.length > 0 ? switchTo(updated[0]) : startNewChat();
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

  const send = async (quickText?: string) => {
    const text = quickText || input;
    if ((!text.trim() && !attachedImage) || loading) return;
    let currentId = activeId;
    if (!currentId) { currentId = generateId(); setActiveId(currentId); }
    let content: ChatMessage["content"];
    if (attachedImage) {
      const parts: { type: "text" | "image_url"; text?: string; image_url?: { url: string } }[] = [];
      if (text.trim()) parts.push({ type: "text", text });
      parts.push({ type: "image_url", image_url: { url: attachedImage } });
      content = parts;
    } else {
      content = text;
    }
    const userMsg: ChatMessage = { role: "user", content };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages); setInput(""); setAttachedImage(null); setLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      const current = assistantSoFar;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: current } : m);
        return [...prev, { role: "assistant", content: current }];
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

  const copyText = (text: string, index: number) => {
    navigator.clipboard.writeText(typeof text === "string" ? text : "");
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderMessageContent = (content: string | any[]) => {
    if (typeof content === "string") return content;
    return content.map((part, i) => {
      if (part.type === "image_url") return <img key={i} src={part.image_url?.url} alt="User uploaded image for AI analysis" className="max-w-[300px] rounded-lg my-1 border border-[#2A2A38]" />;
      if (part.type === "text") return <span key={i}>{part.text}</span>;
      return null;
    });
  };

  const hasMessages = messages.length > 0;

  return (
    <main>
      <SEO title="AI Chat Assistant for Ecommerce" description="Chat with AI for ecommerce product research, listing advice, and content ideas. Free AI chatbot for Amazon & Flipkart sellers." path="/chat" />
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <AnimatePresence>
        {historyOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-20 md:hidden" onClick={() => setHistoryOpen(false)} />
            <motion.div initial={{ x: -280, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -280, opacity: 0 }} transition={{ duration: 0.2 }} className="fixed md:relative z-30 w-[260px] border-r border-[#2A2A38] bg-[#16161D] flex flex-col overflow-hidden flex-shrink-0 h-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A38]">
                <h2 className="text-sm font-semibold text-[#F1F1F5]">Chat History</h2>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-[#8888A0] hover:text-[#F1F1F5]" onClick={startNewChat}><Plus className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-0.5">
                  {conversations.length === 0 && <p className="text-xs text-[#8888A0]/60 text-center py-8">No history yet</p>}
                  {conversations.map((conv) => (
                    <div key={conv.id} className={cn(
                      "group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-all text-sm",
                      conv.id === activeId ? "bg-[#FF6B35]/10 text-[#F1F1F5]" : "text-[#8888A0] hover:text-[#F1F1F5] hover:bg-white/[0.04]"
                    )} onClick={() => { switchTo(conv); setHistoryOpen(false); }}>
                      <MessageCircle className="h-3.5 w-3.5 flex-shrink-0 opacity-50" />
                      <span className="truncate flex-1 text-xs">{conv.title}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-[#8888A0] hover:text-red-400 flex-shrink-0" onClick={(e) => { e.stopPropagation(); handleDelete(conv.id); }}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 bg-[#0F0F13]">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-[#2A2A38] flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-white/[0.06] text-[#8888A0]" onClick={() => setHistoryOpen(true)}>
              <MessageCircle className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-[#7C3AED] flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-[#F1F1F5]">AI Chatbot for Ecommerce Sellers</h1>
                <p className="text-[11px] text-[#8888A0]">Apka AI Business Partner</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#8888A0] bg-[#1E1E28] border border-[#2A2A38] px-2.5 py-1 rounded-full">
              <Sparkles className="h-3 w-3 text-[#7C3AED]" />
              Powered by Claude
            </span>
            <button className="h-8 w-8 rounded-lg bg-[#1E1E28] border border-[#2A2A38] flex items-center justify-center text-[#8888A0] hover:text-[#F1F1F5] transition-all">
              <Settings className="h-3.5 w-3.5" />
            </button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#8888A0] hover:text-[#F1F1F5] hidden md:flex" onClick={startNewChat}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 px-4 md:px-6 py-4" ref={scrollRef}>
          {!hasMessages && !loading ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="h-20 w-20 rounded-2xl bg-[#FF6B35] flex items-center justify-center mb-6 shadow-2xl shadow-[#FF6B35]/20 animate-pulse-glow"
              >
                <Bot className="h-10 w-10 text-white" />
              </motion.div>
              <h2 className="text-xl font-heading font-bold text-[#F1F1F5] mb-2">Apka AI Business Partner</h2>
              <p className="text-sm text-[#8888A0] mb-8 max-w-sm">
                Product listings, GST queries, competitor analysis — sab kuch ek jagah
              </p>
              <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm">
                {quickActions.map((action, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => send(action.label)}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#1E1E28] border border-[#2A2A38] text-sm text-[#F1F1F5] hover:border-[#FF6B35]/40 hover:bg-[#FF6B35]/5 transition-all text-left"
                  >
                    <span className="text-lg">{action.icon}</span>
                    <span className="text-xs leading-tight">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4 pb-4">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {msg.role === "assistant" && (
                      <div className="h-8 w-8 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="h-4 w-4 text-[#7C3AED]" />
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed relative group",
                      msg.role === "user"
                        ? "bg-[#FF6B35] text-white rounded-br-md"
                        : "bg-[#1E1E28] border border-[#2A2A38] border-l-[#7C3AED] border-l-2 rounded-bl-md"
                    )}>
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none prose-p:text-[#D1D1E0] prose-p:leading-relaxed prose-headings:text-[#F1F1F5] prose-strong:text-[#F1F1F5] prose-code:text-[#7C3AED] prose-code:bg-[#16161D] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-[#16161D] prose-pre:border prose-pre:border-[#2A2A38] prose-a:text-[#FF6B35]">
                          <ReactMarkdown>{msg.content as string}</ReactMarkdown>
                        </div>
                      ) : (
                        <div>{renderMessageContent(msg.content)}</div>
                      )}
                      <div className={cn(
                        "flex items-center gap-2 mt-1.5",
                        msg.role === "user" ? "justify-end" : "justify-between"
                      )}>
                        <span className="text-[10px] opacity-50">{
                          activeId ? new Date(conversations.find(c => c.id === activeId)?.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
                        }</span>
                        {msg.role === "assistant" && (
                          <button
                            onClick={() => copyText(msg.content as string, i)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8888A0] hover:text-[#F1F1F5]"
                          >
                            {copiedId === i ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                    </div>
                    {msg.role === "user" && (
                      <div className="h-8 w-8 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="h-4 w-4 text-[#FF6B35]" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-[#7C3AED]" />
                  </div>
                  <div className="bg-[#1E1E28] border border-[#2A2A38] border-l-[#7C3AED] border-l-2 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 bg-[#7C3AED] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 bg-[#7C3AED] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 bg-[#7C3AED] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="flex-shrink-0 px-4 md:px-6 py-3 border-t border-[#2A2A38] bg-[#0F0F13]">
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="max-w-3xl mx-auto">
            {attachedImage && (
              <div className="relative inline-block mb-2">
                <img src={attachedImage} alt="Preview of selected product image" className="h-16 rounded-lg border border-[#2A2A38]" />
                <button type="button" className="absolute -top-1.5 -right-1.5 bg-[#FF6B35] text-white rounded-full h-5 w-5 flex items-center justify-center shadow-lg" onClick={() => setAttachedImage(null)}><X className="h-3 w-3" /></button>
              </div>
            )}
            <div className="flex items-center gap-2 bg-[#1E1E28] border border-[#2A2A38] rounded-2xl px-3 py-1.5 focus-within:border-[#FF6B35]/50 focus-within:ring-1 focus-within:ring-[#FF6B35]/20 transition-all">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading} className="h-8 w-8 rounded-lg flex items-center justify-center text-[#8888A0] hover:text-[#F1F1F5] hover:bg-white/[0.06] transition-all flex-shrink-0">
                <ImagePlus className="h-4 w-4" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPaste={handlePaste}
                placeholder="Ask me anything..."
                disabled={loading}
                className="flex-1 bg-transparent border-0 outline-none text-sm text-[#F1F1F5] placeholder-[#8888A0]/60 py-2 focus:ring-0"
              />
              <button
                type="submit"
                disabled={loading || (!input.trim() && !attachedImage)}
                className={cn(
                  "h-8 w-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0",
                  loading || (!input.trim() && !attachedImage)
                    ? "bg-[#2A2A38] text-[#8888A0]"
                    : "bg-[#FF6B35] text-white hover:scale-105 active:scale-95"
                )}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[#8888A0]/40 text-center mt-1.5">Press Ctrl+K for quick tools</p>
          </form>
        </div>
      </div>
    </div>
      <FAQ title="Frequently Asked Questions" id="chatbot" items={[
        { q: "How can AI help my ecommerce business?", a: "Our AI chatbot helps ecommerce sellers with product listing optimization, GST query resolution, competitor analysis, banner copywriting, and product research across Amazon, Flipkart, and Meesho — all in one place." },
        { q: "Can I use this AI chatbot for product research?", a: "Yes! You can paste product details or upload product images and the AI will analyze them to provide listing suggestions, pricing insights, and keyword optimization tips tailored for Indian ecommerce platforms." },
        { q: "Is this AI chatbot better than ChatGPT for ecommerce?", a: "Unlike generic chatbots, our AI is purpose-built for Indian ecommerce sellers with deep knowledge of Amazon India, Flipkart, Meesho, and local market trends. It also supports Hindi-English Hinglish queries naturally." },
        { q: "Can I upload images for AI analysis?", a: "Yes, you can upload product images or paste screenshots directly into the chat. The AI can analyze images to extract text, identify products, and provide listing improvement suggestions." },
        { q: "Is this AI chatbot free to use?", a: "Yes, the AI chatbot is completely free to use. You can create unlimited conversations, save chat history, and get expert ecommerce advice without any subscription fees." },
      ]} />
    </main>
  );
}
