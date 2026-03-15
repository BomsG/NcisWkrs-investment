import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Card } from "../components/ui/Common";
import { TrendingUp, Mail, Lock, User, Phone, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useStore } from "../store/useStore";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Invalid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      const user = userCredential.user;
      console.log("✅ Auth created:", user.uid);

      // Create user document in Firestore
      const referralCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: data.name,
        email: data.email,
        phoneNumber: data.phone,
        balance: 0,
        activeInvestments: 0,
        totalProfit: 0,
        totalDeposits: 0,
        referralCode: referralCode,
        referredBy: data.referralCode || null,
        role: "user",
        createdAt: new Date().toISOString(),
      });

      navigate("/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-white">
              NCISWKRS
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400">Join 500k+ investors worldwide</p>
        </div>

        <Card className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    size={18}
                  />
                  <Input
                    {...register("name")}
                    placeholder="John Doe"
                    className="pl-12"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-rose-500">
                    {errors.name.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    size={18}
                  />
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="name@example.com"
                    className="pl-12"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-500">
                    {errors.email.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    size={18}
                  />
                  <Input
                    {...register("phone")}
                    placeholder="+1 (555) 000-0000"
                    className="pl-12"
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-rose-500">
                    {errors.phone.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Referral Code (Optional)
                </label>
                <Input {...register("referralCode")} placeholder="CODE123" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    size={18}
                  />
                  <Input
                    {...register("password")}
                    type="password"
                    placeholder="••••••••"
                    className="pl-12"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-500">
                    {errors.password.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    size={18}
                  />
                  <Input
                    {...register("confirmPassword")}
                    type="password"
                    placeholder="••••••••"
                    className="pl-12"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-500">
                    {errors.confirmPassword.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 rounded border-slate-800 bg-[#0a0b0d] text-emerald-500 focus:ring-emerald-500/20"
                required
              />
              <label htmlFor="terms" className="text-sm text-slate-400">
                I agree to the{" "}
                <a href="#" className="text-emerald-500 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-emerald-500 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Create Account <ArrowRight className="ml-2" size={20} />
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-emerald-500 font-bold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
