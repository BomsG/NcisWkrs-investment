import React from "react";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  History,
  Users,
  UserCircle,
  LogOut,
  Bell,
  Menu,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../../store/useStore";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Ticker } from "../ui/Ticker";
import { ShieldCheck } from "lucide-react";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  href,
  active,
}) => (
  <Link
    to={href}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
      active
        ? "bg-emerald-500/10 text-emerald-500 font-medium"
        : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
    )}
  >
    <Icon
      size={20}
      className={cn(active ? "text-emerald-500" : "group-hover:text-slate-100")}
    />
    <span>{label}</span>
  </Link>
);

import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useStore();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: TrendingUp, label: "Investments", href: "/investment" },
    { icon: ArrowDownLeft, label: "Deposit", href: "/deposit" },
    { icon: ArrowUpRight, label: "Withdraw", href: "/withdraw" },
    { icon: History, label: "Transactions", href: "/transactions" },
    { icon: Users, label: "Referrals", href: "/referrals" },
    { icon: UserCircle, label: "Profile", href: "/profile" },
    { icon: ShieldCheck, label: "KYC Verification", href: "/kyc" },
    ...(user?.role === "admin"
      ? [{ icon: Shield, label: "Admin", href: "/admin" }]
      : []),
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-slate-100 font-sans flex flex-col">
      <Ticker />
      <div className="flex flex-1 relative">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed top-0 left-0 bottom-0 w-64 bg-[#111214] border-r border-slate-800/50 z-50 transition-transform duration-300 lg:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex flex-col h-full p-6">
            <Link to="/">
              <div className="flex items-center gap-2 mb-10">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center cursor-alias">
                  <TrendingUp className="text-white" size={20} />
                </div>

                <span className="text-xl font-bold tracking-tight">
                  NCISWKRS
                </span>
              </div>
            </Link>
            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={location.pathname === item.href}
                />
              ))}
            </nav>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 mt-auto text-slate-400 hover:text-rose-400 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:ml-64 min-h-screen flex flex-col">
          {/* Top Nav */}
          <header className="h-16 border-bottom border-slate-800/50 bg-[#0a0b0d]/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <button className="p-2 text-slate-400 hover:text-white relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#0a0b0d]"></span>
              </button>
              <div className="h-8 w-[1px] bg-slate-800 mx-2"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user?.fullName}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-500 font-bold">
                  {user?.fullName?.charAt(0) || "U"}
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
