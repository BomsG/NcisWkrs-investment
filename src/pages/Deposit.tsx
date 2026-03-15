import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Card, Button, Input, Modal } from "../components/ui/Common";
import {
  Bitcoin,
  Copy,
  CheckCircle2,
  Info,
  Building2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, cn } from "../lib/utils";
import btcQr from "../images/qr-codes/btc-qr.jpeg";
import ethQr from "../images/qr-codes/eth-qr.jpeg";

const methods = [
  {
    id: "btc",
    name: "Bitcoin (BTC)",
    icon: Bitcoin,
    color: "text-orange-500 bg-orange-500/10",
    address: "bc1q0z3q66v3w6wzkaky7zx864eng9rzvffw8ez6mh",
    qrCode: btcQr,
  },
  {
    id: "eth",
    name: "Ethereum (ETH)",
    icon: Bitcoin,
    color: "text-blue-500 bg-blue-500/10",
    address: "Ox4aB12C526ffD71786409378208530bd996343015",
    qrCode: ethQr,
  },
  // {
  //   id: "usdt",
  //   name: "USDT (TRC20)",
  //   icon: Bitcoin,
  //   color: "text-emerald-500 bg-emerald-500/10",
  //   address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
  //   qrCode: "/qr-codes/usdt-qr.jpeg",
  // },
  // {
  //   id: "bank",
  //   name: "Bank Transfer",
  //   icon: Building2,
  //   color: "text-slate-400 bg-slate-400/10",
  //   address: "Account: 1234567890, Bank: Global Trust",
  //   qrCode: null,
  // },
];

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
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { useStore } from "../store/useStore";

export default function Deposit() {
  const { user } = useStore();
  const [step, setStep] = React.useState(1);
  const [selectedMethod, setSelectedMethod] = React.useState(methods[0]);
  const [amount, setAmount] = React.useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
  const [recentDeposits, setRecentDeposits] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "transactions"),
      where("uid", "==", user.uid),
      where("type", "==", "Deposit"),
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
        setRecentDeposits(data);
      },
      (error) => {
        console.error("Snapshot error:", error);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComplete = async () => {
    if (!user || !amount) return;
    setIsLoading(true);
    try {
      await addDoc(collection(db, "transactions"), {
        uid: user.uid,
        type: "Deposit",
        amount: parseFloat(amount),
        status: "Pending",
        date: new Date().toISOString(),
        method: selectedMethod.name,
      });
      setIsSuccessModalOpen(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setAmount("");
    setIsSuccessModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Deposit Funds</h1>
          <p className="text-slate-400">
            Add funds to your wallet to start investing.
          </p>
        </div>

        <Modal
          isOpen={isSuccessModalOpen}
          onClose={reset}
          title="Deposit Initiated"
        >
          <div className="text-center py-8 space-y-4">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
              <CheckCircle2 size={48} />
            </div>
            <h4 className="text-xl font-bold">Request Submitted</h4>
            <p className="text-slate-400">
              Your deposit request for {formatCurrency(parseFloat(amount) || 0)}{" "}
              is being processed. Funds will reflect after confirmation.
            </p>
            <Button className="w-full" onClick={reset}>
              Back to Dashboard
            </Button>
          </div>
        </Modal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <Card>
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-sm font-medium text-slate-300">
                          Select Payment Method
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {methods.map((method) => (
                            <button
                              key={method.id}
                              onClick={() => setSelectedMethod(method)}
                              className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                                selectedMethod.id === method.id
                                  ? "border-emerald-500 bg-emerald-500/5"
                                  : "border-slate-800 hover:border-slate-700",
                              )}
                            >
                              <div
                                className={cn("p-2 rounded-lg", method.color)}
                              >
                                <method.icon size={20} />
                              </div>
                              <span className="font-medium">{method.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-sm font-medium text-slate-300">
                          Deposit Amount ($)
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
                        <div className="flex gap-2">
                          {[100, 500, 1000, 5000].map((val) => (
                            <button
                              key={val}
                              onClick={() => setAmount(val.toString())}
                              className="px-3 py-1 rounded-md bg-slate-800 text-xs text-slate-400 hover:text-white transition-colors"
                            >
                              +${val}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => setStep(2)}
                        disabled={!amount}
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="text-center">
                    <div className="mb-6">
                      <p className="text-slate-400 text-sm mb-1">
                        Send exactly
                      </p>
                      <h2 className="text-3xl font-bold text-emerald-500">
                        {formatCurrency(parseFloat(amount) || 0)}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        via {selectedMethod.name}
                      </p>
                    </div>

                    {/* QR Code — shows per method, hides for bank transfer */}
                    {selectedMethod.qrCode ? (
                      <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto mb-6 flex items-center justify-center">
                        <img
                          src={selectedMethod.qrCode}
                          alt={`${selectedMethod.name} QR Code`}
                          className="w-40 h-40 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl w-48 h-48 mx-auto mb-6 flex flex-col items-center justify-center gap-2">
                        <Building2 size={32} className="text-slate-600" />
                        <p className="text-xs text-slate-500 text-center px-4">
                          Use the bank details below to complete your transfer
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 text-left">
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {selectedMethod.id === "bank"
                          ? "Bank Details"
                          : "Wallet Address"}
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <code className="flex-1 text-xs break-all text-slate-300">
                          {selectedMethod.address}
                        </code>
                        <button
                          onClick={() => handleCopy(selectedMethod.address)}
                          className={cn(
                            "p-2 rounded-lg transition-colors shrink-0",
                            copied
                              ? "text-emerald-500 bg-emerald-500/10"
                              : "hover:bg-slate-800 text-slate-400",
                          )}
                        >
                          {copied ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                      {copied && (
                        <p className="text-xs text-emerald-500 text-center">
                          Copied to clipboard!
                        </p>
                      )}
                    </div>
                  </Card>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                    <Info size={20} className="text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-200/70 leading-relaxed">
                      Please ensure you send the exact amount. Deposits are
                      usually confirmed within 10-30 minutes depending on
                      network congestion.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleComplete}
                      isLoading={isLoading}
                    >
                      I've Made Payment
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <Card>
              <h4 className="font-bold mb-6 flex items-center gap-2">
                <Clock className="text-blue-500" size={18} />
                Recent Deposits
              </h4>
              <div className="space-y-6">
                {recentDeposits.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-slate-500">No recent deposits</p>
                  </div>
                ) : (
                  recentDeposits.map((item, i) => (
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

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex gap-3">
              <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
              <p className="text-xs text-emerald-200 leading-relaxed">
                Your funds are safe. Once confirmed by the network, they will be
                automatically added to your balance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
