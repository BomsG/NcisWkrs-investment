import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Card, Button, Input } from "../components/ui/Common";
import {
  MessageCircle,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { useStore } from "../store/useStore";
import { cn } from "../lib/utils";

const CATEGORIES = [
  "Deposit Issue",
  "Withdrawal Issue",
  "Account Issue",
  "Investment Issue",
  "KYC Issue",
  "Other",
];

export default function Support() {
  const { user } = useStore();
  const [tickets, setTickets] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [expandedTicket, setExpandedTicket] = React.useState<string | null>(
    null,
  );
  const [form, setForm] = React.useState({
    subject: "",
    category: "Other",
    message: "",
  });

  React.useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, "tickets"), where("uid", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      setTickets(docs);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const handleSubmit = async () => {
    if (!user || !form.subject || !form.message) return;
    setIsLoading(true);
    try {
      await addDoc(collection(db, "tickets"), {
        uid: user.uid,
        email: user.email,
        fullName: user.fullName,
        subject: form.subject,
        category: form.category,
        message: form.message,
        status: "Open",
        adminReply: null,
        createdAt: new Date().toISOString(),
        repliedAt: null,
      });
      setForm({ subject: "", category: "Other", message: "" });
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "tickets");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <MessageCircle className="text-emerald-500" size={32} />
            Support Center
          </h1>
          <p className="text-slate-400 mt-1">
            Submit a ticket and our team will respond within 24 hours.
          </p>
        </div>

        {/* Submit Ticket */}
        <Card className="space-y-6">
          <h3 className="font-bold text-lg">New Support Ticket</h3>

          {isSubmitted && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
              <p className="text-sm text-emerald-400 font-medium">
                Ticket submitted successfully! We'll get back to you soon.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Subject
              </label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief description of your issue"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Category
              </label>
              <select
                className="w-full bg-[#0a0b0d] border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Message
            </label>
            <textarea
              className="w-full bg-[#0a0b0d] border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
              rows={5}
              placeholder="Describe your issue in detail..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!form.subject || !form.message}
          >
            <Send size={16} className="mr-2" />
            Submit Ticket
          </Button>
        </Card>

        {/* Ticket History */}
        {tickets.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Your Tickets</h3>
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="p-0 overflow-hidden">
                <button
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
                  onClick={() =>
                    setExpandedTicket(
                      expandedTicket === ticket.id ? null : ticket.id,
                    )
                  }
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        ticket.status === "Open"
                          ? "bg-blue-500"
                          : "bg-emerald-500",
                      )}
                    />
                    <div>
                      <p className="font-bold text-sm">{ticket.subject}</p>
                      <p className="text-xs text-slate-500">
                        {ticket.category} ·{" "}
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                        ticket.status === "Open"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-emerald-500/10 text-emerald-400",
                      )}
                    >
                      {ticket.status}
                    </span>
                    {expandedTicket === ticket.id ? (
                      <ChevronUp size={16} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400" />
                    )}
                  </div>
                </button>

                {expandedTicket === ticket.id && (
                  <div className="px-5 pb-5 space-y-4 border-t border-slate-800">
                    <div className="pt-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Your Message
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        {ticket.message}
                      </p>
                    </div>

                    {ticket.adminReply ? (
                      <div>
                        <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">
                          Support Reply
                        </p>
                        <p className="text-sm text-slate-300 leading-relaxed bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                          {ticket.adminReply}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-2">
                          Replied on{" "}
                          {new Date(ticket.repliedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock size={14} />
                        Awaiting response from support team
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
