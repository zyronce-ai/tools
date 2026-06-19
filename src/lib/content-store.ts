export type Platform = "youtube" | "instagram" | "blog" | "twitter";
export type Tone = "funny" | "professional" | "casual" | "motivational" | "educational";

export interface ContentItem {
  id: string;
  topic: string;
  platform: Platform;
  tone: Tone;
  content: string;
  createdAt: Date;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string | { type: "text" | "image_url"; text?: string; image_url?: { url: string } }[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

const CHAT_STORAGE_KEY = "ai-chat-conversations";

export function getConversations(): Conversation[] {
  try {
    const data = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveConversation(conv: Conversation) {
  const all = getConversations().filter((c) => c.id !== conv.id);
  all.unshift(conv);
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(all.slice(0, 50)));
}

export function deleteConversation(id: string) {
  const all = getConversations().filter((c) => c.id !== id);
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(all));
}

const STORAGE_KEY = "ai-content-history";

export function getContentHistory(): ContentItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data).map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
    }));
  } catch {
    return [];
  }
}

export function saveContent(item: ContentItem) {
  const history = getContentHistory();
  history.unshift(item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 100)));
}

export function deleteContent(id: string) {
  const history = getContentHistory().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export const platformLabels: Record<Platform, string> = {
  youtube: "YouTube Script",
  instagram: "Instagram Caption",
  blog: "Blog Post",
  twitter: "Twitter/X Post",
};

export const toneLabels: Record<Tone, string> = {
  funny: "😄 Funny",
  professional: "💼 Professional",
  casual: "😎 Casual",
  motivational: "🔥 Motivational",
  educational: "📚 Educational",
};

export const platformIcons: Record<Platform, string> = {
  youtube: "🎬",
  instagram: "📸",
  blog: "✍️",
  twitter: "🐦",
};
