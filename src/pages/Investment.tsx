import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, Button, Input, Modal } from '../components/ui/Common';
import { TrendingUp, CheckCircle2, Clock, ShieldCheck, Wallet, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, cn } from '../lib/utils';

const plans = [
  {
    name: 'Starter Plan',
    min: 100,
    max: 999,
    roi: 1.5,
    duration: 7,
    color: 'emerald'
  },
  {
    name: 'Premium Growth',
    min: 1000,
    max: 4999,
    roi: 2.5,
    duration: 15,
    color: 'blue'
  },
  {
    name: 'Crypto Alpha',
    min: 5000,
    max: 19999,
    roi: 3.8,
    duration: 30,
    color: 'indigo'
  },
  {
    name: 'Institutional',
    min: 20000,
    max: 100000,
    roi: 5.2,
    duration: 60,
    color: 'emerald'
  }
];

import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { useStore } from '../store/useStore';

export default function Investment() {
  const { user } = useStore();
  const [selectedPlan, setSelectedPlan] = React.useState<any>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [amount, setAmount] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleInvest = async () => {
    if (!user || !amount || !selectedPlan) return;
    const investAmount = parseFloat(amount);
    
    if (investAmount < selectedPlan.min) {
      setError(`Minimum investment for this plan is ${formatCurrency(selectedPlan.min)}`);
      return;
    }
    
    if (investAmount > user.balance) {
      setError("Insufficient balance. Please deposit funds first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Create Investment record
      await addDoc(collection(db, 'investments'), {
        uid: user.uid,
        planName: selectedPlan.name,
        amount: investAmount,
        roi: selectedPlan.roi,
        duration: selectedPlan.duration,
        startDate: new Date().toISOString(),
        status: 'active',
        lastAccrual: new Date().toISOString(),
      });

      // 2. Create Transaction record
      await addDoc(collection(db, 'transactions'), {
        uid: user.uid,
        type: 'Investment',
        amount: investAmount,
        status: 'Completed',
        date: new Date().toISOString(),
        method: selectedPlan.name,
      });

      // 3. Update User balance and stats
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        balance: increment(-investAmount),
        activeInvestments: increment(investAmount),
      });

      setIsSuccess(true);
      setAmount('');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'investments');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investment Plans</h1>
          <p className="text-slate-400">Choose a package that fits your financial goals.</p>
        </div>

        <Modal 
          isOpen={isSuccess} 
          onClose={() => setIsSuccess(false)} 
          title="Investment Confirmed"
        >
          <div className="text-center py-8 space-y-4">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
              <CheckCircle2 size={48} />
            </div>
            <h4 className="text-xl font-bold">Plan Activated!</h4>
            <p className="text-slate-400">Your investment of {formatCurrency(parseFloat(amount) || 0)} in the {selectedPlan?.name} has been started.</p>
            <Button className="w-full" onClick={() => setIsSuccess(false)}>View Dashboard</Button>
          </div>
        </Modal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="relative"
            >
              <Card className={cn(
                "h-full flex flex-col border-2 transition-all",
                selectedPlan?.name === plan.name ? "border-emerald-500 bg-emerald-500/5" : "border-slate-800/50"
              )}>
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-emerald-500">{plan.roi}%</span>
                    <span className="text-slate-500 text-sm">Daily ROI</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Min Deposit:</span>
                    <span className="font-medium">{formatCurrency(plan.min)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Max Deposit:</span>
                    <span className="font-medium">{formatCurrency(plan.max)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Duration:</span>
                    <span className="font-medium">{plan.duration} Days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Return:</span>
                    <span className="font-medium text-emerald-500">{(plan.roi * plan.duration).toFixed(1)}%</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  variant={selectedPlan?.name === plan.name ? 'primary' : 'outline'}
                  onClick={() => setSelectedPlan(plan)}
                >
                  Select Plan
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Available Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(user?.balance || 0)}</p>
              </div>
            </div>
            
            {selectedPlan ? (
              <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-right">
                  <p className="text-xs text-emerald-500 uppercase font-bold tracking-wider">Minimum Required</p>
                  <p className="text-xl font-bold">{formatCurrency(selectedPlan.min)}</p>
                </div>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  (user?.balance || 0) >= selectedPlan.min ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                )}>
                  {(user?.balance || 0) >= selectedPlan.min ? <Check size={20} /> : <AlertCircle size={20} />}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Select a plan to see requirements</p>
            )}
          </div>
        </Card>

        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="max-w-2xl mx-auto border-emerald-500/30 bg-emerald-500/5">
              <h3 className="text-xl font-bold mb-6">Invest in {selectedPlan.name}</h3>
              {error && (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Investment Amount ($)</label>
                  <Input 
                    type="number" 
                    placeholder={`Min: ${selectedPlan.min}`} 
                    min={selectedPlan.min} 
                    max={selectedPlan.max}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <p className="text-xs text-slate-500">Available Balance: {formatCurrency(user?.balance || 0)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Daily Profit</p>
                    <p className="font-bold text-emerald-500">
                      {formatCurrency((parseFloat(amount) || 0) * (selectedPlan.roi / 100))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Total Profit</p>
                    <p className="font-bold text-emerald-500">
                      {formatCurrency((parseFloat(amount) || 0) * (selectedPlan.roi / 100) * selectedPlan.duration)}
                    </p>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleInvest} isLoading={isLoading}>Confirm Investment</Button>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            { icon: ShieldCheck, title: 'Capital Protection', desc: 'Your initial investment is 100% protected by our insurance fund.' },
            { icon: Clock, title: 'Instant Accruals', desc: 'Profits are added to your account balance every 24 hours.' },
            { icon: CheckCircle2, title: 'Easy Exit', desc: 'Withdraw your principal and profits anytime after the plan duration.' }
          ].map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <item.icon size={24} />
              </div>
              <div>
                <h4 className="font-bold mb-1">{item.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

