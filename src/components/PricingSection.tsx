import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

export const plans = [
  {
    name: "Free", price: { monthly: "₹0", yearly: "₹0" }, period: { monthly: "forever", yearly: "forever" }, popular: false, discount: null,
    features: [
      { text: "AI ChatBot access", included: true },
      { text: "Product Keywords (10/mo)", included: true },
      { text: "Basic image tools", included: true },
      { text: "Email support", included: true },
      { text: "Competitor analysis", included: false },
      { text: "Advanced image editing", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started", href: "/login",
  },
  {
    name: "Pro", price: { monthly: "₹1,499", yearly: "₹14,999" }, period: { monthly: "/month", yearly: "/year" }, popular: true, discount: "Save ₹3,000",
    features: [
      { text: "All AI tools unlimited", included: true },
      { text: "Advanced image editing", included: true },
      { text: "Competitor analysis", included: true },
      { text: "Trending products", included: true },
      { text: "Priority support", included: true },
      { text: "GST invoices & TTS", included: true },
      { text: "Dedicated manager", included: false },
    ],
    cta: "Subscribe Now", href: "/login",
  },
  {
    name: "Business", price: { monthly: "₹3,999", yearly: "₹39,999" }, period: { monthly: "/month", yearly: "/year" }, popular: false, discount: "Save ₹8,000",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited requests", included: true },
      { text: "API access", included: true },
      { text: "Team accounts (5)", included: true },
      { text: "Dedicated manager", included: true },
      { text: "Custom integrations", included: true },
      { text: "SLA guarantee", included: true },
    ],
    cta: "Contact Sales", href: "/contact",
  },
];

export const allFeatures = [
  "AI ChatBot", "Product Keywords", "Basic Image Tools",
  "Email Support", "Competitor Analysis", "Advanced Image Editing",
  "Priority Support", "GST Invoices & TTS",
  "Trending Products", "Dedicated Manager",
  "Unlimited Requests", "API Access",
  "Team Accounts (5)", "Custom Integrations", "SLA Guarantee",
];

export function PricingSection({ showHeader = true, showTable = true }: { showHeader?: boolean; showTable?: boolean }) {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden" id="pricing">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {showHeader && (
          <motion.div {...fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">💰 Simple Pricing</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Plans That Fit Your Business</h2>
            <p className="text-lg text-gray-600">Start free, upgrade when you grow. No hidden fees.</p>

            <div className="flex items-center justify-center gap-3 mt-8">
              <span className={`text-sm font-medium ${!yearly ? "text-gray-900" : "text-gray-400"}`}>Monthly</span>
              <button onClick={() => setYearly(!yearly)} className={`relative w-14 h-7 rounded-full transition-colors ${yearly ? "bg-orange-500" : "bg-gray-300"}`}>
                <div className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform" style={{ transform: yearly ? 'translateX(28px)' : 'translateX(2px)' }} />
              </button>
              <span className={`text-sm font-medium ${yearly ? "text-gray-900" : "text-gray-400"}`}>Yearly <span className="text-orange-600 font-semibold">Save up to 20%</span></span>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const price = yearly ? plan.price.yearly : plan.price.monthly;
            const period = yearly ? plan.period.yearly : plan.period.monthly;
            return (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }} className={`relative flex flex-col bg-white rounded-2xl border-2 transition-all duration-300 ${plan.popular ? "border-orange-400 shadow-xl shadow-orange-100/50 scale-[1.02] md:scale-105 z-10" : "border-gray-200 hover:border-orange-200 shadow-sm hover:shadow-xl"}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg shadow-orange-200 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </div>
                </div>
              )}
              {plan.discount && yearly && (
                <div className="absolute -top-4 right-6 z-20">
                  <div className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">{plan.discount}</div>
                </div>
              )}
              <div className="p-8 pb-0 flex-1">
                <h3 className={`text-lg font-bold mb-1 ${plan.popular ? "text-orange-600" : "text-gray-900"}`}>{plan.name}</h3>
                <p className="text-xs text-gray-400 mb-5">{plan.name === "Free" ? "Get started with basics" : plan.name === "Pro" ? "For growing sellers" : "For established businesses"}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-black text-gray-900 tracking-tight">{price}</span>
                  <span className="text-gray-400 text-sm">{period}</span>
                </div>

                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm">
                      {f.included ? (
                        <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle2 className="h-3 w-3 text-orange-600" /></div>
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="h-2 w-0.5 bg-gray-300 rotate-45" /></div>
                      )}
                      <span className={f.included ? "text-gray-700" : "text-gray-400"}>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-8 pb-8">
                <Link to={plan.href}>
                  <Button className={`w-full h-12 rounded-xl text-sm font-semibold transition-all ${plan.popular ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 hover:shadow-xl" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}>
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          )})}
        </div>

        {showTable && (
          <motion.div {...fadeUp} className="mt-20 max-w-4xl mx-auto">
            <h3 className="text-center text-xl font-bold text-gray-900 mb-8">Full Feature Comparison</h3>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Feature</th>
                    {plans.map(p => (
                      <th key={p.name} className={`px-4 py-4 text-center font-semibold ${p.popular ? "text-orange-600" : "text-gray-900"}`}>{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((feature, idx) => (
                    <tr key={feature} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-6 py-3.5 text-gray-700 font-medium">{feature}</td>
                      {plans.map(p => {
                        const found = p.features.find(f => f.text.toLowerCase().startsWith(feature.toLowerCase().slice(0, 4)));
                        return (
                          <td key={p.name} className="px-4 py-3.5 text-center">
                            {found?.included ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                            ) : (
                              <div className="h-4 w-4 text-gray-300 mx-auto">—</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="border-t border-gray-100 bg-gray-50/80">
                    <td className="px-6 py-4 font-semibold text-gray-900"></td>
                    {plans.map(p => (
                      <td key={p.name} className="px-4 py-4 text-center">
                        <Link to={p.href}>
                          <Button className={`text-xs h-9 px-5 rounded-lg ${p.popular ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}>{p.cta}</Button>
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}