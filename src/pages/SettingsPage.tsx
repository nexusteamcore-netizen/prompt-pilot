import { useState, useEffect } from "react";
import { Save, Check, Settings as SettingsIcon, Shield, Key, Keyboard, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
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

export default function SettingsPage() {
  const { user, signOut } = useAuth();

  const [mode, setMode] = useState(localStorage.getItem("pp_mode") || "professional");
  const [autoTransform, setAutoTransform] = useState(localStorage.getItem("pp_auto_transform") === "true");
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // States for Modals
  const [modalType, setModalType] = useState<"email" | "password" | "delete" | null>(null);
  const [inputValue, setInputValue] = useState("");

  const closeModal = () => {
    setModalType(null);
    setInputValue("");
  };

  const handleSave = () => {
    localStorage.setItem("pp_mode", mode);
    localStorage.setItem("pp_auto_transform", String(autoTransform));

    // Sync with extension
    window.postMessage({ type: "PP_SETTINGS", mode, autoTransform }, window.location.origin);

    setSaved(true);
    toast.success("Preferences saved successfully!");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUpdateEmail = async () => {
    if (!inputValue || !inputValue.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoadingAction("email");
    const { error } = await supabase.auth.updateUser({ email: inputValue });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Verification links sent to old and new emails.");
    }
    setLoadingAction(null);
    closeModal();
  };

  const handleUpdatePassword = async () => {
    if (!inputValue || inputValue.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoadingAction("password");
    const { error } = await supabase.auth.updateUser({ password: inputValue });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
    }
    setLoadingAction(null);
    closeModal();
  };

  const handleDeleteAccount = async () => {
    if (inputValue !== "DELETE") {
      toast.error("Please type DELETE to confirm.");
      return;
    }
    closeModal();
    toast.info("Account deletion request received. You will be logged out.");
    setTimeout(() => {
      signOut();
    }, 2000);
  };

  const confirmAction = () => {
    if (modalType === "email") handleUpdateEmail();
    if (modalType === "password") handleUpdatePassword();
    if (modalType === "delete") handleDeleteAccount();
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto pt-8"
    >
      <motion.div variants={itemVariants} className="mb-10">
        <h1 className="text-3xl font-semibold text-stone-100 tracking-tight mb-2">Settings</h1>
        <p className="text-stone-400">Manage your preferences, account security, and extension behavior.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar Nav */}
        <motion.div variants={itemVariants} className="md:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === "general" ? "bg-stone-900/80 text-stone-100 border border-stone-800/50 shadow-sm" : "text-stone-400 hover:text-stone-200 hover:bg-stone-900/40"}`}
          >
            <SettingsIcon className={`w-4 h-4 ${activeTab === "general" ? "text-stone-400" : ""}`} />
            General
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === "security" ? "bg-stone-900/80 text-stone-100 border border-stone-800/50 shadow-sm" : "text-stone-400 hover:text-stone-200 hover:bg-stone-900/40"}`}
          >
            <Shield className={`w-4 h-4 ${activeTab === "security" ? "text-stone-400" : ""}`} />
            Security
          </button>
        </motion.div>

        {/* Main Settings Area */}
        <div className="md:col-span-9 space-y-8 relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === "general" && (
              <motion.div
                key="general"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-stone-900/40 border border-stone-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden absolute w-full"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <SettingsIcon className="w-32 h-32 text-stone-100" />
                </div>

                <h2 className="text-lg font-medium text-stone-100 mb-8 flex items-center gap-2">
                  <Key className="w-5 h-5 text-stone-400" /> Extension Preferences
                </h2>

                <div className="space-y-8 relative z-10">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-3 uppercase tracking-wider">Default Tone Mode</label>
                    <div className="relative">
                      <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="w-full bg-stone-950/50 border border-stone-800/80 rounded-xl p-4 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-700 focus:border-transparent transition-all appearance-none shadow-inner cursor-pointer hover:border-stone-700"
                      >
                        <option value="professional">Professional - Formal, business-appropriate</option>
                        <option value="creative">Creative - Imaginative, open-ended</option>
                        <option value="technical">Technical - Precise, specs, formats</option>
                        <option value="academic">Academic - Scholarly tone, citations</option>
                        <option value="simple">Simple - Plain English, direct ask</option>
                        <option value="detailed">Detailed - Comprehensive, multi-part</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-stone-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    <p className="text-xs text-stone-500 mt-2">This tone will be selected by default when you open the extension.</p>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-stone-950/30 border border-stone-800/50 rounded-2xl cursor-pointer hover:bg-stone-900/30 transition-colors" onClick={() => setAutoTransform(!autoTransform)}>
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0">
                        <Keyboard className="w-5 h-5 text-stone-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-200 mb-1 cursor-pointer">Auto-transform on shortcut</label>
                        <p className="text-xs text-stone-500 leading-relaxed">Press <kbd className="bg-stone-800 px-1.5 py-0.5 rounded-md text-stone-300 font-mono border border-stone-700/50 shadow-sm">Ctrl+Shift+P</kbd> to instantly transform focused input.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4 pointer-events-none">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={autoTransform}
                        readOnly
                      />
                      <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-stone-950 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-400 after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-100 peer-checked:after:bg-stone-950 shadow-inner"></div>
                    </label>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-stone-800/50 flex justify-end relative z-10">
                  <button
                    onClick={handleSave}
                    className="bg-stone-100 hover:bg-white text-stone-950 text-sm font-semibold py-3 px-8 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(245,245,244,0.1)] hover:shadow-[0_0_25px_rgba(245,245,244,0.2)]"
                  >
                    {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? "Saved" : "Save Preferences"}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-stone-900/40 border border-stone-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl absolute w-full"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Shield className="w-32 h-32 text-stone-100" />
                </div>

                <h2 className="text-lg font-medium text-stone-100 mb-6 flex items-center gap-2 relative z-10">
                  <Shield className="w-5 h-5 text-stone-400" /> Account Security
                </h2>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between p-5 bg-stone-950/30 border border-stone-800/50 rounded-2xl">
                    <div>
                      <div className="text-sm font-medium text-stone-200">Email Address</div>
                      <div className="text-xs text-stone-500 mt-1">Connected as {user?.email || "user@example.com"}</div>
                    </div>
                    <button
                      onClick={() => setModalType("email")}
                      disabled={loadingAction === "email"}
                      className="text-sm font-medium text-stone-400 hover:text-stone-100 transition-colors bg-stone-900 border border-stone-800 px-5 py-2.5 rounded-xl hover:bg-stone-800 shadow-sm disabled:opacity-50"
                    >
                      {loadingAction === "email" ? "Updating..." : "Update"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-stone-950/30 border border-stone-800/50 rounded-2xl">
                    <div>
                      <div className="text-sm font-medium text-stone-200">Password</div>
                      <div className="text-xs text-stone-500 mt-1">Change your current password</div>
                    </div>
                    <button
                      onClick={() => setModalType("password")}
                      disabled={loadingAction === "password"}
                      className="text-sm font-medium text-stone-400 hover:text-stone-100 transition-colors bg-stone-900 border border-stone-800 px-5 py-2.5 rounded-xl hover:bg-stone-800 shadow-sm disabled:opacity-50"
                    >
                      {loadingAction === "password" ? "Changing..." : "Change"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-red-950/10 border border-red-900/20 rounded-2xl">
                    <div>
                      <div className="text-sm font-medium text-red-400">Delete Account</div>
                      <div className="text-xs text-stone-500 mt-1">Permanently delete your data and history.</div>
                    </div>
                    <button
                      onClick={() => setModalType("delete")}
                      className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors bg-red-500/10 border border-red-500/20 px-5 py-2.5 rounded-xl hover:bg-red-500/20 shadow-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modern Dialog Modals */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 text-stone-500 hover:text-stone-300 hover:bg-stone-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                {modalType === "delete" ? (
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-stone-300" />
                  </div>
                )}
                <h3 className="text-xl font-semibold text-stone-100">
                  {modalType === "email" && "Update Email Address"}
                  {modalType === "password" && "Change Password"}
                  {modalType === "delete" && "Delete Account"}
                </h3>
                <p className="text-sm text-stone-400 mt-1">
                  {modalType === "email" && "We will send a verification link to your new address."}
                  {modalType === "password" && "Enter a strong password with at least 6 characters."}
                  {modalType === "delete" && "This action cannot be undone. To proceed, type DELETE below."}
                </p>
              </div>

              <input
                type={modalType === "password" ? "password" : "text"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  modalType === "email" ? "new@example.com" :
                    modalType === "password" ? "••••••••" :
                      "Type DELETE"
                }
                autoFocus
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-stone-200 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-700 transition-all mb-6"
                onKeyDown={(e) => e.key === "Enter" && confirmAction()}
              />

              <div className="flex gap-4">
                <button
                  onClick={closeModal}
                  className="flex-1 py-3 px-4 bg-stone-950/50 border border-stone-800 text-stone-300 rounded-xl font-medium hover:bg-stone-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all shadow-sm ${modalType === "delete"
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-stone-200 hover:bg-white text-stone-950"
                    }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
