import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

const RefundPolicy = () => (
  <>
  <SEO title="Refund Policy" description="Refund and cancellation policy for NayraTools subscriptions" path="/refund-policy" />
  <main className="min-h-screen bg-background text-foreground">
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
      </Button>
      <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-semibold text-foreground">1. Subscription Cancellation</h2>
        <p>You may cancel your subscription at any time. Upon cancellation, you will retain access to paid features until the end of your current billing cycle.</p>
        
        <h2 className="text-xl font-semibold text-foreground">2. Refund Eligibility</h2>
        <p>We offer a 7-day refund policy for new subscriptions. If you are not satisfied with our service, contact us within 7 days of purchase for a full refund.</p>
        
        <h2 className="text-xl font-semibold text-foreground">3. How to Request a Refund</h2>
        <p>To request a refund, please contact us through our contact page with your registered email and order details. We will process your refund within 5-7 business days.</p>
        
        <h2 className="text-xl font-semibold text-foreground">4. Non-Refundable Items</h2>
        <p>AI API usage credits, once consumed, are non-refundable. Add-on purchases are refundable only if not used.</p>
      </div>
    </div>
  </main>
  </>
);

export default RefundPolicy;