import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Tag, User, ChevronRight, TrendingUp, BookOpen, Sparkles, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const categories = [
  { id: "all", label: "All Posts", icon: BookOpen },
  { id: "ecommerce-tips", label: "Ecommerce Tips", icon: TrendingUp },
  { id: "amazon-seller", label: "Amazon Seller Tips", icon: Sparkles },
  { id: "meesho-seller", label: "Meesho Seller Guide", icon: Tag },
  { id: "product-research", label: "Product Research", icon: Search },
];

const blogPosts = [
  {
    id: "top-10-ecommerce-tools-2026",
    title: "Top 10 Ecommerce Tools Every Online Seller Needs in 2026",
    excerpt: "Discover the must-have tools that can help you automate your online selling business and increase profits by up to 3x.",
    category: "ecommerce-tips",
    author: "NayraTools Team",
    date: "March 5, 2026",
    readTime: "8 min read",
    featured: true,
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop",
    content: `
## Top 10 Ecommerce Tools Every Online Seller Needs in 2026

Running an online business in 2026 requires smart tools that save time and boost sales. Here are the top 10 tools every seller should use:

### 1. AI Content Writer
Generate compelling product descriptions in seconds. AI-powered writers understand SEO and can create unique content for every product listing.

### 2. Keyword Research Tool
Finding the right keywords is crucial for visibility. Use tools that analyze search trends and suggest high-ranking keywords specific to your marketplace.

### 3. Pricing Calculator
Understanding fees, margins, and profit is essential. A good pricing calculator helps you set competitive prices while maintaining healthy margins.

### 4. Image Enhancement Tools
Product images make or break sales. Tools like background removers, image upscalers, and banner makers help create professional visuals.

### 5. Competitor Analysis
Stay ahead by analyzing what your competitors are doing. Track their pricing, keywords, and listing strategies.

### 6. GST Invoice Generator
For Indian sellers, GST-compliant invoicing is mandatory. Automated invoice generators save hours of manual work.

### 7. Listing Scorer
Get your listing scored and optimized with AI suggestions. Improve your product title, description, and images for better conversion.

### 8. AI Chatbot
Get instant answers to your ecommerce questions without searching through forums and articles.

### 9. Banner Maker
Create eye-catching promotional banners for your store, social media, and marketplace listings.

### 10. Text-to-Speech
Convert your product descriptions to audio for accessibility and multi-channel marketing.

---

**Pro Tip:** Using an all-in-one platform like NayraTools gives you access to all these tools in one dashboard, saving you both time and money.
    `,
  },
  {
    id: "amazon-listing-optimization-guide",
    title: "Complete Guide to Amazon Listing Optimization",
    excerpt: "Learn step-by-step how to optimize your Amazon product listings for maximum visibility and sales conversion.",
    category: "amazon-seller",
    author: "NayraTools Team",
    date: "March 3, 2026",
    readTime: "10 min read",
    featured: true,
    image: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800&h=500&fit=crop",
    content: `
## Complete Guide to Amazon Listing Optimization

Amazon is one of the largest marketplaces in the world. Here's how to optimize your listings:

### Title Optimization
- Include primary keywords naturally
- Keep it under 200 characters
- Include brand name, product type, key features
- Use proper capitalization

### Bullet Points
- Highlight 5 key benefits
- Start each with a capital letter
- Include relevant keywords
- Focus on customer pain points

### Product Description
- Tell a story about your product
- Use HTML formatting for readability
- Include secondary keywords
- Add a clear call-to-action

### Backend Keywords
- Use all available character space
- Don't repeat words from title
- Include misspellings and synonyms
- Add regional variations

### Images
- Use high-resolution images (1000x1000 minimum)
- Show product from multiple angles
- Include lifestyle images
- Add infographics highlighting features

---

**Use NayraTools' Listing Scorer** to get an instant analysis of your Amazon listing with actionable improvement suggestions.
    `,
  },
  {
    id: "meesho-seller-beginner-guide",
    title: "Meesho Seller Guide: Start Selling in 7 Days",
    excerpt: "A complete beginner's guide to starting your Meesho selling journey with tips for catalog creation and order management.",
    category: "meesho-seller",
    author: "NayraTools Team",
    date: "February 28, 2026",
    readTime: "7 min read",
    featured: false,
    image: "https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=800&h=500&fit=crop",
    content: `
## Meesho Seller Guide: Start Selling in 7 Days

Meesho is one of India's fastest-growing marketplaces. Here's your 7-day plan to start selling:

### Day 1-2: Registration & Setup
- Register on Meesho Supplier Hub
- Complete KYC verification
- Set up your business profile

### Day 3-4: Product Research
- Identify trending products in your niche
- Analyze competition and pricing
- Source products from manufacturers or wholesalers

### Day 5-6: Catalog Creation
- Take high-quality product photos
- Write compelling product descriptions
- Set competitive pricing with proper margins
- Upload your catalog

### Day 7: Go Live
- Review all listings
- Set up order notifications
- Prepare packaging materials
- Start fulfilling orders

### Tips for Success
1. **Price competitively** — Meesho buyers are price-sensitive
2. **Use quality images** — Remove backgrounds for a professional look
3. **Write clear descriptions** — Include size, material, and care instructions
4. **Ship on time** — Fast delivery improves your seller rating
5. **Handle returns gracefully** — Good customer service builds reputation

---

**Use NayraTools' Product Keywords** tool to find the best keywords for your Meesho listings and improve discoverability.
    `,
  },
  {
    id: "product-research-strategies",
    title: "5 Product Research Strategies That Actually Work",
    excerpt: "Stop guessing which products to sell. Use these proven research strategies to find winning products every time.",
    category: "product-research",
    author: "NayraTools Team",
    date: "February 25, 2026",
    readTime: "6 min read",
    featured: false,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
    content: `
## 5 Product Research Strategies That Actually Work

Finding the right product to sell is the foundation of ecommerce success. Here are 5 strategies:

### 1. Trend Analysis
- Use Google Trends to identify rising searches
- Monitor social media for trending products
- Check marketplace bestseller lists regularly

### 2. Competition Gap Analysis
- Find products with high demand but low competition
- Look for listings with poor quality that you can improve
- Analyze competitor reviews for product improvement ideas

### 3. Seasonal Product Planning
- Plan inventory around festivals and seasons
- Stock up 2-3 months before peak season
- Track year-over-year seasonal trends

### 4. Customer Pain Point Method
- Read customer reviews on existing products
- Identify common complaints
- Find or create products that solve these issues

### 5. Cross-Platform Research
- Compare products across Amazon, Flipkart, and Meesho
- Find products popular on one platform but missing on another
- Use price differences to your advantage

---

**Use NayraTools' Competitor Analysis** to automatically research your competition and find market gaps.
    `,
  },
  {
    id: "ecommerce-seo-tips",
    title: "SEO Tips for Ecommerce: Rank Higher on Marketplaces",
    excerpt: "Master marketplace SEO with these actionable tips to increase your product visibility and organic traffic.",
    category: "ecommerce-tips",
    author: "NayraTools Team",
    date: "February 20, 2026",
    readTime: "9 min read",
    featured: false,
    image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=500&fit=crop",
    content: `
## SEO Tips for Ecommerce: Rank Higher on Marketplaces

Search optimization on marketplaces works differently than Google SEO. Here's what you need to know:

### Keyword Placement
- Primary keyword in the first 80 characters of title
- Secondary keywords in bullet points
- Long-tail keywords in product description
- Backend search terms for additional coverage

### Image Optimization
- Use high-resolution images with white background
- Add alt text where possible
- Include product name in image file names

### Pricing Strategy
- Competitive pricing improves search ranking
- Offer discounts during promotional events
- Use psychological pricing (₹499 vs ₹500)

### Customer Reviews
- More positive reviews = higher ranking
- Respond to negative reviews professionally
- Encourage reviews through follow-up messages

### Performance Metrics
- Maintain high order fulfillment rate
- Keep return rate low
- Respond to customer queries quickly

---

**Use NayraTools' Product Keywords** to discover high-ranking keywords tailored to your specific marketplace.
    `,
  },
  {
    id: "amazon-ppc-guide",
    title: "Amazon PPC Guide for Indian Sellers",
    excerpt: "Learn how to set up and optimize Amazon PPC campaigns to maximize your ROI on the Indian marketplace.",
    category: "amazon-seller",
    author: "NayraTools Team",
    date: "February 15, 2026",
    readTime: "11 min read",
    featured: false,
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop",
    content: `
## Amazon PPC Guide for Indian Sellers

Amazon PPC (Pay-Per-Click) advertising is essential for visibility. Here's how to master it:

### Types of Amazon Ads
1. **Sponsored Products** — Appear in search results
2. **Sponsored Brands** — Banner ads at top of search
3. **Sponsored Display** — Retargeting ads

### Setting Up Your First Campaign
- Start with Automatic campaigns to discover keywords
- Set a daily budget of ₹200-500 for testing
- Run for 2 weeks before optimizing

### Optimization Tips
- Review Search Term Reports weekly
- Add negative keywords to reduce wasted spend
- Increase bids on high-converting keywords
- Decrease or pause low-performing keywords

### Budget Management
- Start small and scale winners
- Allocate 10-15% of revenue to advertising
- Track ACoS (Advertising Cost of Sales) closely
- Target ACoS below 30% for profitability

---

**Use NayraTools' Keyword Tool** to find the best keywords for your Amazon PPC campaigns.
    `,
  },
];

