import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Lightbulb,
  FileText,
  MessageSquare,
  Zap,
  Heart,
  Copy,
  Check,
  Trash2,
  Loader2,
  Star,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";

interface ContentItem {
  _id: Id<"generatedContent">;
  modelName: string;
  type: string;
  content: string;
  createdAt: number;
  isFavorite: boolean;
}

interface Model {
  _id: string;
  name: string;
}

export function ContentGenerator() {
  const models = useQuery(api.dashboard.getModels) as Model[] | undefined;
  const content = useQuery(api.content.list) as ContentItem[] | undefined;
  const favorites = useQuery(api.content.getFavorites) as ContentItem[] | undefined;
  const generate = useMutation(api.content.generate);
  const toggleFavorite = useMutation(api.content.toggleFavorite);
  const remove = useMutation(api.content.remove);

  const [selectedModel, setSelectedModel] = useState("");
  const [selectedType, setSelectedType] = useState<"idea" | "script" | "caption" | "hook">("idea");
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"generate" | "saved">("generate");

  const handleGenerate = async () => {
    if (!selectedModel) return;
    setGenerating(true);
    try {
      await generate({
        modelName: selectedModel,
        type: selectedType,
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const contentTypes = [
    { id: "idea", label: "Content Ideas", icon: Lightbulb, color: "from-amber-500 to-orange-500" },
    { id: "script", label: "DM Scripts", icon: FileText, color: "from-fuchsia-500 to-violet-500" },
    { id: "caption", label: "Captions", icon: MessageSquare, color: "from-blue-500 to-cyan-500" },
    { id: "hook", label: "Hooks", icon: Zap, color: "from-emerald-500 to-teal-500" },
  ] as const;

  if (models === undefined || content === undefined || favorites === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
      </div>
    );
  }

  const recentContent = content
    .filter((c: ContentItem) => c.modelName === selectedModel || !selectedModel)
    .sort((a: ContentItem, b: ContentItem) => b.createdAt - a.createdAt)
    .slice(0, 10);

  const getTypeInfo = (type: string) => {
    return contentTypes.find((t) => t.id === type) || contentTypes[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Content Generator</h1>
          <p className="text-zinc-500 mt-1">Create engaging content for your models</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("generate")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "generate"
              ? "bg-white/10 text-white"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Generate
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "saved"
              ? "bg-white/10 text-white"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          <Heart className="w-4 h-4" />
          Saved ({favorites.length})
        </button>
      </div>

      {activeTab === "generate" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generator Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 bg-white/[0.03] border border-white/10 rounded-2xl p-5 h-fit"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-fuchsia-400" />
              Generator
            </h3>

            <div className="space-y-4">
              {/* Model Select */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Select Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-fuchsia-500/50"
                >
                  <option value="">Choose a model</option>
                  {models.map((model: Model) => (
                    <option key={model._id} value={model.name}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content Type */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Content Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {contentTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                        selectedType === type.id
                          ? "bg-white/10 border-fuchsia-500/50 text-white"
                          : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      <type.icon className="w-4 h-4" />
                      <span className="text-sm">{type.label.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!selectedModel || generating}
                className="w-full py-3.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Content
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Generated Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            <h3 className="text-lg font-semibold text-white">Recent Generations</h3>

            {recentContent.length === 0 ? (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-zinc-600" />
                </div>
                <p className="text-zinc-400">No content generated yet</p>
                <p className="text-zinc-600 text-sm mt-1">Select a model and type to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {recentContent.map((item: ContentItem, index: number) => {
                    const typeInfo = getTypeInfo(item.type);
                    return (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white/[0.03] border border-white/10 rounded-2xl p-5"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeInfo.color} flex items-center justify-center`}
                            >
                              <typeInfo.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{typeInfo.label}</p>
                              <p className="text-zinc-500 text-sm">{item.modelName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleFavorite({ id: item._id })}
                              className={`p-2 rounded-lg transition-all ${
                                item.isFavorite
                                  ? "bg-pink-500/10 text-pink-400"
                                  : "hover:bg-white/10 text-zinc-500"
                              }`}
                            >
                              <Heart
                                className="w-4 h-4"
                                fill={item.isFavorite ? "currentColor" : "none"}
                              />
                            </button>
                            <button
                              onClick={() => handleCopy(item._id, item.content)}
                              className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 transition-all"
                            >
                              {copiedId === item._id ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => remove({ id: item._id })}
                              className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-red-400 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-zinc-300 leading-relaxed">{item.content}</p>
                        <p className="text-zinc-600 text-xs mt-3">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        /* Saved Content */
        <div className="space-y-4">
          {favorites.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-zinc-400">No saved content yet</p>
              <p className="text-zinc-600 text-sm mt-1">Heart your favorite generations to save them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {favorites.map((item: ContentItem, index: number) => {
                  const typeInfo = getTypeInfo(item.type);
                  return (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold rounded-bl-xl flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        SAVED
                      </div>

                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeInfo.color} flex items-center justify-center flex-shrink-0`}
                        >
                          <typeInfo.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{typeInfo.label}</p>
                          <p className="text-zinc-500 text-sm">{item.modelName}</p>
                        </div>
                      </div>
                      <p className="text-zinc-300 leading-relaxed mb-4">{item.content}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-zinc-600 text-xs">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopy(item._id, item.content)}
                            className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 transition-all"
                          >
                            {copiedId === item._id ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => toggleFavorite({ id: item._id })}
                            className="p-2 bg-pink-500/10 text-pink-400 rounded-lg transition-all"
                          >
                            <Heart className="w-4 h-4" fill="currentColor" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
