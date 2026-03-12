import { useState, useEffect } from "react";
import { Rocket, Copy, RefreshCw, ArrowRight, Zap, Clock, MessageSquare, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { BrandIcon } from "../components/BrandIcon";

import { useAuth } from "../contexts/AuthContext";

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

export default function DashboardHome() {
  const [usage, setUsage] = useState({ used: 0, total: 20, plan: "free" });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [transformedText, setTransformedText] = useState("");
  const [isTransforming, setIsTransforming] = useState(false);
  const [activeMode, setActiveMode] = useState("Professional");

  const modes = ["Professional", "Concise", "Friendly", "Direct"];

  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;

    // Fetch usage
    fetch("/api/usage", {
      headers: { "Authorization": `Bearer ${session.access_token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.used !== undefined) {
          setUsage(data);
        } else {
          console.error("Failed to fetch usage:", data);
        }
      })
      .catch(console.error);

    // Fetch recent history
    fetch("/api/history", {
      headers: { "Authorization": `Bearer ${session.access_token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.history) {
          setRecentActivity(data.history.slice(0, 3));
        }
      })
      .catch(console.error);
  }, [session]);

  const handleTransform = async () => {
    if (!inputText.trim()) return;

    if (!session) {
      toast.error("Your session has expired. Please log in again.");
      return;
    }

    setIsTransforming(true);
    try {
      const res = await fetch("/api/transform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ 
          text: inputText, 
          mode: activeMode.toLowerCase(),
          context: "web-studio" // Track where it came from
        })
      });

      const data = await res.json();

      if (res.status === 401) {
        toast.error("Session expired. Please sign in again.");
        return;
      }

      if (res.status === 429) {
        toast.error("Daily limit reached! Upgrade to Pro for unlimited access.");
        return;
      }

      if (res.ok) {
        setTransformedText(data.transformed);
        setUsage(prev => ({ ...prev, used: prev.used + 1 }));
        toast.success("Prompt enhanced successfully!");
      } else {
        toast.error(data.error || "Transformation failed. Please try a different prompt.");
      }
    } catch (err) {
      toast.error("Network error. Please check your connection and try again.");
      console.error(err);
    } finally {
      setIsTransforming(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transformedText);
    toast.success("Copied to clipboard!");
  };

  const usagePercentage = (usage.used / usage.total) * 100;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto pt-8"
    >
      <motion.header variants={itemVariants} className="mb-8 text-center md:text-left pt-4 md:pt-0 px-2 md:px-0">
        <h1 className="text-3xl md:text-5xl font-bold text-stone-100 tracking-tight mb-2">
          Hello, {session?.user?.email?.split('@')[0] || "Pilot"}
        </h1>
        <p className="text-sm md:text-lg text-stone-500 font-medium">Ready to take flight?</p>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12 items-start px-2 md:px-0">

        {/* Quick Transform - Main Focus */}
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-black/40 border border-stone-800/40 p-1 rounded-[2.5rem] relative group shadow-2xl">
          <div className="bg-stone-950/60 backdrop-blur-2xl rounded-[2.2rem] p-5 md:p-8 relative z-10 h-full flex flex-col border border-stone-100/5">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-6">
              <h2 className="text-[10px] font-bold text-stone-500 flex items-center gap-2 uppercase tracking-[0.3em]">
                <BrandIcon className="w-4 h-4 text-stone-600" /> Studio Console
              </h2>

              {/* Mode Selector - Premium Pill */}
              <div className="flex bg-stone-900/40 rounded-2xl p-1 border border-stone-800/50 backdrop-blur-md overflow-x-auto max-w-full scrollbar-hide">
                {modes.map(mode => (
                  <button
                    key={mode}
                    onClick={() => setActiveMode(mode)}
                    className={`text-[10px] font-black px-4 py-2 rounded-xl transition-all uppercase tracking-widest whitespace-nowrap ${activeMode === mode
                      ? "bg-stone-100 text-stone-950 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                      : "text-stone-500 hover:text-stone-300"
                      }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex-1 flex flex-col">
              <textarea
                className="w-full flex-1 bg-transparent border-none p-0 text-lg md:text-2xl text-stone-100 focus:outline-none focus:ring-0 resize-none placeholder:text-stone-800 min-h-[160px] md:min-h-[220px] font-medium leading-relaxed"
                placeholder="What's on your mind? Drop your rough thoughts here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              ></textarea>

              <div className="flex justify-between items-center mt-6 pt-6 border-t border-stone-800/20">
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Character Count</span>
                   <span className="text-xs font-bold text-stone-400 font-mono">{inputText.length}</span>
                </div>
                <button
                  onClick={handleTransform}
                  disabled={isTransforming || !inputText.trim()}
                  className="bg-stone-100 hover:bg-white disabled:opacity-30 text-stone-950 text-xs font-black py-4 px-10 rounded-2xl flex items-center gap-3 transition-all active:scale-90 shadow-xl uppercase tracking-widest"
                >
                  {isTransforming ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-stone-950" />}
                  {isTransforming ? "Processing..." : "Ignite Engine"}
                </button>
              </div>
            </div>

            {/* Result Area (Premium Reveal) */}
            <AnimatePresence>
              {transformedText && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-10 overflow-hidden"
                >
                  <div className="pt-8 border-t border-stone-800/60">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-[0.3em]">Refined Output Ready</span>
                      </div>
                      <button
                        onClick={copyToClipboard}
                        className="text-stone-400 hover:text-stone-100 transition-all flex items-center gap-2 text-[10px] font-black bg-stone-900/60 border border-stone-800 px-5 py-2.5 rounded-xl uppercase tracking-widest active:scale-95"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                    </div>
                    <div className="bg-stone-950/80 border border-stone-800/40 rounded-3xl p-6 md:p-10 text-base md:text-xl text-stone-100 whitespace-pre-wrap leading-relaxed shadow-inner font-medium ring-1 ring-stone-100/5">
                      {transformedText}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Column Group for Mobile */}
        <div className="lg:col-span-4 flex flex-col gap-6 w-full">
          {/* Usage Card */}
          <motion.div variants={itemVariants} className="bg-stone-900/20 border border-stone-800/40 p-8 rounded-[2rem] relative overflow-hidden backdrop-blur-md">
            <h2 className="text-[10px] font-black text-stone-600 mb-8 uppercase tracking-[0.3em]">Flight Capacity</h2>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-6xl md:text-7xl font-bold text-stone-100 tracking-tighter">{usage.used}</span>
              <span className="text-xl text-stone-600 font-bold tracking-tighter">/ {usage.total}</span>
            </div>

            <div className="space-y-4">
              <div className="w-full bg-black/40 rounded-full h-3 border border-stone-800/30 p-0.5">
                <div
                  className="bg-stone-100 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
              
              {usage.plan === "free" && (
                <Link to="/dashboard/billing" className="w-full flex items-center justify-center gap-3 bg-stone-100 text-stone-950 text-[10px] font-black py-4 rounded-2xl transition-all uppercase tracking-[0.2em] shadow-lg active:scale-95">
                  Unlock Unlimited <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} className="px-2 md:px-0">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-stone-100 tracking-tight">Recent Flights</h2>
          <Link to="/dashboard/history" className="text-[10px] font-black text-stone-500 hover:text-stone-100 transition-colors uppercase tracking-widest border border-stone-800 px-4 py-2 rounded-xl">Full Log</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentActivity.map((item, i) => (
            <div key={item.id || i} className="bg-stone-900/10 border border-stone-800/30 p-6 rounded-3xl hover:bg-stone-900/30 transition-all cursor-pointer group relative shadow-sm hover:shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest bg-stone-900/50 px-3 py-1 rounded-lg">{item.mode}</span>
                <span className="text-[10px] font-bold text-stone-700 font-mono">{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-stone-400 line-clamp-2 md:line-clamp-3 leading-relaxed font-medium">{item.original_text}</p>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <div className="col-span-full text-center py-20 border-2 border-dashed border-stone-800/30 rounded-[3rem]">
              <p className="text-sm font-bold text-stone-700 uppercase tracking-widest">No activity logged yet.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
