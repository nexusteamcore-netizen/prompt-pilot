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
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState<string>("All");
  const [isExporting, setIsExporting] = useState(false);

  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;

    fetch("/api/history", {
      headers: { "Authorization": `Bearer ${session.access_token}` }
    })
      .then(async res => {
        if (res.status === 401) {
          toast.error("Session expired. Please sign in again.");
          return { history: [] };
        }
        return res.json();
      })
      .then(data => {
        if (data && data.history) {
          setHistory(data.history);
          setFilteredHistory(data.history);
        } else {
          setHistory([]);
          setFilteredHistory([]);
        }
      })
      .catch(err => {
        console.error("Fetch history error:", err);
        toast.error("Failed to load history items.");
      });
  }, [session]);

  // Handle Search and Filter
  useEffect(() => {
    let result = [...history];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.original_text.toLowerCase().includes(query) ||
        item.transformed_text.toLowerCase().includes(query)
      );
    }

    if (selectedMode !== "All") {
      result = result.filter(item => item.mode.toLowerCase() === selectedMode.toLowerCase());
    }

    setFilteredHistory(result);
  }, [searchQuery, selectedMode, history]);

  const exportToCSV = () => {
    if (history.length === 0) {
      toast.error("No data to export");
      return;
    }

    setIsExporting(true);
    try {
      const headers = ["Date", "Mode", "Original Context", "Original Text", "Transformed Text"];
      const rows = history.map(item => [
        new Date(item.created_at).toLocaleString(),
        item.mode,
        item.context || "N/A",
        `"${item.original_text.replace(/"/g, '""')}"`,
        `"${item.transformed_text.replace(/"/g, '""')}"`
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `promptpilot_history_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("History exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const deleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Optimistic UI update
    setHistory(prev => prev.filter(item => item.id !== id));
    setFilteredHistory(prev => prev.filter(item => item.id !== id));
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
        <button 
          onClick={exportToCSV}
          disabled={isExporting || history.length === 0}
          className="flex items-center gap-2 text-sm font-medium text-stone-300 bg-stone-900/50 border border-stone-800 hover:bg-stone-800 hover:text-stone-100 px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isExporting ? "Exporting..." : "Export CSV"}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-900/50 border border-stone-800/80 rounded-xl pl-11 pr-4 py-3 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-700 focus:border-transparent transition-all placeholder:text-stone-600 shadow-inner"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="bg-stone-900/50 border border-stone-800/80 text-stone-300 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-700 transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Modes</option>
              <option value="Professional">Professional</option>
              <option value="Creative">Creative</option>
              <option value="Technical">Technical</option>
              <option value="Concise">Concise</option>
            </select>
          </div>
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
              {filteredHistory.map((item, idx) => (
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
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-stone-500">
                      <BrandIcon className="w-8 h-8 mb-3 text-stone-700" />
                      <p>{searchQuery || selectedMode !== "All" ? "No results found for your search." : "No history found."}</p>
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
