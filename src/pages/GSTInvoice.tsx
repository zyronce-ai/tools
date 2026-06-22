import { useState, useRef } from "react";
import { BreadcrumbSchema, FAQSchema } from "@/components/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Trash2, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

type InvoiceItem = { name: string; hsn: string; qty: number; rate: number; gstPercent: number; };
const defaultItem: InvoiceItem = { name: "", hsn: "", qty: 1, rate: 0, gstPercent: 18 };

export default function GSTInvoice() {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [businessName, setBusinessName] = useState("");
  const [gstin, setGstin] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<InvoiceItem[]>([{ ...defaultItem }]);
  const [showPreview, setShowPreview] = useState(false);

  const addItem = () => setItems([...items, { ...defaultItem }]);
  const removeItem = (idx: number) => { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)); };
  const updateItem = (idx: number, field: keyof InvoiceItem, value: string | number) => { setItems(items.map((item, i) => (i === idx ? { ...item, [field]: value } : item))); };

  const calcItem = (item: InvoiceItem) => { const taxable = item.qty * item.rate; const gstAmt = (taxable * item.gstPercent) / 100; return { taxable, gstAmt, total: taxable + gstAmt }; };

  const totals = items.reduce((acc, item) => { const c = calcItem(item); return { taxable: acc.taxable + c.taxable, gst: acc.gst + c.gstAmt, total: acc.total + c.total }; }, { taxable: 0, gst: 0, total: 0 });

  const generateInvoice = () => {
    if (!businessName.trim()) { toast({ title: "Enter business name", variant: "destructive" }); return; }
    if (items.some((i) => !i.name.trim() || i.rate <= 0)) { toast({ title: "Fill name and rate for all items", variant: "destructive" }); return; }
    setShowPreview(true);
  };

  const printInvoice = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Invoice ${invoiceNo}</title><style>body{font-family:Arial,sans-serif;padding:20px;color:#333}table{width:100%;border-collapse:collapse;margin:15px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}th{background:#f5f5f5;font-weight:600}.text-right{text-align:right}.header{display:flex;justify-content:space-between;border-bottom:2px solid #333;padding-bottom:10px;margin-bottom:15px}.total-row{font-weight:bold;background:#f9f9f9}.footer{margin-top:40px;font-size:12px;color:#666}h1{font-size:22px;margin:0}@media print{body{padding:0}}</style></head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <main>
      <SEO title="GST Invoice Generator" description="Generate GST-compliant invoices for your business" path="/invoice" />
      <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-primary" />{"GST Invoice Generator"}</h1>
        <p className="text-muted-foreground mt-1">{"Enter product details to create and print a GST invoice"}</p>
      </div>

      {!showPreview ? (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">{"Business Details"}</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div><Label>{"Business / Shop Name *"}</Label><Input placeholder="e.g. Nayra Trendz" value={businessName} onChange={(e) => setBusinessName(e.target.value)} /></div>
              <div><Label>GSTIN (optional)</Label><Input placeholder="e.g. 22AAAAA0000A1Z5" value={gstin} onChange={(e) => setGstin(e.target.value)} /></div>
              <div><Label>{"Customer Name"}</Label><Input placeholder={"Customer name"} value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Invoice No</Label><Input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} /></div>
                <div><Label>Date</Label><Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{"Products / Items"}</CardTitle>
              <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-4 w-4 mr-1" /> {"Add Item"}</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="border-b pb-3 space-y-2">
                  <div className="grid gap-2 grid-cols-2 sm:grid-cols-[1fr_80px_60px_80px_80px_40px] items-end">
                    <div className="col-span-2 sm:col-span-1"><Label className="text-xs">Item Name</Label><Input placeholder="Product name" value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} /></div>
                    <div><Label className="text-xs">HSN</Label><Input placeholder="HSN" value={item.hsn} onChange={(e) => updateItem(idx, "hsn", e.target.value)} /></div>
                    <div><Label className="text-xs">Qty</Label><Input type="number" min={1} value={item.qty} onChange={(e) => updateItem(idx, "qty", parseInt(e.target.value) || 1)} /></div>
                    <div><Label className="text-xs">Rate (₹)</Label><Input type="number" min={0} value={item.rate || ""} onChange={(e) => updateItem(idx, "rate", parseFloat(e.target.value) || 0)} /></div>
                    <div><Label className="text-xs">GST %</Label>
                      <Select value={String(item.gstPercent)} onValueChange={(v) => updateItem(idx, "gstPercent", parseInt(v))}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="0">0%</SelectItem><SelectItem value="5">5%</SelectItem><SelectItem value="12">12%</SelectItem><SelectItem value="18">18%</SelectItem><SelectItem value="28">28%</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(idx)} className="text-destructive self-end"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
              <div className="pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span>Taxable Amount:</span><span>₹{totals.taxable.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Total GST:</span><span>₹{totals.gst.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2"><span>Grand Total:</span><span>₹{totals.total.toFixed(2)}</span></div>
              </div>
            </CardContent>
          </Card>
          <Button onClick={generateInvoice} className="w-full" size="lg"><FileText className="h-4 w-4 mr-2" /> {"Generate Invoice"}</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={() => setShowPreview(false)} variant="outline">← Edit</Button>
            <Button onClick={printInvoice}><Printer className="h-4 w-4 mr-2" /> Print / Save PDF</Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <div ref={printRef}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #333", paddingBottom: "10px", marginBottom: "15px" }}>
                  <div><h1 style={{ fontSize: "22px", margin: 0 }}>{businessName}</h1>{gstin && <p style={{ margin: "4px 0", fontSize: "13px" }}>GSTIN: {gstin}</p>}</div>
                  <div style={{ textAlign: "right" }}><p style={{ fontWeight: "bold", margin: 0 }}>TAX INVOICE</p><p style={{ margin: "4px 0", fontSize: "13px" }}>Invoice #: {invoiceNo}</p><p style={{ margin: "4px 0", fontSize: "13px" }}>Date: {invoiceDate}</p></div>
                </div>
                {customerName && <p style={{ marginBottom: "15px", fontSize: "14px" }}><strong>Bill To:</strong> {customerName}</p>}
                <table style={{ width: "100%", borderCollapse: "collapse", margin: "15px 0" }}>
                  <thead><tr style={{ background: "#f5f5f5" }}>
                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left", fontSize: "13px" }}>#</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left", fontSize: "13px" }}>Item</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left", fontSize: "13px" }}>HSN</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right", fontSize: "13px" }}>Qty</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right", fontSize: "13px" }}>Rate</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right", fontSize: "13px" }}>GST%</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right", fontSize: "13px" }}>GST Amt</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right", fontSize: "13px" }}>Total</th>
                  </tr></thead>
                  <tbody>{items.map((item, idx) => { const c = calcItem(item); return (
                    <tr key={idx}>
                      <td style={{ border: "1px solid #ddd", padding: "8px", fontSize: "13px" }}>{idx + 1}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px", fontSize: "13px" }}>{item.name}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px", fontSize: "13px" }}>{item.hsn}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right", fontSize: "13px" }}>{item.qty}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right", fontSize: "13px" }}>₹{item.rate.toFixed(2)}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right", fontSize: "13px" }}>{item.gstPercent}%</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right", fontSize: "13px" }}>₹{c.gstAmt.toFixed(2)}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right", fontSize: "13px", fontWeight: "bold" }}>₹{c.total.toFixed(2)}</td>
                    </tr>); })}</tbody>
                  <tfoot><tr style={{ background: "#f9f9f9", fontWeight: "bold" }}>
                    <td colSpan={6} style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right", fontSize: "13px" }}>Grand Total</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right", fontSize: "13px" }}>₹{totals.gst.toFixed(2)}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right", fontSize: "13px" }}>₹{totals.total.toFixed(2)}</td>
                  </tr></tfoot>
                </table>
                <div style={{ marginTop: "40px", fontSize: "12px", color: "#666" }}>
                  <p>Terms & Conditions:</p>
                  <p>1. Goods once sold will not be taken back or exchanged.</p>
                  <p>2. All disputes subject to local jurisdiction.</p>
                  <div style={{ marginTop: "30px", textAlign: "right" }}><p style={{ borderTop: "1px solid #333", display: "inline-block", paddingTop: "5px" }}>Authorized Signatory</p></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </main>
  );
}
