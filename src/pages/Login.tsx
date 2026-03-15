import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Card } from "../components/ui/Common";
import { TrendingUp, Mail, Lock, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useStore } from "../store/useStore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthReady } = useStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ✅ Redirect to dashboard when auth is confirmed
  React.useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isAuthReady]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      // ✅ No navigate here — useEffect above handles it once store is ready
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-white">
              NCISWKRS
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">
            Enter your credentials to access your account
          </p>
        </div>

        <Card className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs text-emerald-500 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="rounded border-slate-800 bg-[#0a0b0d] text-emerald-500 focus:ring-emerald-500/20"
              />
              <label htmlFor="remember" className="text-sm text-slate-400">
                Remember me for 30 days
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Sign In <ArrowRight className="ml-2" size={20} />
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-emerald-500 font-bold hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
