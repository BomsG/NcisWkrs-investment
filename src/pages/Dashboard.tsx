import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Card, Button, Modal, Input } from "../components/ui/Common";
import { useStore } from "../store/useStore";
import { formatCurrency, cn } from "../lib/utils";
import {
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  Users,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

import { useNavigate } from "react-router-dom";
import { TradingViewWidget } from "../components/ui/TradingViewWidget";
import { Copy, User, Mail, Phone, Calendar, ShieldCheck } from "lucide-react";


const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <Card className="relative overflow-hidden group">
    <div
      className={cn(
        "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-30",
        color === "emerald" ? "bg-emerald-500" : "bg-blue-500",
      )}
    ></div>
    <div className="flex justify-between items-start mb-4">
      <div
        className={cn(
          "p-3 rounded-xl",
          color === "emerald"
            ? "bg-emerald-500/10 text-emerald-500"
            : "bg-blue-500/10 text-blue-500",
        )}
      >
        <Icon size={24} />
      </div>
      {trend && (
        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <p className="text-slate-400 text-sm mb-1">{title}</p>
    <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
  </Card>
);

import {
  collection,
  query,
  where,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

// Generate chart data from investments over last N days
function generateChartData(investments: any[], days: number) {
  const today = new Date();
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const label =
      days <= 7
        ? date.toLocaleDateString("en-US", { weekday: "short" })
        : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    // Calculate cumulative profit up to this date across all investments
    let profit = 0;
    for (const inv of investments) {
      const startDate = new Date(inv.startDate);
      if (date >= startDate) {
        const elapsed = Math.floor(
          (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        const cappedElapsed = Math.min(elapsed, inv.duration);
        profit += inv.amount * (inv.roi / 100) * cappedElapsed;
      }
    }

    result.push({ name: label, value: parseFloat(profit.toFixed(2)) });
  }

  return result;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [investments, setInvestments] = React.useState<any[]>([]);
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [chartDays, setChartDays] = React.useState(7);

  React.useEffect(() => {
    if (!user?.uid) return;

    const qInvestments = query(
      collection(db, "investments"),
      where("uid", "==", user.uid),
      where("status", "==", "active"),
    );

    const unsubscribeInvestments = onSnapshot(
      qInvestments,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInvestments(docs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "investments");
      },
    );

    const qTransactions = query(
      collection(db, "transactions"),
      where("uid", "==", user.uid),
      limit(5),
    );
    const unsubscribeTransactions = onSnapshot(
      qTransactions,
      (snapshot) => {
        const docs = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort(
            (a: any, b: any) =>
              new Date(b.date).getTime() - new Date(a.date).getTime(),
          );
        setTransactions(docs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "transactions");
      },
    );

    return () => {
      unsubscribeInvestments();
      unsubscribeTransactions();
    };
  }, [user?.uid]);

  const chartData = generateChartData(investments, chartDays);
  const hasInvestments = investments.length > 0;
  const totalActiveInvested = investments.reduce(
    (acc, inv) => acc + inv.amount,
    0,
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.fullName?.split(" ")[0] || "Investor"}!
            </h1>
            <p className="text-slate-400">
              Here's what's happening with your investments today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="hidden sm:flex">
              Download Report
            </Button>
            <Button variant="secondary" onClick={() => navigate("/deposit")}>
              <ArrowDownLeft className="mr-2" size={18} />
              Deposit
            </Button>
            <Button onClick={() => navigate("/investment")}>
              <TrendingUp className="mr-2" size={18} />
              New Investment
            </Button>
          </div>
        </div>

        {/* KYC Banner */}
        <Card className="bg-emerald-500/10 border-emerald-500/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-emerald-500">Account Verified</h4>
              <p className="text-xs text-slate-400">
                Your account is fully verified and ready for unlimited trading.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-emerald-500 hover:bg-emerald-500/10"
          >
            View Certificate
          </Button>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card
            className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-800/50 transition-colors group"
            onClick={() => navigate("/deposit")}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <ArrowDownLeft size={24} />
            </div>
            <span className="text-sm font-bold">Deposit</span>
          </Card>
          <Card
            className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-800/50 transition-colors group"
            onClick={() => navigate("/investment")}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
              <TrendingUp size={24} />
            </div>
            <span className="text-sm font-bold">Invest</span>
          </Card>
          <Card
            className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-800/50 transition-colors group"
            onClick={() => navigate("/withdraw")}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all">
              <ArrowUpRight size={24} />
            </div>
            <span className="text-sm font-bold">Withdraw</span>
          </Card>
          <Card
            className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-800/50 transition-colors group"
            onClick={() => navigate("/referrals")}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <Users size={24} />
            </div>
            <span className="text-sm font-bold">Referrals</span>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Account Balance"
            value={formatCurrency(user?.balance || 0)}
            icon={Wallet}
            trend="+12.5%"
            color="emerald"
          />
          <StatCard
            title="Total Profit"
            value={formatCurrency(user?.totalProfit || 0)}
            icon={TrendingUp}
            trend="+8.2%"
            color="emerald"
          />
          <StatCard
            title="Total Bonus"
            value={formatCurrency(0)}
            icon={Activity}
            color="blue"
          />
          <StatCard
            title="Referral Bonus"
            value={formatCurrency(0)}
            icon={Users}
            color="blue"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Dashboard Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* TradingView Chart */}
            <Card className="p-0 overflow-hidden border-slate-800">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-emerald-500" size={18} />
                  <h3 className="font-bold text-sm uppercase tracking-wider">
                    Market Analysis
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase">
                    Live Data
                  </span>
                </div>
              </div>
              <div className="h-[400px]">
                <TradingViewWidget />
              </div>
            </Card>

            {/* Profit Performance Chart */}
            <Card>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold">Profit Performance</h3>
                  <p className="text-sm text-slate-400">
                    {hasInvestments
                      ? `Cumulative profit from ${investments.length} active investment${investments.length > 1 ? "s" : ""}`
                      : "No active investments yet"}
                  </p>
                </div>
                <select
                  className="bg-slate-800 border-none rounded-lg text-sm px-3 py-1.5 focus:ring-0"
                  value={chartDays}
                  onChange={(e) => setChartDays(parseInt(e.target.value))}
                >
                  <option value={7}>Last 7 Days</option>
                  <option value={30}>Last 30 Days</option>
                </select>
              </div>

              {!hasInvestments ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-center bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                  <Activity className="text-slate-700 mb-3" size={40} />
                  <p className="text-slate-500 text-sm mb-3">
                    Start an investment to see your profit chart
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/investment")}
                  >
                    View Investment Plans
                  </Button>
                </div>
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="colorValue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1e293b"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) =>
                          value >= 1000
                            ? `$${(value / 1000).toFixed(1)}k`
                            : `$${value}`
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#111214",
                          border: "1px solid #1e293b",
                          borderRadius: "12px",
                        }}
                        formatter={(value: any) => [
                          `$${value.toLocaleString()}`,
                          "Profit",
                        ]}
                        itemStyle={{ color: "#10b981" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Live Investment Tracker */}
            <Card>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold">Live Investment Tracker</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                    Live Tracing
                  </span>
                </div>
              </div>

              <div className="space-y-8">
                {investments.length === 0 ? (
                  <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                    <Activity
                      className="mx-auto text-slate-700 mb-4"
                      size={48}
                    />
                    <p className="text-slate-500">
                      No active investments found.
                    </p>
                    <Button
                      variant="ghost"
                      className="mt-4"
                      onClick={() => navigate("/investment")}
                    >
                      Start your first plan
                    </Button>
                  </div>
                ) : (
                  investments.map((plan, i) => {
                    const startDate = new Date(plan.startDate);
                    const duration = plan.duration;
                    const elapsed = Math.min(
                      duration,
                      Math.floor(
                        (Date.now() - startDate.getTime()) /
                          (1000 * 60 * 60 * 24),
                      ),
                    );
                    const progress = (elapsed / duration) * 100;
                    const maturityDate = new Date(startDate);
                    maturityDate.setDate(startDate.getDate() + duration);

                    return (
                      <div
                        key={i}
                        className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-all group"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                              <Activity size={24} />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg">
                                {plan.planName}
                              </h4>
                              <p className="text-sm text-slate-500">
                                Invested: {formatCurrency(plan.amount)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:flex md:items-center gap-8">
                            <div className="text-right md:text-left">
                              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                                Current Profit
                              </p>
                              <p className="text-xl font-mono font-bold text-emerald-500">
                                +
                                {formatCurrency(
                                  plan.amount * (plan.roi / 100) * elapsed,
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                                Time Remaining
                              </p>
                              <p className="text-sm font-bold">
                                {duration - elapsed} Days
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-400">Progress</span>
                            <span className="text-emerald-500">
                              {progress.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="h-full bg-emerald-500"
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
                            <span>
                              Started: {startDate.toLocaleDateString()}
                            </span>
                            <span>
                              Maturity: {maturityDate.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Referral Card */}
            <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 border-none p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Users size={80} />
              </div>
              <h3 className="text-lg font-bold mb-2">Refer & Earn</h3>
              <p className="text-indigo-100 text-sm mb-6">
                Invite your friends and earn 10% commission on their
                investments.
              </p>
              <div className="space-y-3">
                <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">
                  Your Referral Link
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 text-xs font-mono truncate border border-white/20">
                    {`${window.location.origin}/register?ref=${user?.referralCode || ""}`}
                  </div>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `${window.location.origin}/register?ref=${user?.referralCode || ""}`,
                      )
                    }
                    className="p-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </Card>

            {/* Personal Details Card */}
            <Card>
              <h3 className="text-lg font-bold mb-6">Personal Details</h3>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Full Name
                    </p>
                    <p className="text-sm font-medium">{user?.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Email Address
                    </p>
                    <p className="text-sm font-medium truncate max-w-[180px]">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Phone Number
                    </p>
                    <p className="text-sm font-medium">
                      {user?.phoneNumber || "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Joined Date
                    </p>
                    <p className="text-sm font-medium">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Account Status
                    </p>
                    <p className="text-sm font-bold text-emerald-500 uppercase tracking-tighter">
                      Verified
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Recent Activity</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/transactions")}
                >
                  View All
                </Button>
              </div>
              <div className="space-y-6">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm">
                      No transactions yet.
                    </p>
                  </div>
                ) : (
                  transactions.map((tx, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "p-2.5 rounded-xl",
                            tx.type === "Deposit"
                              ? "text-emerald-500 bg-emerald-500/10"
                              : tx.type === "Withdraw"
                                ? "text-rose-500 bg-rose-500/10"
                                : "text-blue-500 bg-blue-500/10",
                          )}
                        >
                          {tx.type === "Deposit" ? (
                            <ArrowDownLeft size={18} />
                          ) : tx.type === "Withdraw" ? (
                            <ArrowUpRight size={18} />
                          ) : (
                            <TrendingUp size={18} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tx.type}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(tx.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "font-bold text-sm",
                            tx.type === "Withdraw"
                              ? "text-rose-500"
                              : "text-emerald-500",
                          )}
                        >
                          {tx.type === "Withdraw" ? "-" : "+"}
                          {formatCurrency(tx.amount)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Portfolio Distribution */}
            <Card className="flex flex-col">
              <h3 className="text-lg font-bold mb-6">Portfolio</h3>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-32 h-32 mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-slate-800"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={351.68}
                      strokeDashoffset={351.68 * 0.35}
                      className="text-emerald-500"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={351.68}
                      strokeDashoffset={351.68 * 0.75}
                      className="text-blue-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-[8px] text-slate-500 uppercase font-bold">
                      Total
                    </p>
                    <p className="text-sm font-bold">
                      {formatCurrency(totalActiveInvested)}
                    </p>
                  </div>
                </div>
                <div className="w-full space-y-3">
                  {[
                    { label: "Premium", value: "65%", color: "bg-emerald-500" },
                    { label: "Crypto", value: "25%", color: "bg-blue-500" },
                    { label: "Starter", value: "10%", color: "bg-slate-700" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn("w-1.5 h-1.5 rounded-full", item.color)}
                        ></div>
                        <span className="text-[10px] text-slate-400">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
