import React, { createContext, useContext, useState, useEffect } from "react";

type Lang = "en" | "hi";

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<string, { en: string; hi: string }> = {
  // Index / Dashboard
  "welcome.title": { en: "Welcome to Ecommerce Tools", hi: "Ecommerce Tools mein aapka swagat hai" },
  "welcome.subtitle": { en: "Create content with AI — for YouTube, Instagram, Blog, Twitter & more!", hi: "AI se content banao — YouTube, Instagram, Blog, Twitter sab ke liye!" },

  // Dashboard cards
  "card.content_writer.desc": { en: "Content for YouTube, Instagram, Blog & more", hi: "YouTube, Instagram, Blog & more ke liye content" },
  "card.ai_chatbot.desc": { en: "Ask AI anything", hi: "AI se kuch bhi poocho" },
  "card.image_extractor.desc": { en: "Download images from any website", hi: "Website se images download karo" },
  "card.product_keywords.desc": { en: "Generate SEO keywords & descriptions", hi: "SEO keywords & description generate karo" },
  "card.pricing_calculator.desc": { en: "Calculate commission, shipping & profit", hi: "Commission, shipping, profit calculate karo" },
  "card.competitor_analysis.desc": { en: "Analyze market competition", hi: "Market competition analyze karo" },
  "card.banner_maker.desc": { en: "Create promotional banners with AI", hi: "AI se promotional banners banao" },
  "card.gst_invoice.desc": { en: "Create and print GST invoices", hi: "GST bill banao aur print karo" },
  "card.bg_remover.desc": { en: "Remove product background — white/lifestyle", hi: "Product ka background hatao - white/lifestyle" },
  "card.listing_scorer.desc": { en: "Score your product listing quality", hi: "Product listing ki quality score karo" },
  "card.history.desc": { en: "View previous content", hi: "Purana content dekho" },
  "recent_content": { en: "Recent Content", hi: "Recent Content" },
  "view_all": { en: "View All", hi: "Sab Dekho" },

  // Content Writer
  "writer.title": { en: "AI Content Writer", hi: "AI Content Writer" },
  "writer.subtitle": { en: "Enter a topic, choose a platform, get your content!", hi: "Topic daalo, platform chuno, content pao!" },
  "writer.topic_label": { en: "Topic", hi: "Topic / Vishay" },
  "writer.topic_placeholder": { en: "e.g. 5 tips for cooking, How to grow on Instagram...", hi: "e.g. 5 tips for cooking, How to grow on Instagram..." },
  "writer.platform": { en: "Platform", hi: "Platform" },
  "writer.tone": { en: "Tone / Style", hi: "Tone / Style" },
  "writer.generate": { en: "✨ Generate Content", hi: "✨ Content Generate Karo" },
  "writer.generating": { en: "Generating...", hi: "Generate ho raha hai..." },
  "writer.generated_title": { en: "Generated Content", hi: "Generated Content" },
  "writer.copy": { en: "Copy", hi: "Copy" },
  "writer.regenerate": { en: "Regenerate", hi: "Dubara Banao" },
  "writer.topic_required": { en: "Please enter a topic first", hi: "Pehle topic dalo" },

  // ChatBot
  "chat.title": { en: "AI Chatbot", hi: "AI Chatbot" },
  "chat.history": { en: "Chat History", hi: "Chat History" },
  "chat.no_history": { en: "No chat history yet", hi: "Koi chat history nahi hai" },
  "chat.greeting": { en: "Hi! 👋 I'm your AI assistant", hi: "Hi! 👋 Main aapka AI assistant hoon" },
  "chat.greeting_sub": { en: "Ask anything — content ideas, coding help, general knowledge", hi: "Kuch bhi poocho — content ideas, coding help, general knowledge" },
  "chat.placeholder": { en: "Type your message...", hi: "Apna message type karo..." },

  // Image Extractor
  "images.title": { en: "Image Extractor", hi: "Image Extractor" },
  "images.subtitle": { en: "Enter any website URL and extract all images", hi: "Kisi bhi website ka URL daalo aur saari images nikaalo" },
  "images.disclaimer": { en: "This tool is for educational purposes only. Image copyrights belong to their original owners.", hi: "Yeh tool sirf educational purpose ke liye hai. Images ke copyright unke original owners ke paas hain." },
  "images.read_privacy": { en: "Read Privacy Policy", hi: "Privacy Policy padho" },
  "images.no_images": { en: "No images found on this page", hi: "Koi image nahi mili is page par" },
  "images.download_all": { en: "Download All", hi: "Sab Download Karo" },

  // Product Keywords
  "keywords.title": { en: "Product Keyword Generator", hi: "Product Keyword Generator" },
  "keywords.subtitle": { en: "Upload product image, select fabric, get keywords & descriptions!", hi: "Product image upload karo, fabric select karo, keywords aur description pao!" },
  "keywords.image_label": { en: "Product Image", hi: "Product Image / Product Photo" },
  "keywords.name_label": { en: "Product Name", hi: "Product Name / Product Ka Naam" },
  "keywords.fabric_label": { en: "Fabric", hi: "Fabric / Kapda" },
  "keywords.custom_fabric": { en: "Enter custom fabric name...", hi: "Custom fabric name likho..." },
  "keywords.generate": { en: "🏷️ Generate Keywords & Description", hi: "🏷️ Keywords & Description Generate Karo" },
  "keywords.required": { en: "Enter product name or upload an image", hi: "Product name ya image upload karo" },
  "keywords.result_title": { en: "Generated Keywords & Description", hi: "Generated Keywords & Description" },

  // Pricing Calculator
  "pricing.title": { en: "Pricing Calculator", hi: "Pricing Calculator" },
  "pricing.subtitle": { en: "Calculate platform commission, shipping & profit margin", hi: "Platform commission, shipping aur profit margin calculate karo" },
  "pricing.product_details": { en: "Product Details", hi: "Product Details" },
  "pricing.platform": { en: "Platform", hi: "Platform" },
  "pricing.cost_price": { en: "Cost Price (₹) - Product cost", hi: "Cost Price (₹) - Product ki lagat" },
  "pricing.selling_price": { en: "Selling Price (₹) - Price to sell at", hi: "Selling Price (₹) - Jis price pe bechna hai" },
  "pricing.packaging": { en: "Packaging Cost (₹)", hi: "Packaging Cost (₹)" },
  "pricing.shipping": { en: "Shipping Cost (₹) - Leave empty for default", hi: "Shipping Cost (₹) - Khali chhodo toh default lagega" },
  "pricing.calculate": { en: "Calculate Profit", hi: "Profit Calculate Karo" },
  "pricing.breakdown": { en: "Profit Breakdown", hi: "Profit Breakdown" },
  "pricing.suggested": { en: "Suggested Selling Prices", hi: "Suggested Selling Prices" },
  "pricing.click_tip": { en: "👆 Click to set selling price, then Calculate", hi: "👆 Click karke selling price set karo, fir Calculate karo" },

  // Competitor Analysis
  "competitor.title": { en: "Competitor Analysis", hi: "Competitor Analysis" },
  "competitor.subtitle": { en: "Analyze product market — pricing, keywords, competition level", hi: "Product ka market analysis karo - pricing, keywords, competition level" },
  "competitor.product_name": { en: "Product Name *", hi: "Product Name *" },
  "competitor.category_placeholder": { en: "Select category", hi: "Category select karo" },
  "competitor.analyze": { en: "Analyze Competition", hi: "Competition Analyze Karo" },
  "competitor.analyzing": { en: "Analyzing...", hi: "Analyze ho raha hai..." },
  "competitor.result": { en: "Analysis Result", hi: "Analysis Result" },
  "competitor.name_required": { en: "Enter product name", hi: "Product name daalo" },

  // Banner Maker
  "banner.title": { en: "Promotional Banner Maker", hi: "Promotional Banner Maker" },
  "banner.subtitle": { en: "Generate promotional banners for your products with AI", hi: "AI se product ke liye promotional banners generate karo" },
  "banner.details": { en: "Banner Details", hi: "Banner Details" },
  "banner.product_name": { en: "Product Name *", hi: "Product Name *" },
  "banner.offer_text": { en: "Offer / Text *", hi: "Offer / Text *" },
  "banner.platform": { en: "Platform / Size", hi: "Platform / Size" },
  "banner.style": { en: "Banner Style", hi: "Banner Style" },
  "banner.generate": { en: "Generate Banner", hi: "Banner Generate Karo" },
  "banner.generating": { en: "Generating Banner...", hi: "Banner ban raha hai..." },
  "banner.result": { en: "Generated Banner", hi: "Generated Banner" },
  "banner.ai_creating": { en: "AI is creating your banner...", hi: "AI banner bana raha hai..." },
  "banner.tip": { en: "💡 Tip: Don't like it? Generate again for a new design every time!", hi: "💡 Tip: Pasand nahi aaya toh dubara generate karo, har baar naya design milega!" },
  "banner.preview_area": { en: "Banner will appear here", hi: "Banner yahaan dikhega" },
  "banner.required": { en: "Enter both product name and offer text", hi: "Product name aur offer text dono daalo" },
  "banner.failed": { en: "Image not generated, try again", hi: "Image generate nahi hua, dubara try karo" },

  // GST Invoice
  "invoice.title": { en: "GST Invoice Generator", hi: "GST Invoice Generator" },
  "invoice.subtitle": { en: "Enter product details to create and print a GST invoice", hi: "Product details daalke GST invoice banao aur print karo" },
  "invoice.business_details": { en: "Business Details", hi: "Business Details" },
  "invoice.business_name": { en: "Business / Shop Name *", hi: "Business / Shop Name *" },
  "invoice.customer_name": { en: "Customer Name", hi: "Customer Name" },
  "invoice.customer_placeholder": { en: "Customer name", hi: "Customer ka naam" },
  "invoice.products": { en: "Products / Items", hi: "Products / Items" },
  "invoice.add_item": { en: "Add Item", hi: "Item Add Karo" },
  "invoice.generate": { en: "Generate Invoice", hi: "Invoice Generate Karo" },
  "invoice.business_required": { en: "Enter business name", hi: "Business name daalo" },
  "invoice.items_required": { en: "Fill name and rate for all items", hi: "Sab items ka naam aur rate bharo" },

  // BG Remover
  "bgremover.title": { en: "AI Background Remover", hi: "AI Background Remover" },
  "bgremover.subtitle": { en: "Remove product image background — apply white, gradient or lifestyle backgrounds", hi: "Product image ka background hatao - white, gradient ya lifestyle background lagao" },
  "bgremover.product_image": { en: "Product Image", hi: "Product Image" },
  "bgremover.upload_text": { en: "Upload product image", hi: "Product image upload karo" },
  "bgremover.upload_info": { en: "Max 10MB • Auto compressed • JPG, PNG, WebP", hi: "Max 10MB • Auto compressed • JPG, PNG, WebP" },
  "bgremover.bg_type": { en: "Background Type", hi: "Background Type" },
  "bgremover.remove": { en: "Remove Background", hi: "Background Hatao" },
  "bgremover.processing": { en: "Processing...", hi: "Process ho raha hai..." },
  "bgremover.ai_processing": { en: "AI is removing the background...", hi: "AI background hata raha hai..." },
  "bgremover.result": { en: "Result ✨", hi: "Result ✨" },
  "bgremover.tip": { en: "💡 Don't like it? Change background type and try again!", hi: "💡 Pasand nahi aaya? Background type change karke dubara try karo!" },
  "bgremover.preview_area": { en: "Result will appear here", hi: "Result yahaan dikhega" },
  "bgremover.upload_first": { en: "Upload an image first", hi: "Pehle image upload karo" },
  "bgremover.too_large": { en: "Image must be under 10MB", hi: "Image 10MB se chhoti honi chahiye" },
  "bgremover.too_heavy": { en: "Image is too heavy, try a smaller one", hi: "Image bahut heavy hai, thodi chhoti image try karo" },
  "bgremover.process_failed": { en: "Image processing failed", hi: "Image process nahi hui" },
  "bgremover.remove_failed": { en: "Image not processed, try again", hi: "Image process nahi hui, dubara try karo" },
  "bgremover.network_hint": { en: "Network issue or image too large, try a smaller image.", hi: "Network issue ya image size issue hai, chhoti image se try karo." },

  // Listing Scorer
  "scorer.title": { en: "Listing Quality Scorer", hi: "Listing Quality Scorer" },
  "scorer.subtitle": { en: "Paste your product listing link — AI will score it and give improvement tips", hi: "Product listing ka link daalo - AI score dega aur improvement tips batayega" },
  "scorer.url_label": { en: "Product Listing URL *", hi: "Product Listing URL *" },
  "scorer.url_hint": { en: "Paste any Flipkart, Meesho, or Amazon product link", hi: "Flipkart, Meesho, Amazon ka koi bhi product link paste karo" },
  "scorer.analyze": { en: "Analyze Listing", hi: "Listing Analyze Karo" },
  "scorer.analyzing": { en: "Analyzing...", hi: "Analyze ho raha hai..." },
  "scorer.result": { en: "Analysis Report", hi: "Analysis Report" },
  "scorer.url_required": { en: "Enter product listing URL", hi: "Product listing URL daalo" },

  // Content History
  "history.title": { en: "Content History", hi: "Content History" },
  "history.subtitle": { en: "View your previously generated content here", hi: "Pehle banaya hua content yahaan dekho" },
  "history.no_content": { en: "No content yet", hi: "Koi content nahi hai" },
  "history.no_content_sub": { en: "Generate content using Content Writer, it will appear here", hi: "Content Writer se content banao, vo yahaan dikhega" },

  // Image Upscaler
  "upscaler.title": { en: "AI Image Upscaler", hi: "AI Image Upscaler" },
  "upscaler.subtitle": { en: "Upscale your product images to 4K quality with AI", hi: "AI se product images ko 4K quality mein upscale karo" },
  "upscaler.upload_label": { en: "Upload Image", hi: "Image Upload Karo" },
  "upscaler.upload_info": { en: "Max 10MB • JPG, PNG, WebP supported", hi: "Max 10MB • JPG, PNG, WebP supported" },
  "upscaler.upload_text": { en: "Click to upload product image", hi: "Product image upload karne ke liye click karo" },
  "upscaler.original": { en: "Image uploaded", hi: "Image upload ho gayi" },
  "upscaler.ready": { en: "Ready to upscale", hi: "Upscale ke liye ready" },
  "upscaler.upscale_btn": { en: "Upscale to 4K", hi: "4K mein Upscale Karo" },
  "upscaler.processing": { en: "Upscaling...", hi: "Upscale ho raha hai..." },
  "upscaler.ai_processing": { en: "AI is enhancing your image to 4K quality...", hi: "AI image ko 4K quality mein enhance kar raha hai..." },
  "upscaler.comparison": { en: "Before & After Comparison", hi: "Before & After Comparison" },
  "upscaler.before": { en: "BEFORE", hi: "BEFORE" },
  "upscaler.after": { en: "AFTER (4K)", hi: "AFTER (4K)" },
  "upscaler.drag_tip": { en: "👆 Drag the slider to compare before & after", hi: "👆 Slider drag karke before & after compare karo" },
  "upscaler.success": { en: "Image upscaled to 4K!", hi: "Image 4K mein upscale ho gayi!" },
  "upscaler.failed": { en: "Upscale failed, try again", hi: "Upscale nahi hua, dubara try karo" },
  "upscaler.upload_first": { en: "Upload an image first", hi: "Pehle image upload karo" },
  "upscaler.too_large": { en: "Image must be under 10MB", hi: "Image 10MB se chhoti honi chahiye" },
  "card.image_upscaler.desc": { en: "Upscale product images to 4K quality", hi: "Product images ko 4K quality mein upscale karo" },
  "card.tts.desc": { en: "Convert text to realistic AI voices", hi: "Text ko realistic AI voice mein convert karo" },

  // Text to Speech
  "tts.title": { en: "AI Text to Speech", hi: "AI Text to Speech" },
  "tts.subtitle": { en: "Convert your text to realistic speech with 18+ AI voices", hi: "18+ AI voices ke saath text ko realistic speech mein convert karo" },
  "tts.text_label": { en: "Enter Text", hi: "Text Likho" },
  "tts.text_placeholder": { en: "Type or paste your text here... product description, ad copy, anything!", hi: "Yahaan text likho ya paste karo... product description, ad copy, kuch bhi!" },
  "tts.voice_label": { en: "Choose Voice", hi: "Voice Chuno" },
  "tts.generate_btn": { en: "Generate Speech", hi: "Speech Generate Karo" },
  "tts.generating": { en: "Generating...", hi: "Generate ho raha hai..." },
  "tts.result": { en: "Generated Audio 🎧", hi: "Generated Audio 🎧" },
  "tts.success": { en: "Speech generated successfully!", hi: "Speech generate ho gayi!" },
  "tts.failed": { en: "Speech generation failed, try again", hi: "Speech generate nahi hui, dubara try karo" },
  "tts.text_required": { en: "Enter some text first", hi: "Pehle text likho" },
  "tts.tip": { en: "💡 Try different voices for different content — formal, casual, narrative!", hi: "💡 Alag content ke liye alag voice try karo — formal, casual, narrative!" },

  // Sidebar
  "sidebar.lang_toggle": { en: "हिंदी", hi: "English" },

  // Common
  "download": { en: "Download", hi: "Download" },
  "copy": { en: "Copy", hi: "Copy" },
  "change": { en: "Change", hi: "Badlo" },
  "upload": { en: "Upload", hi: "Upload" },
};

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("app-lang");
    return (saved === "hi" ? "hi" : "en") as Lang;
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("app-lang", l);
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] ?? key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
