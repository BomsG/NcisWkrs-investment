import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Card, Button, Input, Modal } from "../components/ui/Common";
import {
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Check,
  X,
  Shield,
  Clock,
  Gift,
} from "lucide-react";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  orderBy,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { useStore } from "../store/useStore";
import { formatCurrency, cn } from "../lib/utils";
import { Navigate } from "react-router-dom";

export default function Admin() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "users" | "deposits" | "withdrawals"
  >("overview");
  const [users, setUsers] = React.useState<any[]>([]);
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isBonusModalOpen, setIsBonusModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  const [newBalance, setNewBalance] = React.useState("");
  const [bonusAmount, setBonusAmount] = React.useState("");
  const [bonusType, setBonusType] = React.useState<"balance" | "totalProfit">(
    "balance",
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [bonusSuccess, setBonusSuccess] = React.useState(false);

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  React.useEffect(() => {
    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        console.error("Users error:", error);
      },
    );

    const unsubTx = onSnapshot(
      query(collection(db, "transactions")),
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
        console.error("Transactions error:", error);
      },
    );

    return () => {
      unsubUsers();
      unsubTx();
    };
  }, []);

  const handleApproveTransaction = async (tx: any) => {
    setIsLoading(true);
    try {
      const txRef = doc(db, "transactions", tx.id);
      const userRef = doc(db, "users", tx.uid);

      if (tx.type === "Deposit") {
        await updateDoc(userRef, {
          balance: increment(tx.amount),
          totalDeposits: increment(tx.amount),
        });
      }

      await updateDoc(txRef, { status: "Completed" });
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `transactions/${tx.id}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectTransaction = async (tx: any) => {
    setIsLoading(true);
    try {
      const txRef = doc(db, "transactions", tx.id);

      if (tx.type === "Withdrawal") {
        const userRef = doc(db, "users", tx.uid);
        await updateDoc(userRef, { balance: increment(tx.amount) });
      }

      await updateDoc(txRef, { status: "Rejected" });
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `transactions/${tx.id}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBalance = async () => {
    if (!selectedUser || !newBalance) return;
    setIsLoading(true);
    try {
      const userRef = doc(db, "users", selectedUser.id);
      await updateDoc(userRef, { balance: parseFloat(newBalance) });
      setIsEditModalOpen(false);
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `users/${selectedUser.id}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBonus = async () => {
    if (!selectedUser || !bonusAmount || parseFloat(bonusAmount) <= 0) return;
    setIsLoading(true);
    try {
      const userRef = doc(db, "users", selectedUser.id);
      await updateDoc(userRef, {
        [bonusType]: increment(parseFloat(bonusAmount)),
      });
      setBonusSuccess(true);
      setTimeout(() => {
        setBonusSuccess(false);
        setIsBonusModalOpen(false);
        setBonusAmount("");
      }, 1500);
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `users/${selectedUser.id}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    totalUsers: users.length,
    totalDeposits: transactions
      .filter((t) => t.type === "Deposit" && t.status === "Completed")
      .reduce((acc, t) => acc + t.amount, 0),
    totalWithdrawals: transactions
      .filter((t) => t.type === "Withdrawal" && t.status === "Completed")
      .reduce((acc, t) => acc + t.amount, 0),
    pendingRequests: transactions.filter((t) => t.status === "Pending").length,
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Shield className="text-emerald-500" /> Admin Control Panel
            </h1>
            <p className="text-slate-400">
              Manage platform users and financial operations.
            </p>
          </div>
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(["overview", "users", "deposits", "withdrawals"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all",
                    activeTab === tab
                      ? "bg-emerald-500 text-white shadow-lg"
                      : "text-slate-400 hover:text-white",
                  )}
                >
                  {tab}
                </button>
              ),
            )}
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={stats.totalUsers.toString()}
              icon={Users}
              color="text-blue-500"
            />
            <StatCard
              title="Total Deposits"
              value={formatCurrency(stats.totalDeposits)}
              icon={ArrowDownLeft}
              color="text-emerald-500"
            />
            <StatCard
              title="Total Withdrawals"
              value={formatCurrency(stats.totalWithdrawals)}
              icon={ArrowUpRight}
              color="text-rose-500"
            />
            <StatCard
              title="Pending Requests"
              value={stats.pendingRequests.toString()}
              icon={Clock}
              color="text-orange-500"
            />
          </div>
        )}

        {activeTab === "users" && (
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
              <h3 className="text-xl font-bold">User Management</h3>
              <div className="relative max-w-xs w-full">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={18}
                />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Balance</th>
                    <th className="px-6 py-4">Profit</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-sm">{u.fullName}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-500">
                        {formatCurrency(u.balance || 0)}
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-400">
                        {formatCurrency(u.totalProfit || 0)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                            u.role === "admin"
                              ? "bg-purple-500/10 text-purple-500"
                              : "bg-blue-500/10 text-blue-500",
                          )}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(u);
                              setNewBalance(u.balance.toString());
                              setIsEditModalOpen(true);
                            }}
                          >
                            Edit Balance
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-amber-500 hover:text-amber-400"
                            onClick={() => {
                              setSelectedUser(u);
                              setBonusAmount("");
                              setBonusType("balance");
                              setBonusSuccess(false);
                              setIsBonusModalOpen(true);
                            }}
                          >
                            <Gift size={14} className="mr-1" /> Add Bonus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {(activeTab === "deposits" || activeTab === "withdrawals") && (
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold capitalize">
                {activeTab} Requests
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {transactions
                    .filter(
                      (t) =>
                        t.type ===
                        (activeTab === "deposits" ? "Deposit" : "Withdrawal"),
                    )
                    .map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold">
                            {users.find((u) => u.uid === tx.uid)?.fullName ||
                              "Unknown"}
                          </p>
                          <p className="text-[10px] text-slate-500">{tx.uid}</p>
                        </td>
                        <td className="px-6 py-4 font-bold">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {tx.method}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                              tx.status === "Completed"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : tx.status === "Pending"
                                  ? "bg-blue-500/10 text-blue-500"
                                  : "bg-rose-500/10 text-rose-500",
                            )}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {tx.status === "Pending" && (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleApproveTransaction(tx)}
                                className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-all"
                                title="Approve"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => handleRejectTransaction(tx)}
                                className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                                title="Reject"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Edit Balance Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit User Balance"
        >
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">User</label>
              <p className="font-bold">{selectedUser?.fullName}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">
                Current Balance
              </label>
              <p className="text-xl font-bold text-emerald-500">
                {formatCurrency(selectedUser?.balance || 0)}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">
                New Balance ($)
              </label>
              <Input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleUpdateBalance}
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </div>
        </Modal>

        {/* Add Bonus Modal */}
        <Modal
          isOpen={isBonusModalOpen}
          onClose={() => setIsBonusModalOpen(false)}
          title="Add Bonus"
        >
          <div className="space-y-6 py-4">
            {bonusSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                  <Check size={32} className="text-emerald-500" />
                </div>
                <p className="font-bold text-emerald-500">
                  Bonus Added Successfully!
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-400">
                    User
                  </label>
                  <p className="font-bold">{selectedUser?.fullName}</p>
                  <p className="text-xs text-slate-500">
                    {selectedUser?.email}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      Current Balance
                    </p>
                    <p className="font-bold text-emerald-500">
                      {formatCurrency(selectedUser?.balance || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      Current Profit
                    </p>
                    <p className="font-bold text-blue-400">
                      {formatCurrency(selectedUser?.totalProfit || 0)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">
                    Bonus Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setBonusType("balance")}
                      className={cn(
                        "p-3 rounded-xl border-2 text-sm font-bold transition-all",
                        bonusType === "balance"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                          : "border-slate-800 text-slate-400 hover:border-slate-700",
                      )}
                    >
                      Add to Balance
                    </button>
                    <button
                      onClick={() => setBonusType("totalProfit")}
                      className={cn(
                        "p-3 rounded-xl border-2 text-sm font-bold transition-all",
                        bonusType === "totalProfit"
                          ? "border-blue-500 bg-blue-500/10 text-blue-500"
                          : "border-slate-800 text-slate-400 hover:border-slate-700",
                      )}
                    >
                      Add to Profit
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">
                    Bonus Amount ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                      $
                    </span>
                    <Input
                      type="number"
                      value={bonusAmount}
                      onChange={(e) => setBonusAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-8"
                    />
                  </div>
                  <div className="flex gap-2">
                    {[50, 100, 500, 1000].map((val) => (
                      <button
                        key={val}
                        onClick={() => setBonusAmount(val.toString())}
                        className="px-3 py-1 rounded-md bg-slate-800 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        +${val}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleAddBonus}
                  isLoading={isLoading}
                  disabled={!bonusAmount || parseFloat(bonusAmount) <= 0}
                >
                  <Gift size={16} className="mr-2" />
                  Add {bonusType === "balance" ? "Balance" : "Profit"} Bonus
                </Button>
              </>
            )}
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-2xl bg-slate-900", color)}>
          <Icon size={24} />
        </div>
      </div>
      <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">
        {title}
      </p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </Card>
  );
}
