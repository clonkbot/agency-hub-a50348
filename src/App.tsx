import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthForm } from "./components/AuthForm";
import { MainDashboard } from "./components/MainDashboard";
import { EmployeeDashboard } from "./components/EmployeeDashboard";
import { TasksDashboard } from "./components/TasksDashboard";
import { TrendsDashboard } from "./components/TrendsDashboard";
import { ContentGenerator } from "./components/ContentGenerator";
import {
  LayoutDashboard,
  Users,
  ListTodo,
  TrendingUp,
  Sparkles,
  LogOut,
  Menu,
  X,
} from "lucide-react";

type View = "overview" | "employees" | "tasks" | "trends" | "generator";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [currentView, setCurrentView] = useState<View>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium tracking-wide">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "employees", label: "Team", icon: Users },
    { id: "tasks", label: "Tasks", icon: ListTodo },
    { id: "trends", label: "Trends", icon: TrendingUp },
    { id: "generator", label: "Generator", icon: Sparkles },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-pink-600/15 rounded-full blur-3xl" />
      </div>

      {/* Top Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center">
                <span className="text-lg font-bold">OF</span>
              </div>
              <span className="text-lg font-semibold tracking-tight hidden sm:block">
                Agency Hub
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    currentView === item.id
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => signOut()}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-zinc-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5"
            >
              <nav className="px-4 py-3 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all ${
                      currentView === item.id
                        ? "bg-white/10 text-white"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === "overview" && <MainDashboard />}
              {currentView === "employees" && <EmployeeDashboard />}
              {currentView === "tasks" && <TasksDashboard />}
              {currentView === "trends" && <TrendsDashboard />}
              {currentView === "generator" && <ContentGenerator />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-white/5">
        <p className="text-center text-xs text-zinc-600">
          Requested by{" "}
          <a
            href="https://twitter.com/maxsofm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            @maxsofm
          </a>{" "}
          · Built by{" "}
          <a
            href="https://twitter.com/clonkbot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            @clonkbot
          </a>
        </p>
      </footer>
    </div>
  );
}
