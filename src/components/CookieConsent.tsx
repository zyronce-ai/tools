import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#1E1E28] border-t border-[#2A2A38] shadow-2xl">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-[#A0A0B0] flex-1">
          We use cookies to improve your experience. By continuing, you agree to our{" "}
          <Link to="/cookie-policy" className="text-[#FF6B35] hover:underline">Cookie Policy</Link>.
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={accept} className="border-[#2A2A38] text-[#A0A0B0] hover:text-[#F1F1F5]">
            Decline
          </Button>
          <Button size="sm" onClick={accept} className="bg-[#FF6B35] hover:brightness-110 text-white">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}