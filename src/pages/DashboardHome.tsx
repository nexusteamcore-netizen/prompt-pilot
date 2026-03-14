import { useState, useEffect } from "react";
import { Rocket, Copy, RefreshCw, ArrowRight, Zap, Clock, MessageSquare, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
      <motion.header variants={itemVariants} className="mb-6 md:mb-10 text-center md:text-left">
        {/* HIDDEN SYNC ELEMENT FOR EXTENSION */}
        {session?.access_token && (
          <div id="pp-sync-bridge" data-token={session.access_token} style={{ display: 'none' }} aria-hidden="true"></div>
        )}
        <h1 className="text-2xl md:text-3xl font-semibold text-stone-100 tracking-tight mb-2">
          Welcome back, {session?.user?.email?.split('@')[0] || "Pilot"}
        </h1>
        <p className="text-sm md:text-base text-stone-400">Here's what's happening today.</p>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">

        {/* Quick Transform - Main Focus */}
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-stone-900/40 border border-stone-800/80 p-0.5 md:p-1 rounded-3xl relative group overflow-hidden">
          {/* Subtle animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-stone-800/20 via-transparent to-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          <div className="bg-stone-950/50 backdrop-blur-xl rounded-[22px] p-4 md:p-6 relative z-10 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <h2 className="text-sm font-medium text-stone-300 flex items-center gap-2 uppercase tracking-wider">
                <BrandIcon className="w-4 h-4 text-stone-400" /> Studio
              </h2>

              {/* Mode Selector */}
              <div className="flex bg-stone-900/80 rounded-lg p-1 border border-stone-800/50 overflow-x-auto max-w-full">
                {modes.map(mode => (
                  <button
                    key={mode}
                    onClick={() => setActiveMode(mode)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${activeMode === mode
                      ? "bg-stone-800 text-stone-100 shadow-sm"
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
                className="w-full flex-1 bg-transparent border-none p-0 text-lg text-stone-200 focus:outline-none focus:ring-0 resize-none placeholder:text-stone-700 min-h-[120px]"
                placeholder="Paste your rough draft, scattered thoughts, or bullet points here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              ></textarea>

              <div className="flex justify-between items-end mt-4 pt-4 border-t border-stone-800/50">
                <div className="text-xs text-stone-600 font-mono">
                  {inputText.length} chars
                </div>
                <button
                  onClick={handleTransform}
                  disabled={isTransforming || !inputText.trim()}
                  className="bg-stone-100 hover:bg-white disabled:opacity-50 disabled:hover:bg-stone-100 text-stone-950 text-sm font-semibold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(245,245,244,0.1)] hover:shadow-[0_0_25px_rgba(245,245,244,0.2)]"
                >
                  {isTransforming ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BrandIcon className="w-4 h-4" />}
                  {isTransforming ? "Enhancing..." : "Enhance"}
                </button>
              </div>
            </div>

            {/* Result Area (Premium Reveal) */}
            {transformedText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 pt-8 border-t border-stone-800/80"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em]">Crafted Result</span>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="text-stone-400 hover:text-stone-100 transition-all flex items-center gap-2 text-xs font-semibold bg-stone-900/80 border border-stone-800 px-4 py-2 rounded-xl hover:bg-stone-800 hover:border-stone-700 active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Text
                  </button>
                </div>
                <div className="bg-stone-950/40 border border-stone-800/50 rounded-2xl p-6 text-sm md:text-base text-stone-200 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {transformedText}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Side Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Usage Card */}
          <motion.div variants={itemVariants} className="bg-stone-900/40 border border-stone-800/80 p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <Zap className="w-24 h-24 text-stone-100" />
            </div>
            <h2 className="text-sm font-medium text-stone-400 mb-6 uppercase tracking-wider relative z-10">Usage Quota</h2>

            <div className="flex items-baseline gap-2 mb-4 relative z-10">
              <span className="text-5xl font-semibold text-stone-100 tracking-tighter">{usage.used}</span>
              <span className="text-lg text-stone-500 font-medium">/ {usage.total}</span>
            </div>

            <div className="relative z-10">
              <div className="flex justify-between text-xs text-stone-500 mb-2 font-medium">
                <span>Monthly Limit</span>
              </div>
              <div className="w-full bg-stone-950 rounded-full h-3 mb-6 overflow-hidden border border-stone-800/50 p-0.5" title={`${Math.round(usagePercentage)}% used`}>
                <div
                  className="bg-stone-300 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{ width: `${usagePercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>

            {usage.plan === "free" && (
              <Link to="/dashboard/billing" className="relative z-10 w-full flex items-center justify-center gap-2 bg-stone-800/50 hover:bg-stone-800 text-stone-200 text-sm font-medium py-2.5 rounded-xl transition-colors border border-stone-700/50">
                Upgrade to Pro <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </motion.div>

          {/* Mini Stats */}
          <motion.div variants={itemVariants} className="bg-stone-900/40 border border-stone-800/80 p-6 rounded-3xl flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-800/50 border border-stone-700/50 flex items-center justify-center">
                <BrandIcon className="w-5 h-5 text-stone-300" />
              </div>
              <div>
                <div className="text-sm text-stone-400 font-medium mb-1">Prompts Enhanced</div>
                <div className="text-2xl font-semibold text-stone-100 tracking-tight">{usage.used}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-stone-100 tracking-tight">Recent Activity</h2>
          <Link to="/dashboard/history" className="text-sm text-stone-400 hover:text-stone-200 transition-colors">View all</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentActivity.map((item, i) => (
            <div key={item.id || i} className="bg-stone-900/20 border border-stone-800/60 p-5 rounded-2xl hover:bg-stone-900/40 transition-all hover:-translate-y-1 cursor-pointer group relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-stone-500 group-hover:text-stone-300 transition-colors" />
                  <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">{item.mode}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(item.original_text);
                    toast.success("Copied to clipboard!");
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-stone-800 rounded-md text-stone-400 hover:text-stone-200"
                  title="Copy Original Text"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm text-stone-300 line-clamp-2 mb-4 leading-relaxed">{item.original_text}</p>
              <div className="text-xs text-stone-600 font-mono">
                {new Date(item.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <div className="col-span-3 text-center py-8 text-stone-500 text-sm">
              No recent activity found. Enhance a prompt to see it here.
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
