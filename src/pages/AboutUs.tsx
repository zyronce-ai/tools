import { Link } from "react-router-dom";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { ArrowLeft, Sparkles, Target, Users, Zap } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const values = [
  { icon: Zap, title: "Speed", desc: "We build tools that save you hours of work and deliver instant results." },
  { icon: Target, title: "Accuracy", desc: "AI-powered precision to help you make better business decisions." },
  { icon: Users, title: "Seller-First", desc: "Every feature is designed with Indian ecommerce sellers in mind." },
];

const AboutUs = () => (
  <>
  <SEO title="About Us" description="Learn about NayraTools and our mission to empower ecommerce sellers with AI" path="/about" />
  <main className="min-h-screen bg-background text-foreground">
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
      </Button>
      
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">NayraTools</span>
        </div>
        <h1 className="text-3xl font-bold mb-4">About Us</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          NayraTools is an all-in-one AI-powered ecommerce toolkit built for Indian online sellers. We help you save time, boost sales, and grow your business with 18+ powerful tools.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            We believe every seller — whether beginner or experienced — deserves access to powerful tools that were previously only available to big brands. Our mission is to democratize ecommerce technology and make AI-powered tools accessible to everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {values.map((v) => (
            <Card key={v.title} className="border-border/50">
              <CardContent className="p-6 text-center">
                <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-3">What We Offer</h2>
          <p className="text-muted-foreground leading-relaxed">
            From AI content writing and keyword research to image editing, logo design, GST invoicing, and barcode generation — NayraTools has everything you need under one roof. No multiple subscriptions, no complex setups.
          </p>
        </div>

        <div className="mt-8 p-8 rounded-2xl bg-card border border-border/50 text-center">
          <h2 className="text-2xl font-bold mb-4">Meet the Founder</h2>
          <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-primary">CP</span>
          </div>
          <h3 className="text-xl font-semibold mb-1">Chetan Parihar</h3>
          <p className="text-sm text-primary font-medium mb-4">Founder & Entrepreneur</p>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Chetan Parihar is a passionate entrepreneur with deep experience in technology and ecommerce. He built NayraTools with the vision of making powerful AI tools easily accessible to every Indian online seller. Chetan believes that with the right use of technology, even small sellers can compete with big brands. NayraTools is the result of his hard work and dedication, making sellers' lives easier every day.
          </p>
        </div>
      </div>
    </div>
  </main>
  </>
);

export default AboutUs;
