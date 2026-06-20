import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, CheckCircle2, Sparkles, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { plans } from "@/components/PricingSection";

interface PricingModalProps {
  open: boolean;
  onClose: () => void;
}

export function PricingModal({ open, onClose }: PricingModalProps) {
  const [yearly, setYearly] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3, type: "spring", damping: 25 }} className="relative bg-[#121218] border border-[#2A2A38] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50">
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-[#2A2A38] bg-[#121218]">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[#FF6B35] flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-heading text-base font-bold text-[#F1F1F5]">Upgrade to Pro</span>
              </div>
              <button onClick={onClose} className="h-8 w-8 rounded-lg bg-[#1E1E28] hover:bg-[#2A2A38] flex items-center justify-center transition-colors">
                <X className="h-4 w-4 text-[#8888A0]" />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#F1F1F5] mb-2">Choose Your Plan</h3>
                <p className="text-[#8888A0] text-sm">Unlock all premium features for your ecommerce business</p>

                <div className="flex items-center justify-center gap-3 mt-6">
                  <span className={`text-sm font-medium ${!yearly ? "text-[#F1F1F5]" : "text-[#8888A0]"}`}>Monthly</span>
                  <button onClick={() => setYearly(!yearly)} className={`relative w-14 h-7 rounded-full transition-colors ${yearly ? "bg-[#FF6B35]" : "bg-[#2A2A38]"}`}>
                    <div className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform" style={{ transform: yearly ? 'translateX(28px)' : 'translateX(2px)' }} />
                  </button>
                  <span className={`text-sm font-medium ${yearly ? "text-[#F1F1F5]" : "text-[#8888A0]"}`}>Yearly <span className="text-[#FF6B35] font-semibold">Save up to 20%</span></span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {plans.map((plan, i) => {
                  const price = yearly ? plan.price.yearly : plan.price.monthly;
                  const period = yearly ? plan.period.yearly : plan.period.monthly;
                  return (
                    <div key={i} className={`relative flex flex-col rounded-xl border transition-all duration-300 ${plan.popular ? "border-[#FF6B35] bg-[#1E1E28] shadow-lg shadow-[#FF6B35]/10 scale-[1.02]" : "border-[#2A2A38] bg-[#16161D] hover:border-[#FF6B35]/30"}`}>
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF6B35] text-black text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                          <Crown className="h-2.5 w-2.5" />
                          Most Popular
                        </div>
                      )}
                      {plan.discount && yearly && (
                        <div className="absolute -top-3 right-3 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{plan.discount}</div>
                      )}
                      <div className="p-5 pb-0 flex-1">
                        <h3 className={`text-base font-bold mb-1 ${plan.popular ? "text-[#FF6B35]" : "text-[#F1F1F5]"}`}>{plan.name}</h3>
                        <p className="text-[10px] text-[#8888A0] mb-4">{plan.name === "Free" ? "Get started with basics" : plan.name === "Pro" ? "For growing sellers" : "For established businesses"}</p>
                        <div className="flex items-baseline gap-1 mb-5">
                          <span className="text-3xl font-black text-[#F1F1F5]">{price}</span>
                          <span className="text-[#8888A0] text-xs">{period}</span>
                        </div>
                        <ul className="space-y-2.5 mb-6">
                          {plan.features.map((f, j) => (
                            <li key={j} className="flex items-start gap-2.5 text-xs">
                              {f.included ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                              ) : (
                                <div className="h-3.5 w-3.5 rounded-full bg-[#2A2A38] flex items-center justify-center flex-shrink-0 mt-0.5"><div className="h-1.5 w-0.5 bg-[#8888A0] rotate-45" /></div>
                              )}
                              <span className={f.included ? "text-[#C0C0D0]" : "text-[#8888A0]"}>{f.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="px-5 pb-5">
                        <Link to={plan.href} onClick={onClose}>
                          <Button className={`w-full h-10 rounded-lg text-xs font-semibold transition-all ${plan.popular ? "bg-[#FF6B35] hover:brightness-110 text-black" : "bg-[#2A2A38] hover:bg-[#3A3A48] text-[#C0C0D0]"}`}>
                            {plan.cta}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}