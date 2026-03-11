import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Rocket, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { BrandIcon } from "../components/BrandIcon";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (sessionStorage.getItem('redirectToExtension') === 'true') {
        sessionStorage.removeItem('redirectToExtension');
        navigate("/dashboard/extension");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setNeedsEmailConfirmation(true);
          toast.success("Registration successful! Please check your email.");
        } else {
          toast.success("Registration successful!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Signed in successfully!");
      }
    } catch (error: any) {
      if (error.message === "Invalid login credentials") {
        toast.error("Invalid email or password. If you don't have an account, please sign up first.");
      } else {
        toast.error(error.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-sans relative overflow-hidden text-zinc-400">
      {/* Background Spline */}
      <div className="fixed top-0 left-0 w-full h-screen -z-10" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)' }}>
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
          <iframe src="https://my.spline.design/glowingplanetparticles-HmCVKutonlFn3Oqqe6DI9nWi/" frameBorder="0" width="100%" height="100%"></iframe>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-grid h-full opacity-30"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-900 border border-stone-800 shadow-xl mb-6 hover:scale-105 transition-transform group focus:outline-none focus:ring-2 focus:ring-stone-700">
            <BrandIcon className="w-8 h-8 text-stone-100 group-hover:text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-stone-100 tracking-tight mb-3">
            Welcome to PromptPilot
          </h1>
          <p className="text-stone-400">
            {isSignUp ? "Create an account to access your studio." : "Sign in to access your studio and enhance your prompts."}
          </p>
        </div>

        <div className="bg-stone-900/40 border border-stone-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          {needsEmailConfirmation ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-stone-100 font-medium mb-2">Check your email</h3>
              <p className="text-sm text-stone-400 mb-6">
                We sent a confirmation link to <strong className="text-stone-300">{email}</strong>
              </p>

              <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs text-stone-400 mb-2 font-medium">
                  <span className="text-amber-500">⚠️ Didn't receive the email?</span>
                </p>
                <ul className="text-xs text-stone-500 space-y-1 list-disc pl-4">
                  <li>Check your spam folder.</li>
                  <li>If you are the developer, you can disable email confirmation in your <strong>Supabase Dashboard</strong> (Authentication &gt; Providers &gt; Email &gt; Confirm email: OFF) for easier testing.</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setNeedsEmailConfirmation(false);
                  setIsSignUp(false);
                }}
                className="text-sm text-stone-400 hover:text-stone-200 transition-colors"
              >
                Back to sign in
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-400 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-stone-900/50 border border-stone-800 rounded-xl pl-11 pr-4 py-3 text-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-700 focus:border-transparent transition-all placeholder:text-stone-600"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-stone-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-stone-900/50 border border-stone-800 rounded-xl pl-11 pr-4 py-3 text-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-700 focus:border-transparent transition-all placeholder:text-stone-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-stone-800 hover:bg-stone-700 disabled:opacity-50 disabled:hover:bg-stone-800 text-stone-100 font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 mt-6"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-stone-400 border-t-stone-100 rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In"} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {!needsEmailConfirmation && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-stone-400 hover:text-stone-200 transition-colors"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-stone-500 mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
