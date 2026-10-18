import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { OrganizationSchema, WebSiteSchema } from "@/components/JsonLd";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Loader2 } from "lucide-react";

// Lazy load all pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
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
const FakeReviewDetector = lazy(() => import("./pages/FakeReviewDetector"));
const ProductSEO = lazy(() => import("./pages/ProductSEO"));
const StartupGuide = lazy(() => import("./pages/StartupGuide"));
const BarcodeGenerator = lazy(() => import("./pages/BarcodeGenerator"));
const ImageCompressor = lazy(() => import("./pages/ImageCompressor"));
const LabelCropper = lazy(() => import("./pages/LabelCropper"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Contact = lazy(() => import("./pages/Contact"));
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
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
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/i/*" element={<ImageView />} />
                <Route path="/__test-upscaler" element={<ImageUpscaler />} />

                {/* Dashboard Routes - No Auth Required */}
                <Route path="/chat" element={<DashboardLayout><ChatBot /></DashboardLayout>} />
                <Route path="/history" element={<DashboardLayout><ContentHistory /></DashboardLayout>} />
                <Route path="/images" element={<DashboardLayout><ImageExtractor /></DashboardLayout>} />
                <Route path="/keywords" element={<DashboardLayout><ProductKeywords /></DashboardLayout>} />
                <Route path="/pricing-calculator" element={<DashboardLayout><PricingCalculator /></DashboardLayout>} />
                <Route path="/competitor" element={<DashboardLayout><CompetitorAnalysis /></DashboardLayout>} />
                <Route path="/banner" element={<DashboardLayout><BannerMaker /></DashboardLayout>} />
                <Route path="/invoice" element={<DashboardLayout><GSTInvoice /></DashboardLayout>} />
                <Route path="/bg-remover" element={<DashboardLayout><BackgroundRemover /></DashboardLayout>} />
                <Route path="/listing-scorer" element={<DashboardLayout><ListingScorer /></DashboardLayout>} />
                <Route path="/image-upscaler" element={<DashboardLayout><ImageUpscaler /></DashboardLayout>} />
                <Route path="/text-to-speech" element={<DashboardLayout><TextToSpeech /></DashboardLayout>} />
                <Route path="/image-to-url" element={<DashboardLayout><ImageToUrl /></DashboardLayout>} />
                <Route path="/logo-maker" element={<DashboardLayout><LogoMaker /></DashboardLayout>} />
                <Route path="/fake-review-detector" element={<DashboardLayout><FakeReviewDetector /></DashboardLayout>} />
                <Route path="/product-seo" element={<DashboardLayout><ProductSEO /></DashboardLayout>} />
                <Route path="/startup-guide" element={<DashboardLayout><StartupGuide /></DashboardLayout>} />
                <Route path="/barcode-generator" element={<DashboardLayout><BarcodeGenerator /></DashboardLayout>} />
                <Route path="/image-compressor" element={<DashboardLayout><ImageCompressor /></DashboardLayout>} />
                <Route path="/label-cropper" element={<DashboardLayout><LabelCropper /></DashboardLayout>} />
                <Route path="/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </HelmetProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
