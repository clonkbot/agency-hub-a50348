import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  ListTodo,
  Plus,
  MoreVertical,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";

interface Task {
  _id: Id<"modelTasks">;
  modelName: string;
  taskTitle: string;
  status: string;
  priority: string;
  category: string;
}

interface TaskByModel {
  modelName: string;
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  completionRate: number;
}

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completionRate: number;
  tasksByModel: TaskByModel[];
  tasks: Task[];
}

interface Model {
  _id: string;
  name: string;
}

export function TasksDashboard() {
  const stats = useQuery(api.tasks.getTaskStats) as TaskStats | null | undefined;
  const models = useQuery(api.dashboard.getModels) as Model[] | undefined;
  const addTask = useMutation(api.tasks.add);
  const updateStatus = useMutation(api.tasks.updateStatus);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "completed">("all");
  const [newTask, setNewTask] = useState({
    modelName: "",
    taskTitle: "",
    priority: "medium",
    category: "content",
  });
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.modelName || !newTask.taskTitle) return;
    setAdding(true);
    try {
      await addTask({
        modelName: newTask.modelName,
        taskTitle: newTask.taskTitle,
        priority: newTask.priority,
        category: newTask.category,
      });
      setNewTask({ modelName: "", taskTitle: "", priority: "medium", category: "content" });
      setShowAddModal(false);
    } finally {
      setAdding(false);
    }
  };

  const handleStatusChange = async (taskId: Id<"modelTasks">, status: string) => {
    await updateStatus({ id: taskId, status });
  };

  if (stats === undefined || models === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
      </div>
    );
  }

  if (!stats || stats.totalTasks === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
          <ListTodo className="w-10 h-10 text-zinc-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Tasks Yet</h2>
        <p className="text-zinc-500 mb-8 max-w-md">
          Create your first task to start tracking model activities.
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>
    );
  }

  const filteredTasks = stats.tasks.filter((task: Task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-amber-400" />;
      default:
        return <Circle className="w-5 h-5 text-zinc-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "content":
        return "from-fuchsia-500 to-violet-500";
      case "engagement":
        return "from-blue-500 to-cyan-500";
      case "promo":
        return "from-amber-500 to-orange-500";
      default:
        return "from-zinc-500 to-zinc-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Model Tasks</h1>
          <p className="text-zinc-500 mt-1">Track and manage tasks across all models</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-zinc-500 text-sm">Total Tasks</p>
          <p className="text-2xl font-bold text-white">{stats.totalTasks}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-zinc-500 text-sm">Completed</p>
          <p className="text-2xl font-bold text-white">{stats.completedTasks}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-zinc-500 text-sm">In Progress</p>
          <p className="text-2xl font-bold text-white">{stats.inProgressTasks}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-zinc-500 text-sm">Completion Rate</p>
          <p className="text-2xl font-bold text-white">{stats.completionRate}%</p>
        </motion.div>
      </div>

      {/* Tasks by Model */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/[0.03] border border-white/10 rounded-2xl p-5"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Progress by Model</h3>
        <div className="space-y-4">
          {stats.tasksByModel.map((model: TaskByModel, index: number) => (
            <div key={model.modelName}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">{model.modelName}</span>
                <span className="text-zinc-400 text-sm">
                  {model.completed}/{model.total} tasks ({model.completionRate}%)
                </span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${model.completionRate}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-fuchsia-500 to-violet-500 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl w-fit">
        {(["all", "pending", "in_progress", "completed"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === status
                ? "bg-white/10 text-white"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            {status === "in_progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task: Task, index: number) => (
          <motion.div
            key={task._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-center gap-4"
          >
            <button
              onClick={() =>
                handleStatusChange(
                  task._id,
                  task.status === "completed"
                    ? "pending"
                    : task.status === "pending"
                    ? "in_progress"
                    : "completed"
                )
              }
              className="flex-shrink-0"
            >
              {getStatusIcon(task.status)}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p
                  className={`text-white font-medium ${
                    task.status === "completed" ? "line-through opacity-50" : ""
                  }`}
                >
                  {task.taskTitle}
                </p>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-zinc-500">{task.modelName}</span>
                <span className="text-zinc-700">•</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-xs bg-gradient-to-r ${getCategoryColor(
                    task.category
                  )} text-white`}
                >
                  {task.category}
                </span>
              </div>
            </div>

            <button className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors">
              <MoreVertical className="w-4 h-4 text-zinc-500" />
            </button>
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
            <h3 className="text-xl font-bold text-white mb-4">Add Task</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Model</label>
                <select
                  value={newTask.modelName}
                  onChange={(e) => setNewTask({ ...newTask, modelName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-fuchsia-500/50"
                  required
                >
                  <option value="">Select model</option>
                  {models.map((model: Model) => (
                    <option key={model._id} value={model.name}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Task Title</label>
                <input
                  type="text"
                  value={newTask.taskTitle}
                  onChange={(e) => setNewTask({ ...newTask, taskTitle: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-fuchsia-500/50"
                  placeholder="Create weekly content calendar"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-fuchsia-500/50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Category</label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-fuchsia-500/50"
                  >
                    <option value="content">Content</option>
                    <option value="engagement">Engagement</option>
                    <option value="promo">Promo</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
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
                  {adding ? "Adding..." : "Add Task"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