export function getBlogPosts() {
  return blogPosts;
}

export function getBlogPost(id: string) {
  return blogPosts.find((p) => p.id === id);
}

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const scaleUp = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } };

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = blogPosts.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter(p => p.featured);
  const regularPosts = filteredPosts.filter(p => !p.featured || activeCategory !== "all" || searchQuery !== "");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight block leading-tight">NayraTools</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Blog</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Home</Link>
            </Button>
            <Button asChild size="sm" className="shadow-md">
              <Link to="/chat">Start Free →</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Premium */}
      <section className="relative overflow-hidden py-20 md:py-28">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Expert Ecommerce Insights
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              Grow Your Online
              <br />
              <span className="text-primary relative">
                Business Smarter
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 8C50 2 100 2 150 6C200 10 250 4 298 8" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
                </svg>
              </span>
            </h1>
            <p className="mt-6 text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
              Expert guides, actionable tips, and proven strategies to scale your ecommerce business on Amazon, Meesho & more.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            initial="hidden" animate="visible" variants={fadeUp} 
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-10 max-w-xl mx-auto"
          >
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-13 text-base rounded-2xl border-2 border-border bg-card shadow-lg focus:border-primary/50 focus:shadow-xl transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories - Pill Style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-12">
        <motion.div 
          initial="hidden" animate="visible" variants={fadeIn} 
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full px-5 gap-1.5 transition-all duration-300 ${
                  activeCategory === cat.id 
                    ? "shadow-md shadow-primary/25 scale-105" 
                    : "hover:shadow-sm hover:scale-[1.02]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </Button>
            );
          })}
        </motion.div>
      </div>

      {/* Featured Posts - Large Cards (only show when no filter/search) */}
      {activeCategory === "all" && searchQuery === "" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2, duration: 0.5 }}>
            <div className="flex items-center gap-2 mb-8">
              <div className="h-8 w-1.5 rounded-full bg-primary" />
              <h2 className="text-2xl font-bold">Featured Articles</h2>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial="hidden"
                animate="visible"
                variants={scaleUp}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
              >
                <Link to={`/blog/${post.id}`} className="block group">
                  <Card className="overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 h-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                      <div className="aspect-video md:aspect-auto overflow-hidden relative">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:bg-gradient-to-r" />
                        <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground shadow-lg">
                          ⭐ Featured
                        </Badge>
                      </div>
                      <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                        <Badge variant="secondary" className="text-xs w-fit mb-3">
                          {categories.find((c) => c.id === post.category)?.label}
                        </Badge>
                        <h3 className="font-bold text-xl md:text-2xl leading-snug group-hover:text-primary transition-colors duration-300 mb-3">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> {post.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" /> {post.readTime}
                          </span>
                        </div>
                        <div className="mt-4 text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read Article <ChevronRight className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-1.5 rounded-full bg-primary" />
            <h2 className="text-2xl font-bold">
              {activeCategory === "all" && searchQuery === "" ? "All Articles" : "Results"}
            </h2>
            <span className="ml-2 text-sm text-muted-foreground bg-muted/20 px-2.5 py-0.5 rounded-full">
              {(activeCategory === "all" && searchQuery === "" ? regularPosts.filter(p => !p.featured) : regularPosts).length} posts
            </span>
          </div>
        </motion.div>

        {(activeCategory === "all" && searchQuery === "" ? regularPosts.filter(p => !p.featured) : regularPosts).length === 0 ? (
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="text-center py-20">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground">Try a different search or category</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeCategory === "all" && searchQuery === "" ? regularPosts.filter(p => !p.featured) : regularPosts).map((post, i) => (
              <motion.div
                key={post.id}
                initial="hidden"
                animate="visible"
                variants={scaleUp}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Link to={`/blog/${post.id}`} className="block group h-full">
                  <Card className="overflow-hidden border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 h-full flex flex-col">
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <CardContent className="p-5 flex flex-col flex-1">
                      <Badge variant="secondary" className="text-[11px] w-fit mb-3">
                        {categories.find((c) => c.id === post.category)?.label}
                      </Badge>
                      <h3 className="font-bold text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300 mb-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> {post.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" /> {post.readTime}
                          </span>
                        </div>
                        <span className="text-primary flex items-center gap-0.5 font-semibold group-hover:gap-1.5 transition-all">
                          Read <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Newsletter CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Boost Your Sales? 🚀
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Start using NayraTools' free AI-powered tools and take your ecommerce business to the next level.
            </p>
            <Button asChild size="lg" className="shadow-xl shadow-primary/20 text-base px-8 h-12 rounded-xl">
              <Link to="/chat">Start Using Tools Free →</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 NayraTools. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Blog;
