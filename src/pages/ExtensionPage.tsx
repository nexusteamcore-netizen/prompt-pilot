import { motion } from "framer-motion";
import { Download, Puzzle, CheckCircle2, ArrowLeft, Settings, Info, Chrome } from "lucide-react";
import { Link } from "react-router-dom";

export default function ExtensionPage() {
  const steps = [
    {
      icon: Download,
      title: "1. Download & Extract",
      titleAr: "١. حمل وفك الضغط",
      desc: "Download the ZIP file and extract it to a folder on your computer.",
      descAr: "حمل ملف الـ ZIP وفك الضغط عنه في مجلد على جهازك."
    },
    {
      icon: Settings,
      title: "2. Developer Mode",
      titleAr: "٢. وضع المطورين",
      desc: "Open Chrome Extensions (chrome://extensions) and enable 'Developer Mode' (top right).",
      descAr: "افتح صفحة الإضافات في كروم وفعل 'وضع المطور' من أعلى اليمين."
    },
    {
      icon: Chrome,
      title: "3. Load Extension",
      titleAr: "٣. تحميل الإضافة",
      desc: "Click 'Load unpacked' and select the extracted folder.",
      descAr: "اضغط على 'Load unpacked' واختر المجلد الذي فككت ضغطه."
    }
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 flex flex-col p-6 font-sans">
      <div className="max-w-4xl mx-auto w-full pt-10">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-300 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-stone-900/40 border border-stone-800/80 rounded-3xl p-8 md:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1">
              <div className="w-16 h-16 bg-stone-800/50 border border-stone-700/50 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Puzzle className="w-8 h-8 text-stone-100" />
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-stone-100 tracking-tight mb-4">
                Install PromptPilot
              </h1>
              <p className="text-stone-400 text-lg mb-8 leading-relaxed">
                Connect your Studio power directly into ChatGPT, Claude, and Gemini.
              </p>

              <div className="space-y-6 mb-10">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-stone-800/50 flex items-center justify-center flex-shrink-0 text-stone-300">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-100 flex items-center gap-3">
                        {step.title} <span className="text-stone-500 font-normal">| {step.titleAr}</span>
                      </h3>
                      <p className="text-sm text-stone-400 mt-1">
                        {step.desc} <br />
                        <span className="text-stone-500 italic mt-1 inline-block">{step.descAr}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="/extension/promptpilot-extension.zip"
                download="promptpilot-extension.zip"
                className="inline-flex items-center gap-3 px-8 py-4 bg-stone-100 text-stone-950 font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(245,245,244,0.1)] active:scale-95"
              >
                <Download className="w-5 h-5" />
                Download Zip File
              </a>
            </div>

            <div className="flex-1 w-full bg-stone-950/50 border border-stone-800/50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-stone-500 uppercase tracking-widest">
                <Info className="w-3 h-3" /> Important
              </div>
              <ul className="space-y-4 text-sm text-stone-300">
                <li className="flex gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>After installation, <b>Refresh</b> ChatGPT or Claude to see the Enhance button.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Make sure you are <b>Signed In</b> on this website for the extension to work.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>If you don't see the badge, click inside any text field on your AI site.</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
