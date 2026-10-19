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
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
const AmazonListingGenerator = lazy(() => import("./pages/AmazonListingGenerator"));
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
            <AuthProvider>
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
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/i/*" element={<ImageView />} />
                  <Route path="/__test-upscaler" element={<ImageUpscaler />} />

                  {/* Protected Dashboard Routes */}
                  <Route path="/chat" element={<ProtectedRoute><DashboardLayout><ChatBot /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/history" element={<ProtectedRoute><DashboardLayout><ContentHistory /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/images" element={<ProtectedRoute><DashboardLayout><ImageExtractor /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/keywords" element={<ProtectedRoute><DashboardLayout><ProductKeywords /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/pricing-calculator" element={<ProtectedRoute><DashboardLayout><PricingCalculator /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/competitor" element={<ProtectedRoute><DashboardLayout><CompetitorAnalysis /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/banner" element={<ProtectedRoute><DashboardLayout><BannerMaker /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/amazon-listing-generator" element={<ProtectedRoute><DashboardLayout><AmazonListingGenerator /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/invoice" element={<ProtectedRoute><DashboardLayout><GSTInvoice /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/bg-remover" element={<ProtectedRoute><DashboardLayout><BackgroundRemover /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/listing-scorer" element={<ProtectedRoute><DashboardLayout><ListingScorer /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/image-upscaler" element={<ProtectedRoute><DashboardLayout><ImageUpscaler /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/text-to-speech" element={<ProtectedRoute><DashboardLayout><TextToSpeech /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/image-to-url" element={<ProtectedRoute><DashboardLayout><ImageToUrl /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/logo-maker" element={<ProtectedRoute><DashboardLayout><LogoMaker /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/fake-review-detector" element={<ProtectedRoute><DashboardLayout><FakeReviewDetector /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/product-seo" element={<ProtectedRoute><DashboardLayout><ProductSEO /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/startup-guide" element={<ProtectedRoute><DashboardLayout><StartupGuide /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/barcode-generator" element={<ProtectedRoute><DashboardLayout><BarcodeGenerator /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/image-compressor" element={<ProtectedRoute><DashboardLayout><ImageCompressor /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/label-cropper" element={<ProtectedRoute><DashboardLayout><LabelCropper /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AuthProvider>
          </BrowserRouter>
        </HelmetProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
