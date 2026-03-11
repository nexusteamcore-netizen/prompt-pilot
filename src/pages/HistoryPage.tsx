import React, { useState, useEffect } from "react";
import { Search, Filter, Download, Trash2, Copy, Clock, Rocket, Eye, EyeOff } from "lucide-react";
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

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;

    fetch("/api/history", {
      headers: { "Authorization": `Bearer ${session.access_token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.history) {
          setHistory(data.history);
        } else {
          console.error("Failed to fetch history:", data);
          setHistory([]);
        }
      })
      .catch(console.error);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const deleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Optimistic UI update
    setHistory(prev => prev.filter(item => item.id !== id));
    toast.success("Item deleted");

    try {
      const res = await fetch(`/api/history/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      if (!res.ok) {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete item");
      // Could revert optimistic update here if needed
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto pt-8"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-semibold text-stone-100 tracking-tight mb-2">Prompt History</h1>
          <p className="text-stone-400">Review and reuse your previously enhanced prompts.</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium text-stone-300 bg-stone-900/50 border border-stone-800 hover:bg-stone-800 hover:text-stone-100 px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-stone-900/40 border border-stone-800/80 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
        {/* Filters */}
        <div className="p-6 border-b border-stone-800/50 flex flex-col sm:flex-row gap-4 bg-stone-950/30">
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-stone-300 transition-colors" />
            <input
              type="text"
              placeholder="Search your prompts..."
              className="w-full bg-stone-900/50 border border-stone-800/80 rounded-xl pl-11 pr-4 py-3 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-700 focus:border-transparent transition-all placeholder:text-stone-600 shadow-inner"
            />
          </div>
          <button className="flex items-center justify-center gap-2 text-sm font-medium text-stone-300 bg-stone-900/50 border border-stone-800/80 hover:bg-stone-800 hover:text-stone-100 px-6 py-3 rounded-xl transition-all shadow-sm active:scale-95">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-950/50 text-stone-500 font-medium uppercase tracking-wider text-xs border-b border-stone-800/50">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Original Text</th>
                <th className="px-6 py-4">Mode</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/30">
              {history.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-stone-800/30 transition-colors group cursor-pointer"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <td className="px-6 py-5 text-stone-400 whitespace-nowrap font-mono text-xs flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-stone-600" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-stone-300 max-w-md">
                      <div className="truncate pr-8">{item.original_text}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-800/50 border border-stone-700/50 text-stone-300 text-xs font-medium capitalize">
                        <BrandIcon className="w-3 h-3 text-stone-500" />
                        {item.mode}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(item.id);
                          }}
                          className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
                          title={expandedId === item.id ? "Hide Prompt" : "View Prompt"}
                        >
                          {expandedId === item.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(item.transformed_text);
                          }}
                          className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
                          title="Copy Transformed Prompt"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => deleteHistoryItem(item.id, e)}
                          className="p-2 text-stone-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                  {expandedId === item.id && (
                    <tr className="bg-stone-900/60 border-b border-stone-800/30">
                      <td colSpan={4} className="px-6 py-4">
                        <div className="p-4 bg-stone-950/50 rounded-xl border border-stone-800/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Transformed Prompt</span>
                            <button
                              onClick={() => copyToClipboard(item.transformed_text)}
                              className="flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" /> Copy
                            </button>
                          </div>
                          <p className="text-sm text-stone-300 whitespace-pre-wrap font-mono leading-relaxed">
                            {item.transformed_text}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-stone-500">
                      <BrandIcon className="w-8 h-8 mb-3 text-stone-700" />
                      <p>No history found.</p>
                      <p className="text-xs mt-1 text-stone-600">Your enhanced prompts will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
