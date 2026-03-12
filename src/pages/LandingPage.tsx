import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Rocket, Zap, Target, Globe, Shield, History, SlidersHorizontal, Check, ArrowRight, PlayCircle, Bot, Brain, Cpu, Aperture, Code, PenTool, LineChart } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { BrandIcon } from "../components/BrandIcon";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  // ... rest of variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen text-zinc-400 overflow-x-hidden selection:bg-zinc-800 selection:text-white">
      {/* Background Spline */}
      {/* ... iframe code ... */}
      <div className="fixed top-0 w-full h-screen -z-10" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)' }}>
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
          <iframe src="https://my.spline.design/glowingplanetparticles-HmCVKutonlFn3Oqqe6DI9nWi/" frameBorder="0" width="100%" height="100%"></iframe>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-stone-800/50 bg-stone-950/80 backdrop-blur-md">
        <div className="flex h-16 max-w-6xl mx-auto px-6 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-stone-100 tracking-tight">
            <BrandIcon className="w-5 h-5 text-stone-400" />
            PromptPilot
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-stone-100 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-stone-100 transition-colors">How It Works</a>
            <a href="#use-cases" className="hover:text-stone-100 transition-colors">Use Cases</a>
            <a href="#pricing" className="hover:text-stone-100 transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block text-sm font-medium hover:text-stone-100 transition-colors">
              Sign In
            </Link>
            <button
              onClick={() => {
                sessionStorage.setItem('redirectToExtension', 'true');
                navigate('/login');
              }}
              className="hidden md:flex items-center gap-2 hover:bg-stone-200 transition-colors text-xs font-medium text-stone-950 bg-stone-100 rounded-lg py-2 px-4 shadow-sm active:scale-95"
            >
              Add to Chrome — Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-stone-400 hover:text-stone-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-stone-800/50 bg-stone-950/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="flex flex-col p-6 space-y-4">
                <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-stone-400 hover:text-stone-100 font-medium transition-colors">Features</a>
                <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-stone-400 hover:text-stone-100 font-medium transition-colors">How It Works</a>
                <a href="#use-cases" onClick={() => setIsMenuOpen(false)} className="text-stone-400 hover:text-stone-100 font-medium transition-colors">Use Cases</a>
                <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-stone-400 hover:text-stone-100 font-medium transition-colors">Pricing</a>
                <hr className="border-stone-800/50 my-2" />
                <Link to="/login" className="text-stone-400 hover:text-stone-100 font-medium transition-colors">Sign In</Link>
                <button
                  onClick={() => {
                    sessionStorage.setItem('redirectToExtension', 'true');
                    navigate('/login');
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-stone-100 text-stone-950 font-bold py-3 rounded-xl shadow-sm active:scale-95"
                >
                  Add to Chrome — Free
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="pt-32 pb-20 relative">
        {/* Background Decor */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-grid h-[800px]"></div>

        {/* Hero Section */}
        <section className="z-10 text-center max-w-4xl mx-auto mb-32 px-6 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900/50 border border-stone-800/50 text-xs font-medium text-stone-300 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            PromptPilot 2.0 is now live
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:text-6xl text-4xl font-semibold text-stone-100 tracking-tighter mb-6 leading-[1.1]"
          >
            Write better prompts.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-100 to-stone-500">
              Without writing them.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-stone-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Stop struggling with how to ask AI. PromptPilot reads your intent and builds a perfect prompt — right inside ChatGPT, Claude, and every AI tool you use.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => {
                sessionStorage.setItem('redirectToExtension', 'true');
                navigate('/login');
              }}
              className="w-full sm:w-auto px-8 py-3 bg-stone-100 text-stone-950 font-medium rounded-lg hover:bg-stone-200 transition-colors flex items-center justify-center gap-2 active:scale-95"
            >
              Add to Chrome — It's Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <a href="#demo" className="w-full sm:w-auto px-8 py-3 bg-stone-900 text-stone-300 font-medium rounded-lg border border-stone-800 hover:bg-stone-800 hover:text-stone-100 transition-colors flex items-center justify-center gap-2 group">
              <PlayCircle className="w-4 h-4 group-hover:text-stone-100 transition-colors" />
              Watch Demo
            </a>
          </motion.div>
        </section>

        {/* Supported Platforms */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto px-6 mb-32"
        >
          <p className="text-center text-xs font-semibold text-stone-500 mb-8 uppercase tracking-[0.2em]">
            Engineered for the world's most advanced AI
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60">
            {[
              {
                name: "ChatGPT",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity">
                    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.032.067L9.74 19.96a4.5 4.5 0 0 1-6.14-1.656zm-1.17-10.51A4.471 4.471 0 0 1 4.78 5.864l-.017.142v5.519a.784.784 0 0 0 .388.682l5.843 3.367-2.02 1.168a.076.076 0 0 1-.071 0L4.05 13.6a4.501 4.501 0 0 1-1.62-6.106zm16.615 3.826-5.843-3.369 2.02-1.168a.075.075 0 0 1 .071 0l4.853 2.805a4.5 4.5 0 0 1-.696 8.112v-5.517a.79.79 0 0 0-.405-.863zm2.011-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.52 9.098V6.766a.07.07 0 0 1 .028-.067l4.853-2.798a4.5 4.5 0 0 1 6.63 4.666zm-12.65 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.988a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.802 6.375a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
                  </svg>
                )
              },
              {
                name: "Claude",
                icon: <img src="https://cdn.simpleicons.org/anthropic/ffffff" alt="Claude" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
              },
              {
                name: "Gemini",
                icon: <img src="https://cdn.simpleicons.org/googlegemini/ffffff" alt="Gemini" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
              },
              {
                name: "Lovable",
                icon: <img src="https://lovable.dev/favicon.ico" alt="Lovable" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity brightness-0 invert" referrerPolicy="no-referrer" />
              },
              {
                name: "Perplexity",
                icon: <img src="https://cdn.simpleicons.org/perplexity/ffffff" alt="Perplexity" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
              }
            ].map((Platform, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, opacity: 1 }}
                className="flex items-center gap-2.5 font-medium text-stone-400 cursor-pointer transition-opacity hover:text-stone-200 group"
              >
                {Platform.icon}
                {Platform.name}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How It Works */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 mb-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-semibold text-stone-100 tracking-tight mb-4">
              Seamless integration. Zero friction.
            </motion.h2>
            <motion.p variants={itemVariants} className="text-stone-400 max-w-2xl mx-auto">
              PromptPilot works where you work. No need to switch tabs or copy-paste.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { step: "01", title: "Type naturally", desc: "Write whatever's in your head directly into your favorite AI tool's input box." },
              { step: "02", title: "Click the ✦ button", desc: "The PromptPilot icon automatically appears near any AI input field." },
              { step: "03", title: "Get a perfect prompt", desc: "Your thought is instantly transformed into an optimized prompt, ready to send." }
            ].map((s, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -5, borderColor: "rgba(168, 162, 158, 0.4)" }}
                className="bg-stone-900/40 border border-stone-800/50 p-8 rounded-xl relative overflow-hidden transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-stone-800/50 flex items-center justify-center mb-6 border border-stone-700/50 text-stone-300 font-semibold relative z-10">
                  {i + 1}
                </div>
                <h3 className="text-xl font-semibold text-stone-100 mb-3 relative z-10">{s.title}</h3>
                <p className="text-stone-400 relative z-10 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Use Cases Section (New) */}
        <section id="use-cases" className="max-w-6xl mx-auto px-6 mb-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-semibold text-stone-100 tracking-tight mb-4">
              Built for every workflow
            </motion.h2>
            <motion.p variants={itemVariants} className="text-stone-400 max-w-2xl mx-auto">
              Whether you're writing code, crafting copy, or analyzing data, we've got a mode for you.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { icon: Code, title: "Developers", desc: "Generate precise code structure, debug complex issues, and write comprehensive documentation with technical prompts." },
              { icon: PenTool, title: "Creators", desc: "Craft engaging copy, brainstorm creative ideas, and maintain consistent brand voice across all your content." },
              { icon: LineChart, title: "Analysts", desc: "Extract insights from raw data, format complex reports, and generate clear summaries with analytical precision." }
            ].map((uc, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="group p-8 rounded-2xl bg-gradient-to-b from-stone-900/40 to-transparent border border-stone-800/50 hover:border-stone-700/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-stone-800/50 flex items-center justify-center mb-6 border border-stone-700/50 group-hover:scale-110 transition-transform duration-300">
                  <uc.icon className="w-6 h-6 text-stone-300" />
                </div>
                <h3 className="text-xl font-semibold text-stone-100 mb-3">{uc.title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">{uc.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-6xl mx-auto px-6 mb-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-semibold text-stone-100 tracking-tight mb-4">
              Everything you need to master AI
            </motion.h2>
            <motion.p variants={itemVariants} className="text-stone-400 max-w-2xl mx-auto">
              Powerful features designed to make you 10x more productive with AI.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { icon: Zap, title: "Instant Transform", desc: "Lightning fast prompt generation powered by advanced models." },
              { icon: Target, title: "Context-Aware", desc: "Automatically detects if you're coding, writing, or analyzing data." },
              { icon: Globe, title: "Works Everywhere", desc: "Seamlessly integrates with ChatGPT, Claude, Gemini, and more." },
              { icon: Shield, title: "Privacy First", desc: "Your data stays yours. Prompts are never stored or used for training." },
              { icon: History, title: "Prompt History", desc: "Easily access, review, and reuse your best prompt transformations." },
              { icon: SlidersHorizontal, title: "Tone Control", desc: "Fine-tune outputs with Professional, Creative, or Technical modes." }
            ].map((f, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -5, backgroundColor: "rgba(28, 25, 23, 0.4)" }}
                className="bg-stone-900/20 border border-stone-800/50 p-8 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-stone-800/50 flex items-center justify-center mb-6 border border-stone-700/50">
                  <f.icon className="w-5 h-5 text-stone-300" />
                </div>
                <h3 className="text-lg font-semibold text-stone-100 mb-3">{f.title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="max-w-5xl mx-auto px-6 mb-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-semibold text-stone-100 tracking-tight mb-4">Simple, transparent pricing</motion.h2>
            <motion.p variants={itemVariants} className="text-stone-400 max-w-2xl mx-auto">
              Start for free, upgrade when you need more power.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8 items-center"
          >
            {/* Free */}
            <motion.div variants={itemVariants} whileHover={{ y: -8 }} className="bg-stone-900/20 border border-stone-800/50 p-8 rounded-2xl transition-shadow hover:shadow-2xl hover:shadow-stone-900/50">
              <h3 className="text-xl font-semibold text-stone-100 mb-2">Free</h3>
              <div className="text-4xl font-bold text-stone-100 mb-6">$0<span className="text-lg text-stone-500 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 text-sm text-stone-300">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-stone-500" /> 20 transforms/day</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-stone-500" /> Basic modes</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-stone-500" /> Works on 3 AI tools</li>
              </ul>
              <Link to="/login" className="block w-full py-3 text-center rounded-lg bg-stone-900 border border-stone-800 text-stone-300 font-medium hover:bg-stone-800 hover:text-stone-100 transition-colors">
                Get Started
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div variants={itemVariants} whileHover={{ y: -8 }} className="bg-stone-900/40 border border-stone-700/50 p-8 rounded-2xl relative transition-shadow hover:shadow-2xl hover:shadow-stone-900/50">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-100 text-stone-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-stone-100 mb-2">Pro</h3>
              <div className="text-4xl font-bold text-stone-100 mb-6">$9<span className="text-lg text-stone-500 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 text-sm text-stone-300">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-stone-100" /> Unlimited transforms</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-stone-100" /> All 6 tone modes</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-stone-100" /> Works on ALL tools</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-stone-100" /> Prompt history (90 days)</li>
              </ul>
              <Link to="/login" className="block w-full py-3 text-center rounded-lg bg-stone-100 text-stone-950 font-medium hover:bg-stone-200 transition-colors">
                Upgrade to Pro
              </Link>
            </motion.div>

            {/* Team */}
            <motion.div variants={itemVariants} whileHover={{ y: -8 }} className="bg-stone-900/20 border border-stone-800/50 p-8 rounded-2xl transition-shadow hover:shadow-2xl hover:shadow-stone-900/50">
              <h3 className="text-xl font-semibold text-stone-100 mb-2">Team</h3>
              <div className="text-4xl font-bold text-stone-100 mb-6">$29<span className="text-lg text-stone-500 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 text-sm text-stone-300">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-stone-500" /> 5 seats included</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-stone-500" /> Team prompt library</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-stone-500" /> Priority support</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-stone-500" /> Analytics dashboard</li>
              </ul>
              <Link to="/login" className="block w-full py-3 text-center rounded-lg bg-stone-900 border border-stone-800 text-stone-300 font-medium hover:bg-stone-800 hover:text-stone-100 transition-colors">
                Contact Sales
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-stone-800/50 py-12 mt-20 bg-stone-950/50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-stone-100 font-semibold">
            <BrandIcon className="w-5 h-5 text-stone-400" /> PromptPilot
          </div>
          <div className="flex gap-6 text-sm text-stone-500">
            <a href="#" className="hover:text-stone-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-stone-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-stone-300 transition-colors">Contact</a>
          </div>
          <div className="text-sm text-stone-500">
            © 2026 PromptPilot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
