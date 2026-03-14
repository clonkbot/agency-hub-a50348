import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  Download,
  Plus,
  Calendar,
  Loader2,
} from "lucide-react";

type Period = "day" | "month" | "year";

interface Model {
  _id: string;
  name: string;
  platform: string;
  niche: string;
  monthlyRevenue: number;
  subscriberCount: number;
  status: string;
}

export function MainDashboard() {
  const [period, setPeriod] = useState<Period>("month");
  const overview = useQuery(api.dashboard.getFinancialOverview, { period });
  const models = useQuery(api.dashboard.getModels);
  const seedData = useMutation(api.dashboard.seedDemoData);
  const [seeding, setSeeding] = useState(false);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await seedData();
    } finally {
      setSeeding(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const periodLabels: Record<Period, string> = {
    day: "Today",
    month: "This Month",
    year: "This Year",
  };

  if (overview === undefined || models === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
      </div>
    );
  }

  // Show empty state with seed button if no data
  if (!overview || overview.totalRevenue === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
          <Download className="w-10 h-10 text-zinc-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to Agency Hub</h2>
        <p className="text-zinc-500 mb-8 max-w-md">
          Get started by loading demo data to explore all features, or add your own data manually.
        </p>
        <button
          onClick={handleSeedData}
          disabled={seeding}
          className="px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {seeding ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading Demo Data...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Load Demo Data
            </>
          )}
        </button>
      </div>
    );
  }

  const stats = [
    {
      label: "Revenue",
      value: formatCurrency(overview.totalRevenue),
      icon: DollarSign,
      color: "from-emerald-500 to-teal-500",
      trend: "+12.5%",
      up: true,
    },
    {
      label: "Costs",
      value: formatCurrency(overview.totalCosts),
      icon: Wallet,
      color: "from-orange-500 to-amber-500",
      trend: "-3.2%",
      up: false,
    },
    {
      label: "Profit",
      value: formatCurrency(overview.profit),
      icon: overview.profit >= 0 ? TrendingUp : TrendingDown,
      color: overview.profit >= 0 ? "from-fuchsia-500 to-violet-500" : "from-red-500 to-rose-500",
      trend: `${overview.profitMargin.toFixed(1)}% margin`,
      up: overview.profit >= 0,
    },
    {
      label: "Active Models",
      value: (models as Model[]).filter((m: Model) => m.status === "active").length.toString(),
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      trend: `${models.length} total`,
      up: true,
    },
  ];

  const revenueEntries = Object.entries(overview.revenueBySource) as [string, number][];
  const totalRevenue = revenueEntries.reduce((sum, [, val]) => sum + val, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Overview</h1>
          <p className="text-zinc-500 mt-1">Track your agency performance in real-time</p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl">
          {(["day", "month", "year"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span
                className={`text-sm font-medium ${
                  stat.up ? "text-emerald-400" : "text-orange-400"
                }`}
              >
                {stat.trend}
              </span>
            </div>
            <p className="text-zinc-500 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Revenue vs Costs</h3>
            <Calendar className="w-5 h-5 text-zinc-500" />
          </div>
          <div className="h-64 sm:h-80">
            {overview.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overview.chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={12}
                    tickFormatter={(v: string) => v.split("/").slice(0, 2).join("/")}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={12}
                    tickFormatter={(v: number) => `$${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10,10,15,0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      padding: "12px",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#d946ef"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="costs"
                    stroke="#f97316"
                    fillOpacity={1}
                    fill="url(#colorCosts)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500">
                No chart data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Revenue by Source */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-5"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by Model</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {revenueEntries
              .sort((a, b) => b[1] - a[1])
              .map(([source, amount], index) => {
                const percentage = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
                return (
                  <div key={source}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400 truncate">{source}</span>
                      <span className="text-white font-medium">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-fuchsia-500 to-violet-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      </div>

      {/* Models Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Active Models</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-zinc-300 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Model</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">
                  Model
                </th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                  Niche
                </th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">
                  Revenue
                </th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                  Subscribers
                </th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {(models as Model[]).map((model: Model) => (
                <tr key={model._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center text-white font-semibold">
                        {model.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{model.name}</p>
                        <p className="text-zinc-500 text-sm">{model.platform}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-zinc-400 hidden sm:table-cell">{model.niche}</td>
                  <td className="px-5 py-4 text-white font-medium">
                    {formatCurrency(model.monthlyRevenue)}
                  </td>
                  <td className="px-5 py-4 text-zinc-400 hidden md:table-cell">
                    {model.subscriberCount.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        model.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : model.status === "paused"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {model.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
