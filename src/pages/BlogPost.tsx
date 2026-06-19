import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, BookOpen, Share2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { getBlogPost, getBlogPosts } from "./Blog";

const categories: Record<string, string> = {
  "ecommerce-tips": "Ecommerce Tips",
  "amazon-seller": "Amazon Seller Tips",
  "meesho-seller": "Meesho Seller Guide",
  "product-research": "Product Research",
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogPost(slug || "");
  const allPosts = getBlogPosts();
  const relatedPosts = allPosts.filter(p => p.id !== slug).slice(0, 3);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Post Not Found</h1>
          <Button asChild>
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: post.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/blog" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare} className="rounded-full">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button asChild size="sm" className="shadow-md">
              <Link to="/chat">Start Free →</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Image */}
      <div className="relative w-full h-[300px] md:h-[420px] overflow-hidden">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 -mt-32 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="bg-card rounded-2xl border border-border shadow-xl p-8 md:p-12">
            <Badge variant="secondary" className="mb-5">
              {categories[post.category] || post.category}
            </Badge>

            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-5">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" /> {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> {post.date}
              </span>
              {(post as any).readTime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {(post as any).readTime}
                </span>
              )}
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-li:leading-relaxed prose-strong:text-foreground">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 p-8 md:p-10 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-primary/20 text-center shadow-lg"
        >
          <h3 className="text-2xl font-bold mb-3">Ready to grow your business? 🚀</h3>
          <p className="text-muted-foreground mb-6 text-lg">Try NayraTools — free AI-powered tools for online sellers.</p>
          <Button asChild size="lg" className="shadow-xl shadow-primary/20 px-8 h-12 rounded-xl text-base">
            <Link to="/chat">Start Using Tools Free →</Link>
          </Button>
        </motion.div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 mb-16">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-7 w-1.5 rounded-full bg-primary" />
              <h2 className="text-2xl font-bold">Related Articles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedPosts.map((rp, i) => (
                <motion.div
                  key={rp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <Link to={`/blog/${rp.id}`} className="group block">
                    <div className="aspect-video rounded-xl overflow-hidden mb-3">
                      <img 
                        src={rp.image} 
                        alt={rp.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        loading="lazy"
                      />
                    </div>
                    <Badge variant="secondary" className="text-[10px] mb-2">
                      {categories[rp.category] || rp.category}
                    </Badge>
                    <h4 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {rp.title}
                    </h4>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 NayraTools. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default BlogPost;
