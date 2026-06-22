import { useState, useRef, useEffect, useCallback } from "react";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Barcode, Download, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

const barcodeFormats = [
  { value: "CODE128", label: "Code 128 (General)" },
  { value: "EAN13", label: "EAN-13 (Products)" },
  { value: "EAN8", label: "EAN-8 (Small Products)" },
  { value: "UPC", label: "UPC-A (US Products)" },
  { value: "CODE39", label: "Code 39 (Industrial)" },
  { value: "ITF14", label: "ITF-14 (Shipping)" },
];

export default function BarcodeGenerator() {
  const { toast } = useToast();
  const [tab, setTab] = useState("qr");
  
  // QR state
  const [qrText, setQrText] = useState("");
  const [qrSize, setQrSize] = useState("300");
  const [qrColor, setQrColor] = useState("#000000");
  const [qrDataUrl, setQrDataUrl] = useState("");

  // Barcode state
  const [barcodeText, setBarcodeText] = useState("");
  const [barcodeFormat, setBarcodeFormat] = useState("CODE128");
  const barcodeRef = useRef<SVGSVGElement>(null);
  const [barcodeReady, setBarcodeReady] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate QR
  const generateQR = useCallback(async () => {
    if (!qrText.trim()) { setQrDataUrl(""); return; }
    try {
      const url = await QRCode.toDataURL(qrText, {
        width: parseInt(qrSize),
        margin: 2,
        color: { dark: qrColor, light: "#FFFFFF" },
      });
      setQrDataUrl(url);
    } catch { setQrDataUrl(""); }
  }, [qrText, qrSize, qrColor]);

  useEffect(() => { generateQR(); }, [generateQR]);

  // Generate Barcode
  const generateBarcode = useCallback(() => {
    if (!barcodeText.trim() || !barcodeRef.current) { setBarcodeReady(false); return; }
    try {
      JsBarcode(barcodeRef.current, barcodeText, {
        format: barcodeFormat,
        lineColor: "#000",
        width: 2,
        height: 80,
        displayValue: true,
        fontSize: 16,
        margin: 10,
      });
      setBarcodeReady(true);
    } catch (e) {
      setBarcodeReady(false);
      toast({ title: "Invalid input for this format", variant: "destructive" });
    }
  }, [barcodeText, barcodeFormat, toast]);

  useEffect(() => { generateBarcode(); }, [generateBarcode]);

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qr-code-${Date.now()}.png`;
    a.click();
    toast({ title: "QR Code downloaded! ✅" });
  };

  const downloadBarcode = () => {
    if (!barcodeRef.current || !barcodeReady) return;
    const svgData = new XMLSerializer().serializeToString(barcodeRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx!.fillStyle = "#fff";
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `barcode-${Date.now()}.png`;
      a.click();
      toast({ title: "Barcode downloaded! ✅" });
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied! ✅" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="space-y-6 max-w-3xl mx-auto">
      <SEO title="Barcode Generator" description="Generate barcodes for your products" path="/barcode-generator" />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <QrCode className="h-6 w-6 text-primary" />
          Barcode & QR Code Generator
        </h1>
        <p className="text-muted-foreground mt-1">Generate QR codes and barcodes for products — instant download</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qr" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" /> QR Code
          </TabsTrigger>
          <TabsTrigger value="barcode" className="flex items-center gap-2">
            <Barcode className="h-4 w-4" /> Barcode
          </TabsTrigger>
        </TabsList>

        {/* QR Code Tab */}
        <TabsContent value="qr">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-lg">QR Code Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Text / URL *</Label>
                  <Input
                    placeholder="e.g. https://yourstore.com or product info"
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Size (px)</Label>
                    <Select value={qrSize} onValueChange={setQrSize}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="200">200 x 200</SelectItem>
                        <SelectItem value="300">300 x 300</SelectItem>
                        <SelectItem value="500">500 x 500</SelectItem>
                        <SelectItem value="800">800 x 800</SelectItem>
                        <SelectItem value="1024">1024 x 1024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Color</Label>
                    <div className="flex gap-2 items-center mt-1">
                      <input type="color" value={qrColor} onChange={(e) => setQrColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
                      <span className="text-sm text-muted-foreground">{qrColor}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                  <p>💡 <strong>Use cases:</strong></p>
                  <p>• Put QR code on product packaging → customer goes to direct link</p>
                  <p>• WhatsApp number ka QR → easy contact</p>
                  <p>• Payment UPI QR → direct payment</p>
                  <p>• Google Maps location → store location share</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Preview
                  {qrDataUrl && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(qrText)}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" onClick={downloadQR}>
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center min-h-[300px]">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="max-w-full rounded-lg shadow-sm" />
                ) : (
                  <div className="text-center text-muted-foreground space-y-2">
                    <QrCode className="h-16 w-16 mx-auto opacity-20" />
                    <p>Enter text or URL — QR code will be auto generated</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Barcode Tab */}
        <TabsContent value="barcode">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-lg">Barcode Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Product Code / Number *</Label>
                  <Input
                    placeholder={barcodeFormat === "EAN13" ? "e.g. 8901234567890" : "e.g. PROD-001"}
                    value={barcodeText}
                    onChange={(e) => setBarcodeText(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Barcode Format</Label>
                  <Select value={barcodeFormat} onValueChange={setBarcodeFormat}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {barcodeFormats.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                  <p>💡 <strong>Format Guide:</strong></p>
                  <p>• <strong>Code 128</strong> — Any text/number, general purpose</p>
                  <p>• <strong>EAN-13</strong> — 13 digit number, Indian products (890...)</p>
                  <p>• <strong>EAN-8</strong> — 8 digit, small products</p>
                  <p>• <strong>UPC-A</strong> — 12 digit, US market products</p>
                  <p>• <strong>Code 39</strong> — Letters + numbers, industrial use</p>
                  <p>• <strong>ITF-14</strong> — 14 digit, shipping boxes</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Preview
                  {barcodeReady && (
                    <Button size="sm" onClick={downloadBarcode}>
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center min-h-[300px]">
                <div className={barcodeReady ? "" : "hidden"}>
                  <svg ref={barcodeRef} className="max-w-full" />
                </div>
                {!barcodeReady && (
                  <div className="text-center text-muted-foreground space-y-2">
                    <Barcode className="h-16 w-16 mx-auto opacity-20" />
                    <p>Enter product code — barcode will be auto generated</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
