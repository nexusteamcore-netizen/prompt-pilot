import { motion } from "framer-motion";
import { Download, Puzzle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function ExtensionPage() {
  const steps = [
    {
      title: "1. Download ZIP",
      desc: "Download the extension package to your computer."
    },
    {
      title: "2. Extract",
      desc: "Unzip the downloaded file to a folder."
    },
    {
      title: "3. Developer Mode",
      desc: "Go to chrome://extensions and enable Developer Mode."
    },
    {
      title: "4. Load Unpacked",
      desc: "Click 'Load unpacked' and select the extension folder."
    }
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 flex flex-col p-6">
      <div className="max-w-3xl mx-auto w-full pt-12">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-300 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-stone-900/40 border border-stone-800/80 rounded-3xl p-8 md:p-12"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-stone-800 rounded-2xl flex items-center justify-center">
              <Puzzle className="w-6 h-6 text-stone-100" />
            </div>
            <h1 className="text-3xl font-bold text-stone-100 italic tracking-tight">
              PromptPilot Extension
            </h1>
          </div>

          <div className="space-y-8 mb-12">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="text-stone-500 font-mono text-sm mt-1">{i + 1}</div>
                <div>
                  <h3 className="font-semibold text-stone-100 mb-1">{step.title}</h3>
                  <p className="text-stone-400 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <a 
            href="/extension/promptpilot-extension.zip"
            download
            className="w-full flex items-center justify-center gap-2 bg-stone-100 hover:bg-white text-stone-950 font-bold py-4 rounded-2xl transition-all active:scale-95"
          >
            <Download className="w-5 h-5" /> Download Zip File
          </a>
        </motion.div>
      </div>
    </div>
  );
}
