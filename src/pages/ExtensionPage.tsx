import { motion } from "framer-motion";
import { Download, Puzzle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function ExtensionPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 flex flex-col items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-stone-900/40 border border-stone-800/80 rounded-3xl p-8 md:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden text-center"
      >


        <div className="w-20 h-20 bg-stone-800/50 border border-stone-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg">
          <Puzzle className="w-10 h-10 text-stone-100" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-stone-100 tracking-tight mb-4 relative z-10">
          PromptPilot for Chrome
        </h1>

        <p className="text-stone-400 text-lg mb-10 max-w-lg mx-auto relative z-10">
          Enhance your prompts anywhere on the web. Works seamlessly with ChatGPT, Claude, Gemini, and more.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 mb-12">
          <a
            href="/promptpilot-extension.zip"
            download="promptpilot-extension.zip"
            className="w-full sm:w-auto px-8 py-4 bg-stone-100 text-stone-950 font-bold rounded-xl hover:bg-white transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,245,244,0.1)] hover:shadow-[0_0_25px_rgba(245,245,244,0.2)] active:scale-95 cursor-pointer"
          >
            <Download className="w-5 h-5" />
            Download ZIP for Chrome
          </a>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 text-left relative z-10 border-t border-stone-800/50 pt-8 mt-8">
          <div>
            <div className="flex items-center gap-2 mb-2 text-stone-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Works Everywhere
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">Instantly transform text in any input field across the web.</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-stone-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1-Click Magic
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">Use keyboard shortcuts or the floating button to enhance prompts.</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-stone-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Privacy First
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">We don't store your browsing data. Only the text you choose to enhance.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
