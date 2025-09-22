import { FormEvent, useMemo, useState } from "react"
import {
  BookOpen,
  Loader2,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
} from "lucide-react"
import Empty from "@/components/Empty"
import { useTheme } from "@/hooks/useTheme"
import { useNarrativeStore } from "@/hooks/useNarrativeStore"

const inputBaseClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"

export default function Home() {
  const { toggleTheme, isDark } = useTheme()
  const [movieTitle, setMovieTitle] = useState("")
  const [characterName, setCharacterName] = useState("")
  const [promptModifiers, setPromptModifiers] = useState("")
  const [formError, setFormError] = useState<string | undefined>(undefined)

  const status = useNarrativeStore((state) => state.status)
  const story = useNarrativeStore((state) => state.story)
  const error = useNarrativeStore((state) => state.error)
  const meta = useNarrativeStore((state) => state.meta)
  const generateNarrative = useNarrativeStore((state) => state.generateNarrative)
  const reset = useNarrativeStore((state) => state.reset)

  const isLoading = status === "loading"
  const canShowResult = status === "success" && Boolean(story)
  const canShowError = Boolean(formError || error)

  const helperText = useMemo(() => {
    if (status === "loading") {
      return "正在召唤角色叙事，请稍候..."
    }
    if (status === "success") {
      return "生成完成，可复制或继续调参生成新版本。"
    }
    if (status === "error") {
      return "生成失败，请调整输入或稍后再试。"
    }
    return "输入电影名称与角色，AI 将生成第一人称叙事。"
  }, [status])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!movieTitle.trim() || !characterName.trim()) {
      setFormError("请填写电影名称和角色名称。")
      return
    }
    setFormError(undefined)
    await generateNarrative({
      movieTitle: movieTitle.trim(),
      characterName: characterName.trim(),
      promptModifiers: promptModifiers.trim() || undefined,
    })
  }

  const handleReset = () => {
    reset()
    setPromptModifiers("")
  }

  return (
    <div className="min-h-screen bg-neutral-100/60 pb-16 text-slate-900 transition dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pt-12 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium tracking-wide text-slate-500 dark:text-slate-400">
              NPCPro 角色叙事实验室
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              让角色亲述电影故事
            </h1>
          </div>
          <div className="flex items-center gap-3 self-start">
            <a
              href="/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              影片管理
            </a>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:shadow dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              aria-label="切换主题"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              <span>{isDark ? "浅色模式" : "深色模式"}</span>
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-500/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
          >
            <div>
              <h2 className="flex items-center gap-3 text-xl font-semibold">
                <Sparkles className="text-amber-500" size={24} />
                生成角色叙事
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {helperText}
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex flex-col gap-2 text-sm font-medium">
                <span>电影名称</span>
                <input
                  type="text"
                  placeholder="例如：霸王别姬"
                  value={movieTitle}
                  onChange={(event) => setMovieTitle(event.target.value)}
                  className={inputBaseClasses}
                  autoComplete="off"
                  required
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium">
                <span>角色名称</span>
                <input
                  type="text"
                  placeholder="例如：程蝶衣"
                  value={characterName}
                  onChange={(event) => setCharacterName(event.target.value)}
                  className={inputBaseClasses}
                  autoComplete="off"
                  required
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium">
                <span>风格提示（可选）</span>
                <textarea
                  placeholder="补充语气、主题或要强调的剧情片段"
                  value={promptModifiers}
                  onChange={(event) => setPromptModifiers(event.target.value)}
                  rows={4}
                  className={`${inputBaseClasses} resize-none`}
                />
              </label>
            </div>

            {canShowError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
                {formError || error}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-700/60 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <BookOpen size={18} />
                )}
                {isLoading ? "生成中..." : "生成叙事"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/80"
              >
                <RotateCcw size={18} />
                重置状态
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-500/10 dark:border-slate-800 dark:bg-slate-900/70">
              <h3 className="text-lg font-semibold">如何获得最佳效果？</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li>• 尽量使用准确的电影与角色名称。</li>
                <li>• 在风格提示中说明语气、时代背景或关键剧情。</li>
                <li>• 如需重新生成，可调整提示词再提交。</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 text-sm leading-relaxed text-slate-600 shadow dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
              <p className="font-medium text-slate-700 dark:text-slate-200">
                当前状态：
                <span className="ml-1 font-semibold text-slate-900 dark:text-white">
                  {status === "idle" && "待输入"}
                  {status === "loading" && "生成中"}
                  {status === "success" && "生成完成"}
                  {status === "error" && "生成失败"}
                </span>
              </p>
              {meta && (
                <div className="mt-3 space-y-1">
                  {meta.generatedAt && (
                    <p>生成时间：{new Date(meta.generatedAt).toLocaleString()}</p>
                  )}
                  {typeof meta.tokensUsed === "number" && (
                    <p>Token 使用：{meta.tokensUsed}</p>
                  )}
                  {typeof meta.cached === "boolean" && (
                    <p>{meta.cached ? "命中缓存" : "实时生成"}</p>
                  )}
                </div>
              )}
            </div>
          </aside>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-500/10 dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-xl font-semibold">角色叙事输出</h2>
          <div className="mt-4 min-h-[280px] rounded-xl border border-dashed border-slate-300/80 bg-slate-50/40 p-6 dark:border-slate-700 dark:bg-slate-950/40">
            {isLoading && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                <Loader2 className="animate-spin" size={28} />
                <p>正在整理角色视角的叙事...</p>
              </div>
            )}

            {canShowResult && story && (
              <article className="relative h-full overflow-y-auto whitespace-pre-wrap text-base leading-7 text-slate-700 dark:text-slate-200">
                {story}
              </article>
            )}

            {!isLoading && !canShowResult && !canShowError && (
              <div className="h-full">
                <Empty />
              </div>
            )}

            {status === "error" && !formError && error && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-red-500 dark:text-red-300">
                <p>{error}</p>
                <p>请检查网络或稍后重试。</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
