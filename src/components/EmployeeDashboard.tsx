import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import {
  Users,
  Trophy,
  Target,
  DollarSign,
  Star,
  Plus,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { useState } from "react";

interface Employee {
  _id: string;
  name: string;
  role: string;
  performanceScore: number;
  tasksCompleted: number;
  revenueGenerated: number;
  modelsManaged: string[];
}

interface PerformanceStats {
  totalEmployees: number;
  totalTasks: number;
  totalRevenue: number;
  avgPerformance: number;
  topPerformer: string;
  employees: Employee[];
}

interface Model {
  _id: string;
  name: string;
}

export function EmployeeDashboard() {
  const stats = useQuery(api.employees.getPerformanceStats) as PerformanceStats | null | undefined;
  const [showAddModal, setShowAddModal] = useState(false);
  const addEmployee = useMutation(api.employees.add);
  const [newEmployee, setNewEmployee] = useState({ name: "", role: "", email: "" });
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.role) return;
    setAdding(true);
    try {
      await addEmployee({
        name: newEmployee.name,
        role: newEmployee.role,
        email: newEmployee.email || undefined,
      });
      setNewEmployee({ name: "", role: "", email: "" });
      setShowAddModal(false);
    } finally {
      setAdding(false);
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

  if (stats === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
      </div>
    );
  }

  if (!stats || stats.totalEmployees === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
          <Users className="w-10 h-10 text-zinc-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Team Members Yet</h2>
        <p className="text-zinc-500 mb-8 max-w-md">
          Add your first employee to start tracking team performance.
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Employee
        </button>
      </div>
    );
  }

  const summaryStats = [
    {
      label: "Total Team",
      value: stats.totalEmployees.toString(),
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Avg Performance",
      value: `${stats.avgPerformance}%`,
      icon: Target,
      color: "from-fuchsia-500 to-violet-500",
    },
    {
      label: "Tasks Completed",
      value: stats.totalTasks.toLocaleString(),
      icon: Trophy,
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "from-emerald-500 to-teal-500",
    },
  ];

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 75) return "text-blue-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getPerformanceBarColor = (score: number) => {
    if (score >= 90) return "from-emerald-500 to-teal-500";
    if (score >= 75) return "from-blue-500 to-cyan-500";
    if (score >= 60) return "from-amber-500 to-orange-500";
    return "from-red-500 to-rose-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Team Performance</h1>
          <p className="text-zinc-500 mt-1">Monitor your team's productivity and achievements</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-5"
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}
            >
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <p className="text-zinc-500 text-xs sm:text-sm mb-1">{stat.label}</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Top Performer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-fuchsia-600/10 to-violet-600/10 border border-fuchsia-500/20 rounded-2xl p-5"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center">
            <Star className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm">Top Performer</p>
            <p className="text-xl font-bold text-white">{stats.topPerformer}</p>
          </div>
        </div>
      </motion.div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.employees.map((employee: Employee, index: number) => (
          <motion.div
            key={employee._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg">
                  {employee.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-semibold">{employee.name}</p>
                  <p className="text-zinc-500 text-sm">{employee.role}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-zinc-500" />
              </button>
            </div>

            {/* Performance Score */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-400">Performance</span>
                <span className={`text-lg font-bold ${getPerformanceColor(employee.performanceScore)}`}>
                  {employee.performanceScore}%
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${employee.performanceScore}%` }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                  className={`h-full bg-gradient-to-r ${getPerformanceBarColor(
                    employee.performanceScore
                  )} rounded-full`}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
              <div>
                <p className="text-zinc-500 text-xs">Tasks Done</p>
                <p className="text-white font-semibold">{employee.tasksCompleted}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs">Revenue</p>
                <p className="text-white font-semibold">{formatCurrency(employee.revenueGenerated)}</p>
              </div>
            </div>

            {/* Models */}
            {employee.modelsManaged.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-zinc-500 text-xs mb-2">Managing</p>
                <div className="flex flex-wrap gap-1">
                  {employee.modelsManaged.map((model: string) => (
                    <span
                      key={model}
                      className="px-2 py-1 bg-white/5 rounded-md text-xs text-zinc-300"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#0f0f15] border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Add Team Member</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Name</label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-fuchsia-500/50"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Role</label>
                <input
                  type="text"
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-fuchsia-500/50"
                  placeholder="Account Manager"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Email (optional)</label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-fuchsia-500/50"
                  placeholder="john@agency.com"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 text-zinc-300 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {adding ? "Adding..." : "Add Employee"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
