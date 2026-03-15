import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Card, Button, Input, Modal } from "../components/ui/Common";
import {
  ArrowUpRight,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  increment,
  query,
  where,
  limit,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { useStore } from "../store/useStore";

export default function Withdraw() {
  const { user } = useStore();
  const navigate = useNavigate();
  const [amount, setAmount] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
  const [method, setMethod] = React.useState("Bitcoin (BTC)");
  const [address, setAddress] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [recentWithdrawals, setRecentWithdrawals] = React.useState<any[]>([]);
  const [kycStatus, setKycStatus] = React.useState<string | null>(null);
  const [kycLoading, setKycLoading] = React.useState(true);

  // Check KYC status
  React.useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = onSnapshot(doc(db, "kyc", user.uid), (snap) => {
      if (snap.exists()) setKycStatus(snap.data().status);
      else setKycStatus(null);
      setKycLoading(false);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  React.useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "transactions"),
      where("uid", "==", user.uid),
      where("type", "==", "Withdrawal"),
      limit(5),
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
        setRecentWithdrawals(data);
      },
      (error) => {
        console.error("Withdrawals error:", error);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const handleWithdraw = async () => {
    if (!user || !amount || !address) return;
    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount < 50) {
      setError("Minimum withdrawal amount is $50.00");
      return;
    }

    if (withdrawAmount > user.balance) {
      setError("Insufficient balance for this withdrawal.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, "transactions"), {
        uid: user.uid,
        type: "Withdrawal",
        amount: withdrawAmount,
        status: "Pending",
        date: new Date().toISOString(),
        method: method,
        walletAddress: address,
      });

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        balance: increment(-withdrawAmount),
      });

      setIsSuccessModalOpen(true);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, "transactions/withdraw");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setAmount("");
    setAddress("");
    setIsSuccessModalOpen(false);
  };

  // KYC not approved — block withdrawal
  if (kycLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (kycStatus !== "Approved") {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto mt-16">
          <Card className="text-center py-12 space-y-6">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="text-amber-500" size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">
                KYC Verification Required
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                {kycStatus === "Pending"
                  ? "Your identity verification is currently under review. Withdrawals will be enabled once your KYC is approved."
                  : kycStatus === "Rejected"
                    ? "Your KYC submission was rejected. Please resubmit with correct information to enable withdrawals."
                    : "You need to complete identity verification before you can make withdrawals. This helps keep your account secure."}
              </p>
            </div>
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold",
                kycStatus === "Pending"
                  ? "bg-blue-500/10 text-blue-400"
                  : kycStatus === "Rejected"
                    ? "bg-rose-500/10 text-rose-400"
                    : "bg-slate-800 text-slate-400",
              )}
            >
              <Clock size={14} />
              {kycStatus === "Pending"
                ? "Verification Pending"
                : kycStatus === "Rejected"
                  ? "Verification Rejected"
                  : "Not Verified"}
            </div>
            <Button className="w-full" onClick={() => navigate("/kyc")}>
              <ShieldCheck className="mr-2" size={18} />
              {kycStatus === "Pending"
                ? "View KYC Status"
                : kycStatus === "Rejected"
                  ? "Resubmit KYC"
                  : "Complete KYC Verification"}
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Withdraw Funds
            </h1>
            <p className="text-slate-400">
              Transfer your earnings to your external wallet or bank account.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-xs font-bold text-emerald-500">
              KYC Verified
            </span>
          </div>
        </div>

        <Modal
          isOpen={isSuccessModalOpen}
          onClose={reset}
          title="Withdrawal Requested"
        >
          <div className="text-center py-8 space-y-4">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
              <CheckCircle2 size={48} />
            </div>
            <h4 className="text-xl font-bold">Request Successful</h4>
            <p className="text-slate-400">
              Your withdrawal of {formatCurrency(parseFloat(amount) || 0)} has
              been submitted for processing. You will receive it within 24
              hours.
            </p>
            <Button className="w-full" onClick={reset}>
              Back to Dashboard
            </Button>
          </div>
        </Modal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="space-y-8">
                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm">
                    {error}
                  </div>
                )}
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                      <Wallet size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                        Available Balance
                      </p>
                      <p className="text-xl font-bold">
                        {formatCurrency(user?.balance || 0)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAmount((user?.balance || 0).toString())}
                  >
                    Withdraw All
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-slate-300">
                      Withdrawal Amount ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="pl-8 text-xl font-bold"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium text-slate-300">
                      Select Withdrawal Method
                    </label>
                    <select
                      className="w-full bg-[#0a0b0d] border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                    >
                      <option>Bitcoin (BTC)</option>
                      <option>Ethereum (ETH)</option>
                      <option>USDT (TRC20)</option>
                      <option>Bank Account (USD)</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium text-slate-300">
                      Destination Address / Account Info
                    </label>
                    <Input
                      placeholder="Enter your wallet address or bank details"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Withdrawal Fee:</span>
                      <span className="font-medium">0.5% ($0.00)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Processing Time:</span>
                      <span className="font-medium">Instant - 24 Hours</span>
                    </div>
                    <div className="pt-3 border-t border-slate-800 flex justify-between font-bold">
                      <span>You will receive:</span>
                      <span className="text-emerald-500">
                        ${amount || "0.00"}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleWithdraw}
                    isLoading={isLoading}
                    disabled={!amount}
                  >
                    Confirm Withdrawal
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h4 className="font-bold mb-6 flex items-center gap-2">
                <Clock className="text-blue-500" size={18} />
                Recent Activity
              </h4>
              <div className="space-y-6">
                {recentWithdrawals.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-slate-500">
                      No recent withdrawals
                    </p>
                  </div>
                ) : (
                  recentWithdrawals.map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm">
                          {formatCurrency(item.amount)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                          item.status === "Completed" ||
                            item.status === "Approved"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-blue-500/10 text-blue-500",
                        )}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex gap-3">
              <AlertCircle className="text-rose-500 shrink-0" size={20} />
              <p className="text-xs text-rose-200 leading-relaxed">
                Ensure your withdrawal information is 100% correct. We are not
                responsible for funds sent to the wrong address.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
