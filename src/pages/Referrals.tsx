import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, Button, Input } from '../components/ui/Common';
import { 
  Users, 
  Gift, 
  Copy, 
  CheckCircle2,
  Share2,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useStore } from '../store/useStore';

export default function Referrals() {
  const { user } = useStore();
  const [referrals, setReferrals] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode || ''}`;

  React.useEffect(() => {
    if (!user?.referralCode) return;
    const q = query(
      collection(db, 'users'),
      where('referredBy', '==', user.referralCode),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReferrals(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referral Program</h1>
          <p className="text-slate-400">Invite your friends and earn commissions on their investments.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-emerald-500/5 border-emerald-500/20">
            <div className="flex flex-col md:flex-row items-center gap-8 p-4">
              <div className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 shrink-0">
                <Gift size={64} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">Earn up to 10% Commission</h2>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Share your unique referral link with your network. When they join and invest, you receive a percentage of their investment instantly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Input readOnly value={referralLink} className="pr-12 bg-slate-900/50" />
                    <button 
                      onClick={copyToClipboard}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-emerald-500 hover:text-emerald-400 transition-colors"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                  <Button className="shrink-0">
                    <Share2 className="mr-2" size={18} />
                    Share Link
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold mb-6">Your Stats</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                    <UserPlus size={18} />
                  </div>
                  <span className="text-slate-400 text-sm">Total Referrals</span>
                </div>
                <span className="text-xl font-bold">{referrals.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                    <TrendingUp size={18} />
                  </div>
                  <span className="text-slate-400 text-sm">Active Referrals</span>
                </div>
                <span className="text-xl font-bold">{referrals.filter(r => r.activeInvestments > 0).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                    <Gift size={18} />
                  </div>
                  <span className="text-slate-400 text-sm">Total Earnings</span>
                </div>
                <span className="text-xl font-bold text-emerald-500">
                  {formatCurrency(referrals.reduce((acc, r) => acc + (r.activeInvestments || 0) * 0.1, 0))}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <h3 className="text-lg font-bold mb-8">Recent Referrals</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-sm border-b border-slate-800">
                  <th className="pb-4 font-medium">Name</th>
                  <th className="pb-4 font-medium">Date Joined</th>
                  <th className="pb-4 font-medium">Total Invested</th>
                  <th className="pb-4 font-medium">Commission Earned</th>
                  <th className="pb-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">Loading referrals...</td>
                  </tr>
                ) : referrals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">No referrals yet. Share your link to start earning!</td>
                  </tr>
                ) : (
                  referrals.map((ref, i) => (
                    <tr key={i} className="group hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 font-medium">{ref.fullName}</td>
                      <td className="py-4 text-slate-400 text-sm">{new Date(ref.createdAt).toLocaleDateString()}</td>
                      <td className="py-4">{formatCurrency(ref.activeInvestments || 0)}</td>
                      <td className="py-4 text-emerald-500 font-bold">+{formatCurrency((ref.activeInvestments || 0) * 0.1)}</td>
                      <td className="py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                          ref.activeInvestments > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-800 text-slate-500"
                        )}>
                          {ref.activeInvestments > 0 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

