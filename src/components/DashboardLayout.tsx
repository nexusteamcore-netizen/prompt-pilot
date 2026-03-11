import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, History, Settings, CreditCard, Puzzle, Rocket, ChevronRight, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { BrandIcon } from "./BrandIcon";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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
    <div className="min-h-screen text-zinc-400 font-sans flex bg-stone-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-stone-800/40 bg-stone-950/80 backdrop-blur-2xl flex flex-col fixed h-full z-20">
        <div className="h-20 flex items-center px-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-stone-100 tracking-tight group">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BrandIcon className="w-4 h-4 text-stone-950" />
            </div>
            PromptPilot
          </Link>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1">
          <div className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-4 px-3">Menu</div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive ? "text-stone-100" : "text-stone-400 hover:text-stone-200 hover:bg-stone-900/40"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-stone-800/60 rounded-xl border border-stone-700/50"
                    initial={false}
                    transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={`w-4 h-4 relative z-10 ${isActive ? "text-stone-100" : "text-stone-500 group-hover:text-stone-300"}`} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4">
          <Link to="/dashboard/extension" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:bg-stone-900/40 hover:text-stone-200 transition-all mb-4 group" title="Install Chrome Extension">
            <Puzzle className="w-4 h-4 text-stone-500 group-hover:text-stone-300 transition-colors" />
            <span>Install Extension</span>
          </Link>

          {/* User Profile Area */}
          <div className="border-t border-stone-800/50 pt-4 mt-2 space-y-2">
            <div className="w-full flex items-center gap-3 px-2 py-2 rounded-xl group">
              <div className="w-9 h-9 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300 font-medium text-sm uppercase">
                {user?.email?.charAt(0) || "U"}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="text-sm font-medium text-stone-200 truncate">{user?.email || "User"}</div>
                <div className="text-xs text-stone-500">Free Plan</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all group"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 relative min-h-screen flex flex-col">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-grid opacity-30"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-stone-800/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Page Content */}
        <div className="relative z-10 p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
