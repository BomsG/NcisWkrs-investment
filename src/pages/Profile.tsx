import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, Button, Input } from '../components/ui/Common';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  Upload,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user } = useStore();
  const [isSaving, setIsSaving] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-slate-400">Manage your personal information and account security.</p>
          </div>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-lg flex items-center gap-2 border border-emerald-500/20"
            >
              <CheckCircle2 size={18} />
              <span className="text-sm font-bold">Changes saved successfully!</span>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <h3 className="text-lg font-bold mb-8">Personal Information</h3>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-emerald-500 text-3xl font-bold uppercase">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-emerald-500 rounded-full text-white hover:bg-emerald-600 transition-colors shadow-lg">
                      <Camera size={16} />
                    </button>
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-xl font-bold">{user?.fullName}</h4>
                    <p className="text-slate-400 text-sm">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'January 2026'}</p>
                    <div className="flex items-center gap-2 mt-2 text-emerald-500">
                      <ShieldCheck size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Verified Account</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <Input defaultValue={user?.fullName} className="pl-12" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <Input defaultValue={user?.email} className="pl-12" readOnly />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <Input defaultValue={user?.phoneNumber || "+1 (555) 000-0000"} className="pl-12" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Country</label>
                    <Input defaultValue={user?.country || "United States"} />
                  </div>
                </div>

                <Button className="mt-4" onClick={handleSave} isLoading={isSaving}>Save Changes</Button>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-bold mb-8">Security & Password</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <Input type="password" placeholder="••••••••" className="pl-12" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <Input type="password" placeholder="••••••••" className="pl-12" />
                    </div>
                  </div>
                </div>
                <Button variant="secondary">Update Password</Button>
              </div>
            </Card>
          </div>

          {/* Right Column: KYC & Status */}
          <div className="space-y-8">
            <Card className="bg-emerald-500/5 border-emerald-500/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold">KYC Verification</h3>
                <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                  Verified
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Your account is fully verified. You have unlimited access to all platform features.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                  <CheckCircle2 className="text-emerald-500" size={20} />
                  <span className="text-sm font-medium">ID Document Uploaded</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                  <CheckCircle2 className="text-emerald-500" size={20} />
                  <span className="text-sm font-medium">Proof of Address Verified</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold mb-6">Account Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Account Type:</span>
                  <span className="font-bold text-emerald-500">VIP Member</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">2FA Status:</span>
                  <span className="font-bold text-emerald-500">Enabled</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Trading Limit:</span>
                  <span className="font-bold">Unlimited</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-8">
                <ShieldCheck className="mr-2" size={18} />
                Security Settings
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

