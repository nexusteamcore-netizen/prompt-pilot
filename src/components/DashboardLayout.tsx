import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, History, Settings, CreditCard, Puzzle, Rocket, ChevronRight, LogOut, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { BrandIcon } from "./BrandIcon";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: History, label: "History", path: "/dashboard/history" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
    { icon: CreditCard, label: "Billing", path: "/dashboard/billing" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen text-zinc-400 font-sans flex bg-stone-950 overflow-x-hidden pb-20 lg:pb-0">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full h-16 bg-stone-950/40 backdrop-blur-xl border-b border-stone-800/20 z-30 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold text-stone-100 tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
            <BrandIcon className="w-4 h-4 text-stone-950" />
          </div>
          <span className="bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent">PromptPilot</span>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-stone-900/50 rounded-full border border-stone-800/50 text-stone-400 hover:text-stone-100 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Navigation (Modern Mobile UX) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-stone-950/60 backdrop-blur-2xl border-t border-stone-800/30 z-40 px-6 flex items-center justify-around pb-safe">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? "text-stone-100" : "text-stone-500"}`}
            >
              <div className={`p-1 rounded-full transition-all ${isActive ? "bg-stone-100/10 scale-110" : ""}`}>
                <item.icon className={`w-6 h-6 ${isActive ? "text-stone-100" : ""}`} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar (Full drawer on mobile) */}
      <aside className={`
        fixed inset-y-0 right-0 w-72 border-l border-stone-800/40 bg-stone-950 flex flex-col z-50 transition-transform duration-500 ease-out lg:translate-x-0 lg:left-0 lg:right-auto lg:border-r lg:border-l-0
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
      `}>
        <div className="h-20 flex items-center justify-between px-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-stone-100 tracking-tight group">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BrandIcon className="w-4 h-4 text-stone-950" />
            </div>
            PromptPilot
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 bg-stone-900 rounded-full text-stone-400 hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2">
          <div className="text-xs font-bold text-stone-600 uppercase tracking-[0.2em] mb-4 px-3">Account & Settings</div>
          <Link
            to="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium text-stone-400 hover:bg-stone-900/60 transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
          <Link
            to="/dashboard/billing"
            className="flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium text-stone-400 hover:bg-stone-900/60 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Billing & Plan</span>
          </Link>
        </div>

        <div className="p-4 bg-stone-900/20 m-4 rounded-3xl border border-stone-800/30">
          <Link to="/dashboard/extension" className="flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-semibold text-stone-100 bg-stone-900 hover:bg-black transition-all mb-4 group ring-1 ring-stone-800/50">
            <Puzzle className="w-4 h-4 text-stone-400 group-hover:text-stone-100 transition-colors" />
            <span>Install Extension</span>
          </Link>

          {/* User Profile Area */}
          <div className="pt-2 space-y-3">
            <div className="w-full flex items-center gap-3 px-2 py-2">
              <div className="w-10 h-10 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-100 font-bold overflow-hidden shadow-lg">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="text-sm font-bold text-stone-100 truncate">{user?.email?.split('@')[0] || "User"}</div>
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Free Explorer</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-2xl text-xs font-bold text-red-400 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>TERMINATE SESSION</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 relative min-h-screen flex flex-col pt-16 lg:pt-0">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-stone-950">
           <div className="absolute inset-0 bg-grid opacity-[0.03]"></div>
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-stone-900/20 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-stone-800/10 rounded-full blur-[120px]"></div>
        </div>

        {/* Page Content */}
        <div className="relative z-10 p-4 md:p-10 flex-1 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
