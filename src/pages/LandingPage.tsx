import React from "react";
import {
  TrendingUp,
  Shield,
  Zap,
  Headphones,
  ArrowRight,
  Globe,
  Lock,
  BarChart3,
  CheckCircle2,
  Users,
  DollarSign,
  Briefcase,
  ArrowDownLeft,
  ArrowUpRight,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Common";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { useStore } from "../store/useStore";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 transition-all group"
  >
    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
      <Icon className="text-emerald-500" size={28} />
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </motion.div>
);

const PlanCard = ({ name, min, max, roi, duration, popular }: any) => {
  const { isAuthenticated } = useStore();

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className={cn(
        "p-8 rounded-[32px] border transition-all relative overflow-hidden",
        popular
          ? "bg-emerald-600 border-emerald-500 shadow-2xl shadow-emerald-500/20"
          : "bg-slate-900/50 border-slate-800 hover:border-emerald-500/50",
      )}
    >
      {popular && (
        <div className="absolute top-0 right-0 bg-white text-emerald-600 text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest">
          Most Popular
        </div>
      )}
      <h3
        className={cn(
          "text-2xl font-bold mb-2",
          popular ? "text-white" : "text-slate-100",
        )}
      >
        {name}
      </h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span
          className={cn(
            "text-4xl font-extrabold",
            popular ? "text-white" : "text-emerald-500",
          )}
        >
          {roi}%
        </span>
        <span
          className={cn(
            "text-sm",
            popular ? "text-emerald-100" : "text-slate-400",
          )}
        >
          ROI
        </span>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center text-sm">
          <span className={popular ? "text-emerald-100" : "text-slate-400"}>
            Min Deposit
          </span>
          <span className="font-bold">${min.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className={popular ? "text-emerald-100" : "text-slate-400"}>
            Max Deposit
          </span>
          <span className="font-bold">${max.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className={popular ? "text-emerald-100" : "text-slate-400"}>
            Duration
          </span>
          <span className="font-bold">{duration} Days</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className={popular ? "text-emerald-100" : "text-slate-400"}>
            Referral Bonus
          </span>
          <span className="font-bold">10%</span>
        </div>
      </div>

      <Link to={isAuthenticated ? "/investment" : "/register"}>
        <Button
          variant={popular ? "secondary" : "primary"}
          className="w-full rounded-2xl h-12 font-bold"
        >
          Choose Plan
        </Button>
      </Link>
    </motion.div>
  );
};

export default function LandingPage() {
  const { isAuthenticated } = useStore();

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-slate-100 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0b0d]/80 backdrop-blur-lg border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tighter">
              NCISWKRS
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <a
              href="#features"
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              About
            </a>
            <a
              href="#plans"
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              Investment Plans
            </a>
            <a
              href="#how-it-works"
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              How it Works
            </a>
            <a
              href="#security"
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              Security
            </a>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button className="rounded-xl">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="rounded-xl">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] bg-emerald-500/10 blur-[120px] rounded-full -z-10"></div>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-semibold mb-6 inline-block border border-emerald-500/20">
              Trusted by 500k+ Investors Worldwide
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Smart Digital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Investment Platform
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Maximize your wealth with our advanced trading algorithms and
              secure investment packages. Start your journey to financial
              freedom today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                <Button size="lg" className="w-full sm:w-auto rounded-2xl px-8">
                  {isAuthenticated ? "Go to Dashboard" : "Create Account"}{" "}
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link to={isAuthenticated ? "/investment" : "/login"}>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto rounded-2xl px-8"
                >
                  {isAuthenticated ? "View Investments" : "View Market Data"}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Market Ticker */}
          <div className="mt-24 overflow-hidden border-y border-slate-800/50 py-6 bg-slate-900/20">
            <div className="flex animate-marquee whitespace-nowrap gap-12">
              {[
                { name: "BTC/USD", price: "64,231.50", change: "+2.4%" },
                { name: "ETH/USD", price: "3,452.12", change: "+1.8%" },
                { name: "SOL/USD", price: "145.20", change: "-0.5%" },
                { name: "AAPL", price: "189.45", change: "+0.3%" },
                { name: "TSLA", price: "175.22", change: "+4.2%" },
                { name: "NVDA", price: "892.10", change: "+1.2%" },
                { name: "XRP/USD", price: "0.62", change: "+0.5%" },
                { name: "ADA/USD", price: "0.45", change: "-1.2%" },
              ].map((coin, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="font-bold">{coin.name}</span>
                  <span className="text-slate-300">${coin.price}</span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      coin.change.startsWith("+")
                        ? "text-emerald-500"
                        : "text-rose-500",
                    )}
                  >
                    {coin.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Total Members", value: "520k+", icon: Users },
            { label: "Total Invested", value: "$4.2B+", icon: DollarSign },
            { label: "Total Paid Out", value: "$1.8B+", icon: Zap },
            { label: "Countries Supported", value: "120+", icon: Globe },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-3xl bg-slate-900/30 border border-slate-800/50"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 text-emerald-500">
                <stat.icon size={24} />
              </div>
              <h4 className="text-3xl font-bold mb-1">{stat.value}</h4>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-slate-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose NCISWKRS?</h2>
            <p className="text-slate-400">
              Experience the next generation of digital asset management.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={Shield}
              title="Secure Trading"
              description="Military-grade encryption and multi-sig wallets to keep your assets safe."
            />
            <FeatureCard
              icon={Zap}
              title="Fast Withdrawals"
              description="Instant processing for all withdrawal requests. Your money, your control."
            />
            <FeatureCard
              icon={BarChart3}
              title="AI Algorithms"
              description="Advanced trading bots that analyze market trends 24/7 for maximum ROI."
            />
            <FeatureCard
              icon={Headphones}
              title="24/7 Support"
              description="Dedicated account managers ready to assist you at any time of the day."
            />
          </div>
        </div>
      </section>

      {/* Investment Plans */}
      <section id="plans" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Investment Plans</h2>
            <p className="text-slate-400">
              Choose the perfect plan that fits your financial goals.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <PlanCard
              name="Starter"
              min={100}
              max={4999}
              roi={15}
              duration={7}
            />
            <PlanCard
              name="Silver"
              min={5000}
              max={19999}
              roi={25}
              duration={14}
              popular
            />
            <PlanCard
              name="Gold"
              min={20000}
              max={49999}
              roi={40}
              duration={30}
            />
            <PlanCard
              name="Diamond"
              min={50000}
              max={1000000}
              roi={65}
              duration={60}
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it Works</h2>
            <p className="text-slate-400">
              Start your investment journey in three simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up for a free account and complete your profile in minutes.",
              },
              {
                step: "02",
                title: "Make Deposit",
                desc: "Choose your preferred payment method and fund your investment wallet.",
              },
              {
                step: "03",
                title: "Start Earning",
                desc: "Select an investment plan and watch your profits grow daily.",
              },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="text-8xl font-black text-emerald-500/5 absolute -top-10 -left-4 group-hover:text-emerald-500/10 transition-colors">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <ArrowDownLeft size={24} />
                </div>
                <h3 className="text-2xl font-bold">Latest Deposits</h3>
              </div>
              <div className="space-y-4">
                {[
                  {
                    user: "Alex M.",
                    amount: 2500,
                    date: "Just now",
                    method: "BTC",
                  },
                  {
                    user: "Sarah K.",
                    amount: 12000,
                    date: "2 mins ago",
                    method: "ETH",
                  },
                  {
                    user: "John D.",
                    amount: 500,
                    date: "5 mins ago",
                    method: "USDT",
                  },
                  {
                    user: "Elena R.",
                    amount: 45000,
                    date: "12 mins ago",
                    method: "BTC",
                  },
                ].map((tx, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-slate-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm">
                        {tx.user[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{tx.user}</p>
                        <p className="text-xs text-slate-500">
                          {tx.date} via {tx.method}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-emerald-500">
                      +${tx.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <ArrowUpRight size={24} />
                </div>
                <h3 className="text-2xl font-bold">Latest Withdrawals</h3>
              </div>
              <div className="space-y-4">
                {[
                  {
                    user: "Michael S.",
                    amount: 1200,
                    date: "1 min ago",
                    method: "BTC",
                  },
                  {
                    user: "Linda W.",
                    amount: 5600,
                    date: "4 mins ago",
                    method: "USDT",
                  },
                  {
                    user: "Robert P.",
                    amount: 23000,
                    date: "8 mins ago",
                    method: "ETH",
                  },
                  {
                    user: "Sophia G.",
                    amount: 800,
                    date: "15 mins ago",
                    method: "BTC",
                  },
                ].map((tx, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-slate-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm">
                        {tx.user[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{tx.user}</p>
                        <p className="text-xs text-slate-500">
                          {tx.date} via {tx.method}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-rose-500">
                      -${tx.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-slate-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Investors Say</h2>
            <p className="text-slate-400">
              Join thousands of satisfied users worldwide.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "David Chen",
                role: "Crypto Trader",
                content:
                  "The AI algorithms are truly impressive. I've seen consistent returns over the last 6 months without having to monitor the markets constantly.",
              },
              {
                name: "Sarah Johnson",
                role: "Business Owner",
                content:
                  "Customer support is top-notch. My account manager helped me set up a diversified portfolio that matches my risk tolerance perfectly.",
              },
              {
                name: "Marcus Weber",
                role: "Tech Engineer",
                content:
                  "The security features gave me the confidence to invest a significant portion of my savings. The withdrawal process is incredibly fast.",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 relative"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-emerald-500 text-emerald-500"
                    />
                  ))}
                </div>
                <p className="text-slate-400 italic mb-6">"{t.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Market Widget */}
      <section className="py-24 bg-slate-900/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Real-Time Market Analysis
            </h2>
            <p className="text-slate-400">
              Track global market movements with our advanced real-time data
              engine.
            </p>
          </div>
          <div className="h-[600px] rounded-[32px] overflow-hidden border border-slate-800 shadow-2xl">
            <iframe
              src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_76d87&symbol=BINANCE%3ABTCUSDT&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=BINANCE%3ABTCUSDT"
              style={{ width: "100%", height: "100%", border: "none" }}
            ></iframe>
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative rounded-[40px] overflow-hidden border border-slate-800 shadow-2xl group">
                <img
                  src="https://picsum.photos/seed/trading/1200/800"
                  alt="Platform Showcase"
                  className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 cursor-pointer hover:scale-110 transition-transform">
                    <TrendingUp size={32} />
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold">
                <Shield size={16} /> Trusted Infrastructure
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Built for the Next Generation of Investors
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Our platform combines institutional-grade security with an
                intuitive user interface. Whether you're a seasoned trader or
                just starting, we provide the tools you need to succeed in the
                digital economy.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <h4 className="text-2xl font-bold text-white mb-1">99.9%</h4>
                  <p className="text-sm text-slate-500">Platform Uptime</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-1">
                    256-bit
                  </h4>
                  <p className="text-sm text-slate-500">AES Encryption</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl"></div>
              <img
                src="https://picsum.photos/seed/about/800/600"
                alt="About NCISWKRS"
                className="rounded-[40px] border border-slate-800 shadow-2xl relative z-10"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-8 -right-8 p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-20 hidden md:block">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                    <Shield size={20} />
                  </div>
                  <span className="font-bold">Regulated & Secure</span>
                </div>
                <p className="text-xs text-slate-500">
                  Operating under strict financial <br />
                  guidelines since 2018.
                </p>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2">
            <span className="text-emerald-500 font-bold uppercase tracking-widest text-sm mb-4 block">
              Our Story
            </span>
            <h2 className="text-4xl font-bold mb-6">
              Redefining Digital Wealth Management
            </h2>
            <p className="text-slate-400 text-lg mb-6 leading-relaxed">
              Founded in 2018, NCISWKRS was born out of a vision to democratize
              high-frequency trading and digital asset management. We believe
              that professional-grade investment tools should be accessible to
              everyone, not just institutional giants.
            </p>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Our team of expert traders and AI engineers have developed a
              platform that combines human intuition with machine precision,
              delivering consistent results in even the most volatile market
              conditions.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                <h4 className="text-2xl font-bold text-emerald-500 mb-1">
                  8+ Years
                </h4>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                  Market Experience
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                <h4 className="text-2xl font-bold text-emerald-500 mb-1">
                  99.9%
                </h4>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                  Platform Uptime
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 px-6">
        <div className="max-w-7xl mx-auto bg-emerald-500/5 border border-emerald-500/10 rounded-[40px] p-12 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <h2 className="text-4xl font-bold mb-6">Uncompromising Security</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              We prioritize the safety of your investments above all else. Our
              platform utilizes the latest security protocols to ensure a
              worry-free trading experience.
            </p>
            <div className="space-y-4">
              {[
                { icon: Lock, text: "Two-Factor Authentication (2FA)" },
                { icon: Globe, text: "Global SSL Encryption" },
                { icon: Shield, text: "Cold Storage Wallets" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <item.icon size={20} />
                  </div>
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="w-full aspect-square bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl absolute inset-0"></div>
            <img
              src="https://picsum.photos/seed/security/800/800"
              alt="Security"
              className="relative z-10 rounded-3xl border border-slate-800 shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 border-y border-slate-800 bg-slate-900/30">
        <div className="container mx-auto px-6">
          <p className="text-center text-slate-500 text-sm font-bold uppercase tracking-widest mb-12">
            Trusted by Global Industry Leaders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {[
              "Binance",
              "Coinbase",
              "Blockchain.com",
              "Kraken",
              "Gemini",
              "Bitstamp",
            ].map((partner) => (
              <div
                key={partner}
                className="text-2xl font-black tracking-tighter text-slate-400"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-[#0a0b0d]" id="faq">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-400">
                Everything you need to know about the platform and investment
                process.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: "How do I start investing?",
                  a: "To start, simply create an account, complete your profile, and make your first deposit using any of our supported payment methods.",
                },
                {
                  q: "What is the minimum deposit?",
                  a: "The minimum deposit depends on the plan you choose. Our Starter plan begins at just $100.",
                },
                {
                  q: "How long does withdrawal take?",
                  a: "Withdrawals are typically processed within 24 hours. Most crypto withdrawals are confirmed within minutes of approval.",
                },
                {
                  q: "Is my investment safe?",
                  a: "Yes, we use industry-leading security protocols, cold storage for assets, and are fully regulated in multiple jurisdictions.",
                },
                {
                  q: "Can I have multiple accounts?",
                  a: "No, to prevent fraud and maintain platform integrity, we only allow one account per individual.",
                },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-all group"
                >
                  <h4 className="text-lg font-bold mb-2 flex items-center justify-between">
                    {faq.q}
                    <span className="text-emerald-500 group-hover:rotate-90 transition-transform">
                      +
                    </span>
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5 -skew-y-3 origin-right"></div>
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Stay Updated with Market Insights
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Subscribe to our newsletter to receive weekly market analysis,
              platform updates, and exclusive investment opportunities.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <Button size="lg">Subscribe Now</Button>
            </form>
            <p className="text-xs text-slate-500 mt-6">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center bg-gradient-to-br from-emerald-600 to-cyan-700 rounded-[40px] p-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 border-4 border-white rounded-full"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Start Your <br />
            Investment Journey?
          </h2>
          <p className="text-emerald-50/80 text-lg mb-12 max-w-2xl mx-auto">
            Join NCISWKRS today and start earning daily profits from the global
            digital asset market.
          </p>
          <Link to={isAuthenticated ? "/dashboard" : "/register"}>
            <Button
              size="lg"
              variant="secondary"
              className="rounded-2xl px-12 h-14 text-lg font-bold"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Now"}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white" size={18} />
                </div>
                <span className="text-xl font-bold tracking-tighter">
                  NCISWKRS
                </span>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed">
                NCISWKRS is a leading digital asset management platform
                providing secure and profitable investment solutions for
                individuals and institutions worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li>
                  <a
                    href="#features"
                    className="hover:text-emerald-500 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#plans"
                    className="hover:text-emerald-500 transition-colors"
                  >
                    Investment Plans
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-emerald-500 transition-colors"
                  >
                    How it Works
                  </a>
                </li>
                <li>
                  <a
                    href="#security"
                    className="hover:text-emerald-500 transition-colors"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Contact</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li>support@nciswkrs.com</li>
                <li>123 Investment Way, Financial District</li>
                <li>London, United Kingdom</li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-slate-500 text-sm">
              © 2026 NCISWKRS Investment Scheme. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
