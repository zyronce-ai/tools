import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

const CookiePolicy = () => (
  <>
  <SEO title="Cookie Policy" description="Cookie policy for NayraTools website" path="/cookie-policy" />
  <main className="min-h-screen bg-background text-foreground">
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
      </Button>
      <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-semibold text-foreground">1. What Are Cookies</h2>
        <p>Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and improve your experience.</p>
        
        <h2 className="text-xl font-semibold text-foreground">2. How We Use Cookies</h2>
        <p>We use cookies for authentication (keeping you logged in), analytics (understanding usage patterns via Google Tag Manager), and functionality (remembering your preferences).</p>
        
        <h2 className="text-xl font-semibold text-foreground">3. Third-Party Cookies</h2>
        <p>We use Google Analytics and Google Tag Manager which may set cookies for tracking and analytics purposes. These services have their own cookie policies.</p>
        
        <h2 className="text-xl font-semibold text-foreground">4. Managing Cookies</h2>
        <p>You can control cookies through your browser settings. Disabling cookies may affect some functionality of the website.</p>
      </div>
    </div>
  </main>
  </>
);

export default CookiePolicy;