import { Link } from "react-router-dom";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

const TermsConditions = () => (
  <>
  <SEO title="Terms & Conditions" description="Terms and conditions for using NayraTools" path="/terms" />
  <main className="min-h-screen bg-background text-foreground">
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
      </Button>
      <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
        <p>By accessing and using NayraTools, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
        
        <h2 className="text-xl font-semibold text-foreground">2. Use of Services</h2>
        <p>NayraTools provides AI-powered ecommerce tools for online sellers. You agree to use these tools responsibly and not for any illegal or unauthorized purpose.</p>
        
        <h2 className="text-xl font-semibold text-foreground">3. Account Responsibility</h2>
        <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
        
        <h2 className="text-xl font-semibold text-foreground">4. Intellectual Property</h2>
        <p>Content generated using our AI tools is yours to use. However, the tools, platform design, and underlying technology remain the property of NayraTools.</p>
        
        <h2 className="text-xl font-semibold text-foreground">5. Limitation of Liability</h2>
        <p>NayraTools is provided "as is" without warranties. We are not liable for any damages arising from the use of our tools or AI-generated content.</p>
        
        <h2 className="text-xl font-semibold text-foreground">6. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of updated terms.</p>
        
        <h2 className="text-xl font-semibold text-foreground">7. Contact</h2>
        <p>For any questions about these terms, please contact us at <a href="mailto:support@nayratools.com" className="text-primary hover:underline">support@nayratools.com</a>.</p>
      </div>
    </div>
  </main>
  </>
);

export default TermsConditions;
