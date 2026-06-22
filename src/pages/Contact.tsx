import { Link } from "react-router-dom";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent! We'll get back to you soon.");
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <>
    <SEO title="Contact Us" description="Get in touch with the NayraTools team" path="/contact" />
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-8">Have questions or feedback? We'd love to hear from you.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card className="border-border/50">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Email</p>
                <a href="mailto:support@nayratools.com" className="text-sm text-primary hover:underline">support@nayratools.com</a>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">AI Chat Support</p>
                <Link to="/chat" className="text-sm text-primary hover:underline">Use our AI Chatbot</Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help?" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Tell us more..." rows={5} required />
              </div>
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
    </>
  );
};

export default Contact;
