import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { OrganizationSchema, WebSiteSchema } from "@/components/JsonLd";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
// Lazy load all pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Login = lazy(() => import("./pages/Login"));

const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const ChatBot = lazy(() => import("./pages/ChatBot"));
const ContentHistory = lazy(() => import("./pages/ContentHistory"));
const ImageExtractor = lazy(() => import("./pages/ImageExtractor"));
const ProductKeywords = lazy(() => import("./pages/ProductKeywords"));
const PricingCalculator = lazy(() => import("./pages/PricingCalculator"));
const CompetitorAnalysis = lazy(() => import("./pages/CompetitorAnalysis"));
const BannerMaker = lazy(() => import("./pages/BannerMaker"));
const GSTInvoice = lazy(() => import("./pages/GSTInvoice"));
const BackgroundRemover = lazy(() => import("./pages/BackgroundRemover"));
const ListingScorer = lazy(() => import("./pages/ListingScorer"));
const ImageUpscaler = lazy(() => import("./pages/ImageUpscaler"));
const TextToSpeech = lazy(() => import("./pages/TextToSpeech"));
const ImageToUrl = lazy(() => import("./pages/ImageToUrl"));
const LogoMaker = lazy(() => import("./pages/LogoMaker"));
const TrendingProducts = lazy(() => import("./pages/TrendingProducts"));
const FakeReviewDetector = lazy(() => import("./pages/FakeReviewDetector"));
const ProductSEO = lazy(() => import("./pages/ProductSEO"));
const StartupGuide = lazy(() => import("./pages/StartupGuide"));

const ApiSettings = lazy(() => import("./pages/ApiSettings"));
const BarcodeGenerator = lazy(() => import("./pages/BarcodeGenerator"));
const ImageCompressor = lazy(() => import("./pages/ImageCompressor"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Contact = lazy(() => import("./pages/Contact"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const Profile = lazy(() => import("./pages/Profile"));
const ImageView = lazy(() => import("./pages/ImageView"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const PageLoader = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const DashboardRoutes = () => (
  <ProtectedRoute>
    <DashboardLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="chat" element={<ChatBot />} />
        <Route path="history" element={<ContentHistory />} />
        <Route path="images" element={<ImageExtractor />} />
        <Route path="keywords" element={<ProductKeywords />} />
        <Route path="pricing-calculator" element={<PricingCalculator />} />
        <Route path="competitor" element={<CompetitorAnalysis />} />
        <Route path="banner" element={<BannerMaker />} />
        <Route path="invoice" element={<GSTInvoice />} />
        <Route path="bg-remover" element={<BackgroundRemover />} />
        <Route path="listing-scorer" element={<ListingScorer />} />
        <Route path="image-upscaler" element={<ImageUpscaler />} />
        <Route path="text-to-speech" element={<TextToSpeech />} />
        <Route path="image-to-url" element={<ImageToUrl />} />
        <Route path="logo-maker" element={<LogoMaker />} />
        <Route path="trending-products" element={<TrendingProducts />} />
        <Route path="fake-review-detector" element={<FakeReviewDetector />} />
        <Route path="product-seo" element={<ProductSEO />} />
        <Route path="startup-guide" element={<StartupGuide />} />
        <Route path="api-settings" element={<ApiSettings />} />
        <Route path="barcode-generator" element={<BarcodeGenerator />} />
        <Route path="image-compressor" element={<ImageCompressor />} />
        
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </DashboardLayout>
</ProtectedRoute>);

const App = () => (
  <QueryClientProvider client={queryClient}>
   <AuthProvider>
      <TooltipProvider>
          <Toaster />
          <Sonner />
          <HelmetProvider>
            <OrganizationSchema />
            <WebSiteSchema />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/i/*" element={<ImageView />} />
                <Route path="/*" element={<DashboardRoutes />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          </HelmetProvider>
        </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
