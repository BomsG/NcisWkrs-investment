import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Card, Button, Input } from "../components/ui/Common";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { useStore } from "../store/useStore";
import { cn } from "../lib/utils";

const ID_TYPES = [
  "Passport",
  "Driver's License",
  "National ID",
  "Residence Permit",
];
const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Switzerland",
  "Singapore",
  "Japan",
  "South Korea",
  "New Zealand",
  "Other",
];

export default function KYC() {
  const { user } = useStore();
  const [kyc, setKyc] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [form, setForm] = React.useState({
    fullName: user?.fullName || "",
    dateOfBirth: "",
    country: "",
    idType: "Passport",
    idNumber: "",
  });

  React.useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = onSnapshot(doc(db, "kyc", user.uid), (snap) => {
      if (snap.exists()) setKyc(snap.data());
      else setKyc(null);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const handleSubmit = async () => {
    if (
      !user ||
      !form.fullName ||
      !form.dateOfBirth ||
      !form.country ||
      !form.idNumber
    )
      return;
    setIsLoading(true);
    try {
      await setDoc(doc(db, "kyc", user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: form.fullName,
        dateOfBirth: form.dateOfBirth,
        country: form.country,
        idType: form.idType,
        idNumber: form.idNumber,
        status: "Pending",
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
        rejectionReason: null,
      });
      setIsSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `kyc/${user.uid}`);
    } finally {
      setIsLoading(false);
    }
  };

  const StatusBanner = () => {
    if (!kyc) return null;
    if (kyc.status === "Pending")
      return (
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-4">
          <Clock className="text-blue-500 shrink-0" size={24} />
          <div>
            <p className="font-bold text-blue-400">Verification Pending</p>
            <p className="text-xs text-slate-400">
              Your KYC submission is under review. This usually takes 24-48
              hours.
            </p>
          </div>
        </div>
      );
    if (kyc.status === "Approved")
      return (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-4">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
          <div>
            <p className="font-bold text-emerald-400">Identity Verified</p>
            <p className="text-xs text-slate-400">
              Your account is fully verified. You can now make withdrawals.
            </p>
          </div>
        </div>
      );
    if (kyc.status === "Rejected")
      return (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-4">
          <XCircle className="text-rose-500 shrink-0" size={24} />
          <div>
            <p className="font-bold text-rose-400">Verification Rejected</p>
            <p className="text-xs text-slate-400">
              {kyc.rejectionReason ||
                "Your submission was rejected. Please resubmit with correct information."}
            </p>
          </div>
        </div>
      );
    return null;
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-emerald-500" size={32} />
            Identity Verification
          </h1>
          <p className="text-slate-400 mt-1">
            Complete KYC verification to unlock withdrawals.
          </p>
        </div>

        <StatusBanner />

        {/* Steps */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { step: "01", label: "Fill Form", done: !!kyc },
            {
              step: "02",
              label: "Under Review",
              done: kyc?.status === "Approved" || kyc?.status === "Rejected",
            },
            { step: "03", label: "Verified", done: kyc?.status === "Approved" },
          ].map((s, i) => (
            <div
              key={i}
              className={cn(
                "p-4 rounded-xl border text-center",
                s.done
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-slate-800 bg-slate-900/30",
              )}
            >
              <p
                className={cn(
                  "text-2xl font-black mb-1",
                  s.done ? "text-emerald-500" : "text-slate-700",
                )}
              >
                {s.step}
              </p>
              <p
                className={cn(
                  "text-xs font-bold",
                  s.done ? "text-emerald-400" : "text-slate-500",
                )}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Form — show if no KYC or rejected */}
        {(!kyc || kyc.status === "Rejected") && (
          <Card className="space-y-6">
            <h3 className="font-bold text-lg">Personal Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Full Legal Name
                </label>
                <Input
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  placeholder="As on your ID"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Date of Birth
                </label>
                <Input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) =>
                    setForm({ ...form, dateOfBirth: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Country of Residence
                </label>
                <select
                  className="w-full bg-[#0a0b0d] border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  ID Type
                </label>
                <select
                  className="w-full bg-[#0a0b0d] border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  value={form.idType}
                  onChange={(e) => setForm({ ...form, idType: e.target.value })}
                >
                  {ID_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-300">
                  ID Number
                </label>
                <Input
                  value={form.idNumber}
                  onChange={(e) =>
                    setForm({ ...form, idNumber: e.target.value })
                  }
                  placeholder="Enter your ID number"
                />
              </div>
            </div>

            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex gap-3">
              <AlertCircle className="text-blue-500 shrink-0" size={18} />
              <p className="text-xs text-slate-400 leading-relaxed">
                Your information is encrypted and stored securely. It is only
                used for identity verification purposes and will never be shared
                with third parties.
              </p>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={
                !form.fullName ||
                !form.dateOfBirth ||
                !form.country ||
                !form.idNumber
              }
            >
              <ShieldCheck className="mr-2" size={18} />
              Submit for Verification
            </Button>
          </Card>
        )}

        {/* Pending state details */}
        {kyc && kyc.status === "Pending" && (
          <Card className="space-y-4">
            <h3 className="font-bold text-lg">Submitted Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Full Name", value: kyc.fullName },
                { label: "Date of Birth", value: kyc.dateOfBirth },
                { label: "Country", value: kyc.country },
                { label: "ID Type", value: kyc.idType },
                { label: "ID Number", value: kyc.idNumber },
                {
                  label: "Submitted",
                  value: new Date(kyc.submittedAt).toLocaleDateString(),
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-900/50 rounded-xl border border-slate-800"
                >
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Approved state */}
        {kyc && kyc.status === "Approved" && (
          <Card className="text-center py-8 space-y-4">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="text-emerald-500" size={40} />
            </div>
            <h3 className="text-xl font-bold text-emerald-400">
              Account Fully Verified
            </h3>
            <p className="text-slate-400 text-sm">
              Your identity has been verified. You can now make unlimited
              withdrawals.
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
