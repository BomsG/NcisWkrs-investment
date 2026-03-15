import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Card, Button, Input } from "../components/ui/Common";
import {
  Search,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Users,
  PieChart,
} from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { useStore } from "../store/useStore";

const getIcon = (type: string) => {
  switch (type) {
    case "Deposit":
      return ArrowDownLeft;
    case "Withdrawal":
      return ArrowUpRight;
    case "Investment":
      return TrendingUp;
    case "Referral":
      return Users;
    default:
      return PieChart;
  }
};

const getColor = (type: string) => {
  switch (type) {
    case "Deposit":
      return "text-emerald-500 bg-emerald-500/10";
    case "Withdrawal":
      return "text-rose-500 bg-rose-500/10";
    case "Investment":
      return "text-blue-500 bg-blue-500/10";
    case "Referral":
      return "text-amber-500 bg-amber-500/10";
    default:
      return "text-slate-400 bg-slate-400/10";
  }
};

const getAmountColor = (type: string) =>
  type === "Withdrawal" || type === "Investment"
    ? "text-rose-500"
    : "text-emerald-500";

const getStatusColor = (status: string) =>
  status === "Completed" || status === "Approved"
    ? "bg-emerald-500/10 text-emerald-500"
    : status === "Rejected"
      ? "bg-rose-500/10 text-rose-500"
      : "bg-blue-500/10 text-blue-500";

export default function Transactions() {
  const { user } = useStore();
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("All");
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "transactions"),
      where("uid", "==", user.uid),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort(
            (a: any, b: any) =>
              new Date(b.date).getTime() - new Date(a.date).getTime(),
          );
        setTransactions(data);
        setIsLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "transactions");
      },
    );

    return () => unsubscribe();
  }, [user]);

  const filteredTransactions = transactions.filter((t) => {
    const matchesFilter = filter === "All" ? true : t.type === filter;
    const matchesSearch =
      search === ""
        ? true
        : t.id.toLowerCase().includes(search.toLowerCase()) ||
          t.method?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Transaction History
            </h1>
            <p className="text-slate-400 text-sm">
              View and manage all your financial activities.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="self-start sm:self-auto"
          >
            <Download className="mr-2" size={16} />
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total Deposits",
              value: transactions
                .filter((t) => t.type === "Deposit" && t.status === "Completed")
                .reduce((a, t) => a + t.amount, 0),
              color: "text-emerald-500",
            },
            {
              label: "Total Withdrawals",
              value: transactions
                .filter(
                  (t) => t.type === "Withdrawal" && t.status === "Completed",
                )
                .reduce((a, t) => a + t.amount, 0),
              color: "text-rose-500",
            },
            {
              label: "Pending",
              value: transactions.filter((t) => t.status === "Pending").length,
              color: "text-blue-500",
              isCount: true,
            },
            {
              label: "Total Transactions",
              value: transactions.length,
              color: "text-slate-300",
              isCount: true,
            },
          ].map((s, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-900/50 border border-slate-800"
            >
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                {s.label}
              </p>
              <p className={cn("text-lg font-bold", s.color)}>
                {s.isCount ? s.value : formatCurrency(s.value as number)}
              </p>
            </div>
          ))}
        </div>

        <Card>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <Input
                placeholder="Search by ID or method..."
                className="pl-10 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="bg-[#0a0b0d] border border-slate-800 rounded-xl px-4 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Deposit">Deposits</option>
              <option value="Withdrawal">Withdrawals</option>
              <option value="Investment">Investments</option>
              <option value="Referral">Referrals</option>
            </select>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-xs border-b border-slate-800 uppercase tracking-wider">
                  <th className="pb-4 font-bold">Transaction ID</th>
                  <th className="pb-4 font-bold">Type</th>
                  <th className="pb-4 font-bold">Amount</th>
                  <th className="pb-4 font-bold">Date</th>
                  <th className="pb-4 font-bold">Method</th>
                  <th className="pb-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-slate-500"
                    >
                      <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
                      Loading transactions...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-slate-500"
                    >
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const Icon = getIcon(tx.type);
                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="py-4 font-mono text-xs text-slate-400">
                          {tx.id.slice(0, 8)}...
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "p-2 rounded-lg",
                                getColor(tx.type),
                              )}
                            >
                              <Icon size={14} />
                            </div>
                            <span className="font-medium text-sm">
                              {tx.type}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 font-bold text-sm">
                          <span className={getAmountColor(tx.type)}>
                            {tx.type === "Withdrawal" ||
                            tx.type === "Investment"
                              ? "-"
                              : "+"}
                            {formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td className="py-4 text-slate-400 text-sm">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 text-slate-400 text-sm">
                          {tx.method || "—"}
                        </td>
                        <td className="py-4">
                          <span
                            className={cn(
                              "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                              getStatusColor(tx.status),
                            )}
                          >
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {isLoading ? (
              <div className="py-12 text-center text-slate-500">
                <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
                Loading...
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No transactions found.
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const Icon = getIcon(tx.type);
                return (
                  <div
                    key={tx.id}
                    className="p-4 rounded-xl bg-slate-900/50 border border-slate-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn("p-2 rounded-lg", getColor(tx.type))}
                        >
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{tx.type}</p>
                          <p className="text-[10px] font-mono text-slate-500">
                            {tx.id.slice(0, 10)}...
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "font-bold text-sm",
                            getAmountColor(tx.type),
                          )}
                        >
                          {tx.type === "Withdrawal" || tx.type === "Investment"
                            ? "-"
                            : "+"}
                          {formatCurrency(tx.amount)}
                        </p>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                            getStatusColor(tx.status),
                          )}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-800">
                      <span>{new Date(tx.date).toLocaleDateString()}</span>
                      <span>{tx.method || "—"}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {filteredTransactions.length} transaction
              {filteredTransactions.length !== 1 ? "s" : ""}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
