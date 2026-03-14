import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Music,
  Flame,
  Plus,
  Loader2,
  Instagram,
  Twitter,
  Heart,
  Star,
} from "lucide-react";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";

interface Trend {
  _id: Id<"trends">;
  type: string;
  title: string;
  engagement: number;
  platform: string;
  isHot: boolean;
}

interface TrendStats {
  totalTrends: number;
  hotTrends: number;
  hooks: Trend[];
  sounds: Trend[];
  byPlatform: {
    tiktok: number;
    instagram: number;
    twitter: number;
  };
}

export function TrendsDashboard() {
  const stats = useQuery(api.trends.getTrendStats) as TrendStats | null | undefined;
  const addTrend = useMutation(api.trends.add);
  const toggleHot = useMutation(api.trends.toggleHot);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"hooks" | "sounds">("hooks");
  const [newTrend, setNewTrend] = useState({
    type: "hook",
    title: "",
    engagement: 75,
    platform: "tiktok",
    isHot: false,
  });
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrend.title) return;
    setAdding(true);
    try {
      await addTrend({
        type: newTrend.type,
        title: newTrend.title,
        engagement: newTrend.engagement,
        platform: newTrend.platform,
        isHot: newTrend.isHot,
      });
      setNewTrend({
        type: "hook",
        title: "",
        engagement: 75,
        platform: "tiktok",
        isHot: false,
      });
      setShowAddModal(false);
    } finally {
      setAdding(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "tiktok":
        return <Music className="w-4 h-4" />;
      case "instagram":
        return <Instagram className="w-4 h-4" />;
      case "twitter":
        return <Twitter className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "tiktok":
        return "bg-pink-500/10 text-pink-400";
      case "instagram":
        return "bg-purple-500/10 text-purple-400";
      case "twitter":
        return "bg-blue-500/10 text-blue-400";
      default:
        return "bg-zinc-500/10 text-zinc-400";
    }
  };

  if (stats === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
      </div>
    );
  }

  if (!stats || stats.totalTrends === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
          <TrendingUp className="w-10 h-10 text-zinc-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Trends Tracked</h2>
        <p className="text-zinc-500 mb-8 max-w-md">
          Start tracking trending hooks and sounds to stay ahead of the curve.
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Trend
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Trending Now</h1>
          <p className="text-zinc-500 mt-1">Hot hooks and sounds in your niche</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Trend
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
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-zinc-500 text-sm">Total Trends</p>
          <p className="text-2xl font-bold text-white">{stats.totalTrends}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-zinc-500 text-sm">Hot Right Now</p>
          <p className="text-2xl font-bold text-white">{stats.hotTrends}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-zinc-500 text-sm">TikTok</p>
          <p className="text-2xl font-bold text-white">{stats.byPlatform.tiktok}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
              <Instagram className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-zinc-500 text-sm">Instagram</p>
          <p className="text-2xl font-bold text-white">{stats.byPlatform.instagram}</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("hooks")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "hooks"
              ? "bg-white/10 text-white"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          <Heart className="w-4 h-4" />
          Hooks
        </button>
        <button
          onClick={() => setActiveTab("sounds")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "sounds"
              ? "bg-white/10 text-white"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          <Music className="w-4 h-4" />
          Sounds
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(activeTab === "hooks" ? stats.hooks : stats.sounds).map((trend: Trend, index: number) => (
          <motion.div
            key={trend._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 relative overflow-hidden"
          >
            {trend.isHot && (
              <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold rounded-bl-xl flex items-center gap-1">
                <Flame className="w-3 h-3" />
                HOT
              </div>
            )}

            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl ${getPlatformColor(
                  trend.platform
                )} flex items-center justify-center flex-shrink-0`}
              >
                {getPlatformIcon(trend.platform)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-lg leading-tight mb-2">
                  {trend.title}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPlatformColor(trend.platform)}`}>
                    {trend.platform}
                  </span>
                  <span className="text-zinc-500 text-sm">
                    {trend.engagement}% engagement
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleHot({ id: trend._id })}
                className={`p-2 rounded-lg transition-all ${
                  trend.isHot
                    ? "bg-orange-500/10 text-orange-400"
                    : "bg-white/5 text-zinc-500 hover:text-white"
                }`}
              >
                <Star className="w-5 h-5" fill={trend.isHot ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Engagement Bar */}
            <div className="mt-4">
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${trend.engagement}%` }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  className={`h-full rounded-full ${
                    trend.engagement >= 80
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                      : trend.engagement >= 60
                      ? "bg-gradient-to-r from-fuchsia-500 to-violet-500"
                      : "bg-gradient-to-r from-amber-500 to-orange-500"
                  }`}
                />
              </div>
            </div>
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
            <h3 className="text-xl font-bold text-white mb-4">Add Trend</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Type</label>
                <select
                  value={newTrend.type}
                  onChange={(e) => setNewTrend({ ...newTrend, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-fuchsia-500/50"
                >
                  <option value="hook">Hook</option>
                  <option value="sound">Sound</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Title</label>
                <input
                  type="text"
                  value={newTrend.title}
                  onChange={(e) => setNewTrend({ ...newTrend, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-fuchsia-500/50"
                  placeholder={newTrend.type === "hook" ? "POV: You just..." : "Original Sound - Viral Mix"}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Platform</label>
                  <select
                    value={newTrend.platform}
                    onChange={(e) => setNewTrend({ ...newTrend, platform: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-fuchsia-500/50"
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="twitter">Twitter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Engagement %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newTrend.engagement}
                    onChange={(e) => setNewTrend({ ...newTrend, engagement: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-fuchsia-500/50"
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newTrend.isHot}
                  onChange={(e) => setNewTrend({ ...newTrend, isHot: e.target.checked })}
                  className="w-5 h-5 rounded bg-white/5 border-white/10 text-fuchsia-500 focus:ring-fuchsia-500"
                />
                <span className="text-zinc-300">Mark as Hot</span>
              </label>
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
                  {adding ? "Adding..." : "Add Trend"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
