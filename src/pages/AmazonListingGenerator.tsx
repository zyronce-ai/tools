import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Copy, Download, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ListingData {
  category: string;
  productName: string;
  title: string;
  highlights: string;
  bulletPoints: string[];
  description: string;
  keywords: string[];
  backendKeywords: string;
  imageUrls: string[];
  imageRecommendations?: string[];
}

const CATEGORIES = [
  "Men's Clothing",
  "Women's Clothing",
  "Electronics",
  "Home & Kitchen",
  "Sports & Outdoors",
  "Beauty & Personal Care",
  "Toys & Games",
  "Books",
  "Shoes",
  "Accessories",
];

const AmazonListingGenerator = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: "",
    productName: "",
    productDescription: "",
    keyFeatures: "",
  });
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      let processed = 0;

      Array.from(files).forEach((file) => {
        // Check file size (max 5MB per image)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Max 5MB per image.`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
          }
          processed++;

          if (processed === files.length) {
            setUploadedImages((prev) => [...prev, ...newImages]);
            toast.success(`${newImages.length} image(s) uploaded successfully`);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  const handleGenerateListing = async () => {
    if (!formData.category || !formData.productName || !formData.productDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Call Supabase edge function to generate listing
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-amazon-listing`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            category: formData.category,
            productName: formData.productName,
            productDescription: formData.productDescription,
            keyFeatures: formData.keyFeatures,
            images: uploadedImages,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate listing");
      }

      const data = await response.json();
      setListingData(data);
      setStep(2);
      toast.success("Listing generated successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to generate listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleDownloadListing = () => {
    if (!listingData) return;

    const content = `
AMAZON PRODUCT LISTING
======================

CATEGORY: ${listingData.category}

TITLE (${listingData.title.length}/75 characters):
${listingData.title}

HIGHLIGHTS (${listingData.highlights.length}/125 characters):
${listingData.highlights}

BULLET POINTS:
${listingData.bulletPoints.map((bp, i) => `${i + 1}. ${bp}`).join("\n")}

DESCRIPTION:
${listingData.description}

KEYWORDS:
${listingData.keywords.join(", ")}

BACKEND KEYWORDS (semicolon separated):
${listingData.backendKeywords}

IMAGES:
${listingData.imageUrls.map((url, i) => `Image ${i + 1}: ${url}`).join("\n")}
    `;

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", `amazon-listing-${listingData.productName.replace(/\s+/g, "-")}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Listing downloaded!");
  };

  return (
    <>
      <SEO
        title="Amazon Listing Generator - NayraTools"
        description="Generate optimized Amazon product listings with titles, bullet points, descriptions, and keywords"
        path="/amazon-listing-generator"
      />

      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Amazon Listing Generator</h1>
            <p className="text-gray-600">Create optimized product listings for Amazon in minutes</p>
          </div>

          {step === 1 ? (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select a category...</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="e.g., Men's White Cotton Formal Shirt"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Description *
                  </label>
                  <textarea
                    value={formData.productDescription}
                    onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                    placeholder="Describe your product details, materials, uses, and benefits..."
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Features & High Search Keywords
                  </label>
                  <textarea
                    value={formData.keyFeatures}
                    onChange={(e) => setFormData({ ...formData, keyFeatures: e.target.value })}
                    placeholder="e.g., cotton, full sleeve, formal, office wear, comfortable, breathable..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images (Optional) - AI will analyze them
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Click to upload product images
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Max 5MB per image. AI will analyze colors, materials, and features.</p>
                  </div>

                  {/* Image Preview Grid */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Uploaded Images ({uploadedImages.length})
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {uploadedImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img}
                              alt={`Product ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleGenerateListing}
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Listing"
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            listingData && (
              <div className="space-y-6">
                {/* Title */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Title ({listingData.title.length}/75 characters)</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyToClipboard(listingData.title, "Title")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold text-gray-900">{listingData.title}</p>
                  </CardContent>
                </Card>

                {/* Highlights */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Highlights ({listingData.highlights.length}/125 characters)</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyToClipboard(listingData.highlights, "Highlights")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{listingData.highlights}</p>
                  </CardContent>
                </Card>

                {/* Bullet Points */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Bullet Points</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyToClipboard(listingData.bulletPoints.join("\n"), "Bullet Points")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {listingData.bulletPoints.map((bp, i) => (
                        <li key={i} className="text-gray-700 flex gap-3">
                          <span className="font-semibold text-orange-600">{i + 1}.</span>
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Description */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Product Description</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyToClipboard(listingData.description, "Description")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-700 whitespace-pre-wrap">{listingData.description}</div>
                  </CardContent>
                </Card>

                {/* Keywords */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>High Search Keywords</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyToClipboard(listingData.keywords.join(", "), "Keywords")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{listingData.keywords.join(", ")}</p>
                  </CardContent>
                </Card>

                {/* Backend Keywords */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Backend Keywords (Semicolon Separated)</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyToClipboard(listingData.backendKeywords, "Backend Keywords")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 break-words">{listingData.backendKeywords}</p>
                  </CardContent>
                </Card>

                {/* Image Recommendations */}
                {listingData.imageRecommendations && listingData.imageRecommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommended Images for Your Listing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {listingData.imageRecommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="font-semibold text-orange-600 min-w-[24px]">{i + 1}.</span>
                            <span className="text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-gray-500 mt-4">
                        💡 Tip: High-quality images with these perspectives will improve your conversion rate
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1"
                  >
                    Generate New Listing
                  </Button>
                  <Button
                    onClick={handleDownloadListing}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Listing
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default AmazonListingGenerator;
