import { useState } from "react";
import { CheckCircle2, CreditCard, Zap, Rocket, Building2 } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "../contexts/AuthContext";
import { BrandIcon } from "../components/BrandIcon";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function BillingPage() {
  const [loading, setLoading] = useState(false);

  const { session } = useAuth();

  const handleUpgrade = async (priceId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ priceId })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto pt-8"
    >
      <motion.div variants={itemVariants} className="mb-10">
        <h1 className="text-3xl font-semibold text-stone-100 tracking-tight mb-2">Billing & Subscription</h1>
        <p className="text-stone-400">Manage your plan, payment methods, and billing history.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-stone-900/40 border border-stone-800/80 rounded-3xl p-8 mb-12 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <CreditCard className="w-32 h-32 text-stone-100" />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h2 className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wider">Current Plan</h2>
            <div className="flex items-center gap-4">
              <span className="px-4 py-1.5 bg-stone-800/80 border border-stone-700/50 text-stone-200 rounded-lg text-sm font-semibold shadow-sm">Free Tier</span>
              <span className="text-sm text-stone-400 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                20 transforms / month
              </span>
            </div>
          </div>
          <button className="text-sm font-medium text-stone-300 bg-stone-900/50 border border-stone-800/80 hover:bg-stone-800 hover:text-stone-100 px-6 py-3 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Manage Payment
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-10">
        <h2 className="text-xl font-semibold text-stone-100 tracking-tight">Upgrade Your Plan</h2>
        <p className="text-sm text-stone-400 mt-1">Unlock unlimited transformations and advanced features.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Pro Plan */}
        <motion.div variants={itemVariants} className="bg-stone-900/60 border border-stone-700/50 rounded-3xl p-8 relative shadow-2xl group mt-4 md:mt-0">
          <div className="absolute inset-0 bg-gradient-to-br from-stone-800/20 via-transparent to-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>

          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-100 text-stone-950 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5 z-20">
            <BrandIcon className="w-3 h-3 text-stone-900" /> Most Popular
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl font-semibold text-stone-100 mb-2">Pro</h3>
            <div className="text-5xl font-bold text-stone-100 mb-8 tracking-tighter">$9<span className="text-xl text-stone-500 font-medium tracking-normal">/mo</span></div>

            <ul className="space-y-4 mb-10 text-sm text-stone-300">
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-stone-100" /> <span className="font-medium text-stone-200">Unlimited</span> transforms</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-stone-100" /> All 6 tone modes</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-stone-100" /> Works on ALL tools</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-stone-100" /> Prompt history (90 days)</li>
            </ul>

            <button
              onClick={() => handleUpgrade("price_pro_mock")}
              disabled={loading}
              className="w-full py-4 text-center rounded-xl bg-stone-100 text-stone-950 font-semibold hover:bg-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(245,245,244,0.1)] hover:shadow-[0_0_25px_rgba(245,245,244,0.2)]"
            >
              {loading ? "Processing..." : <><Zap className="w-4 h-4" /> Upgrade to Pro</>}
            </button>
          </div>
        </motion.div>

        {/* Team Plan */}
        <motion.div variants={itemVariants} className="bg-stone-900/20 border border-stone-800/60 rounded-3xl p-8 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-stone-800/10 via-transparent to-stone-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>

          <div className="relative z-10">
            <h3 className="text-2xl font-semibold text-stone-100 mb-2">Team</h3>
            <div className="text-5xl font-bold text-stone-100 mb-8 tracking-tighter">$29<span className="text-xl text-stone-500 font-medium tracking-normal">/mo</span></div>

            <ul className="space-y-4 mb-10 text-sm text-stone-400">
              <li className="flex items-center gap-3 font-medium text-stone-300"><CheckCircle2 className="w-5 h-5 text-stone-100" /> Everything in Pro, plus:</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-stone-600" /> <span className="text-stone-300">5 seats included</span></li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-stone-600" /> Team prompt library</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-stone-600" /> Priority support</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-stone-600" /> Analytics dashboard</li>
            </ul>

            <button
              onClick={() => handleUpgrade("price_team_mock")}
              disabled={loading}
              className="w-full py-4 text-center rounded-xl bg-stone-900/50 border border-stone-800/80 text-stone-300 font-semibold hover:bg-stone-800 hover:text-stone-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? "Processing..." : <><Building2 className="w-4 h-4" /> Contact Sales</>}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
