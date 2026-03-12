import React, { useState, useEffect } from "react";
import { Search, Filter, Download, Trash2, Copy, Clock, Rocket, Eye, EyeOff, RefreshCw } from "lucide-react";
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

      <motion.div variants={itemVariants} className="bg-stone-900/40 border border-stone-800/80 rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl">
        {/* Filters */}
        <div className="p-4 md:p-8 border-b border-stone-800/50 flex flex-col md:flex-row gap-4 bg-stone-950/30">
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-stone-300 transition-colors" />
            <input
              type="text"
              placeholder="Search your prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-900/40 border border-stone-800 rounded-2xl pl-11 pr-4 py-4 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-700 transition-all placeholder:text-stone-800"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="bg-stone-900/40 border border-stone-800 text-stone-300 text-xs font-bold uppercase tracking-widest rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-stone-700 transition-all appearance-none cursor-pointer flex-1 md:flex-none"
            >
              <option value="All">All Modes</option>
              {["Professional", "Creative", "Technical", "Concise"].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Table View (Hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-950/50 text-stone-600 font-bold uppercase tracking-[0.2em] text-[10px] border-b border-stone-800/30">
              <tr>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Summary</th>
                <th className="px-8 py-5">Mode</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/20">
              {filteredHistory.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-stone-800/20 transition-colors group cursor-pointer"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <td className="px-8 py-6 text-stone-500 font-mono text-xs">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-stone-300 max-w-md">
                      <div className="truncate font-medium">{item.original_text}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                        {item.mode}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); copyToClipboard(item.transformed_text); }} className="p-2 text-stone-500 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-all"><Copy className="w-4 h-4" /></button>
                        <button onClick={(e) => deleteHistoryItem(item.id, e)} className="p-2 text-stone-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                  <AnimatePresence>
                    {expandedId === item.id && (
                      <tr>
                        <td colSpan={4} className="p-0">
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-stone-950/40">
                             <div className="p-8 border-b border-stone-800/30">
                                <div className="text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] mb-4">Refined Flight Plan</div>
                                <div className="bg-stone-950 border border-stone-800/50 p-6 rounded-[1.5rem] text-stone-100 font-medium leading-relaxed font-sans text-base shadow-inner">
                                  {item.transformed_text}
                                </div>
                             </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View (Shown only on mobile) */}
        <div className="md:hidden divide-y divide-stone-800/30">
          {filteredHistory.map((item) => (
            <div key={item.id} className="p-5 active:bg-stone-900 transition-colors" onClick={() => toggleExpand(item.id)}>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black text-stone-700 font-mono tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                <span className="text-[10px] font-black text-stone-500 bg-stone-900 border border-stone-800 px-3 py-1 rounded-full uppercase tracking-widest">{item.mode}</span>
              </div>
              <p className="text-sm font-bold text-stone-300 line-clamp-2 mb-4 leading-relaxed">{item.original_text}</p>
              
              <AnimatePresence>
                {expandedId === item.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="bg-black/40 p-5 rounded-2xl border border-stone-800/50 mb-4 shadow-inner">
                       <p className="text-sm text-stone-100 font-medium leading-relaxed mb-4">{item.transformed_text}</p>
                       <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); copyToClipboard(item.transformed_text); }} className="flex-1 py-3 bg-stone-100 text-stone-950 text-[10px] font-black rounded-xl uppercase tracking-widest">Copy Result</button>
                          <button onClick={(e) => deleteHistoryItem(item.id, e)} className="p-3 bg-red-500/10 text-red-500 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!expandedId && (
                <div className="flex items-center gap-2 text-[10px] font-black text-stone-600 uppercase tracking-widest">
                   <Eye className="w-3 h-3" /> Tap to view details
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredHistory.length === 0 && (
          <div className="p-20 text-center">
            <BrandIcon className="w-10 h-10 mx-auto mb-4 text-stone-800" />
            <p className="text-stone-600 font-bold uppercase tracking-widest text-[10px]">No flight records found</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
