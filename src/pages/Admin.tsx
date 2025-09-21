import { FormEvent, useEffect, useMemo, useState } from "react"
import {
  BookMarked,
  Moon,
  FileAudio,
  FileText,
  Film,
  Loader2,
  Users,
  Sun,
} from "lucide-react"
import {
  Character,
  Movie,
  MovieDialogueFile,
  MovieScript,
} from "@/lib/types"
import {
  createCharacter,
  createMovie,
  createMovieDialogue,
  createMovieScript,
  deleteCharacter,
  deleteMovie,
  deleteMovieDialogue,
  deleteMovieScript,
  fetchCharacters,
  fetchMovieDialogues,
  fetchMovieScripts,
  fetchMovies,
  updateCharacter,
  updateMovie,
} from "@/lib/api"
import { useTheme } from "@/hooks/useTheme"

type AdminSectionKey = "movies" | "scripts" | "dialogues" | "characters"

interface MenuItem {
  key: AdminSectionKey
  label: string
  description: string
  icon: React.ReactNode
}

const menuItems: MenuItem[] = [
  {
    key: "movies",
    label: "影片管理",
    description: "维护影片基础信息、简介和类型。",
    icon: <Film className="h-5 w-5" />,
  },
  {
    key: "scripts",
    label: "剧情管理",
    description: "上传整部影片剧情或剧本文本。",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    key: "dialogues",
    label: "对白管理",
    description: "上传或查看影片对白稿。",
    icon: <FileAudio className="h-5 w-5" />,
  },
  {
    key: "characters",
    label: "角色管理",
    description: "维护角色档案、别名、演员等信息。",
    icon: <Users className="h-5 w-5" />,
  },
]

const cardContainerClass =
  "rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-500/10 transition dark:border-slate-800 dark:bg-slate-950/60 dark:shadow-black/40"
const listCardClass =
  "rounded-xl border border-slate-200 bg-white/80 p-4 transition dark:border-slate-800 dark:bg-slate-900/60"
const inputBaseClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-400/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
const textareaBaseClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-400/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
const fileInputClass =
  "mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-amber-500/90 file:px-3 file:py-2 file:text-slate-900 hover:file:bg-amber-400 dark:text-slate-300"
const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-300"
const selectBaseClass =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-400/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"

function formatDateTime(value?: string | null) {
  if (!value) return "-"
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function splitLinesCount(text: string): number {
  if (!text) return 0
  return text.split(/\r?\n/).filter((line) => line.trim().length > 0).length
}

export default function Admin() {
  const { toggleTheme, isDark } = useTheme()
  const [activeSection, setActiveSection] = useState<AdminSectionKey>("movies")
  const [movies, setMovies] = useState<Movie[]>([])
  const [loadingMovies, setLoadingMovies] = useState(false)
  const [globalError, setGlobalError] = useState<string | undefined>()

  useEffect(() => {
    const loadMovies = async () => {
      setLoadingMovies(true)
      setGlobalError(undefined)
      try {
        const data = await fetchMovies()
        setMovies(data)
      } catch (error) {
        setGlobalError(error instanceof Error ? error.message : "加载影片失败")
      } finally {
        setLoadingMovies(false)
      }
    }

    void loadMovies()
  }, [])

  const SectionComponent = useMemo(() => {
    switch (activeSection) {
      case "movies":
        return (
          <MovieManager
            movies={movies}
            setMovies={setMovies}
            loading={loadingMovies}
            setGlobalError={setGlobalError}
          />
        )
      case "scripts":
        return (
          <ScriptManager
            movies={movies}
            setGlobalError={setGlobalError}
          />
        )
      case "dialogues":
        return (
          <DialogueManager
            movies={movies}
            setGlobalError={setGlobalError}
          />
        )
      case "characters":
        return (
          <CharacterManager
            movies={movies}
            setGlobalError={setGlobalError}
          />
        )
      default:
        return null
    }
  }, [activeSection, loadingMovies, movies])

  return (
    <div className="min-h-screen bg-neutral-100/60 text-slate-900 transition dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-68 shrink-0 border-r border-slate-200 bg-white/90 backdrop-blur transition dark:border-slate-800 dark:bg-slate-950/60">
          <div className="px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-500/80 dark:text-amber-300/80">
              NPCPro 管理后台
            </p>
            <h1 className="mt-2 text-2xl font-semibold">资料维护面板</h1>
          </div>
          <nav className="mt-2 flex flex-col gap-1 px-4">
            {menuItems.map((item) => {
              const isActive = item.key === activeSection
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveSection(item.key)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                    isActive
                      ? "bg-amber-100 text-amber-700 shadow-sm dark:bg-amber-400/20 dark:text-amber-200"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70"
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-200">
                    {item.icon}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                      {item.description}
                    </span>
                  </span>
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto bg-white/80 px-8 py-8 transition dark:bg-slate-900/70">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{menuItems.find((item) => item.key === activeSection)?.label}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {menuItems.find((item) => item.key === activeSection)?.description}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              <span>{isDark ? "浅色模式" : "深色模式"}</span>
            </button>
          </div>

          {globalError && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
              {globalError}
            </div>
          )}
          {SectionComponent}
        </main>
      </div>
    </div>
  )
}

interface MovieManagerProps {
  movies: Movie[]
  setMovies: (movies: Movie[]) => void
  loading: boolean
  setGlobalError: (value?: string) => void
}

function MovieManager({ movies, setMovies, loading, setGlobalError }: MovieManagerProps) {
  const [formState, setFormState] = useState<MoviePayload>({
    title: "",
    originalTitle: "",
    releaseYear: undefined,
    language: "",
    runtimeMinutes: undefined,
    genres: [],
    posterUrl: "",
    synopsis: "",
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formState.title.trim()) {
      setGlobalError("影片标题不能为空")
      return
    }

    setSubmitting(true)
    setGlobalError(undefined)
    try {
      const payload: MoviePayload = {
        ...formState,
        title: formState.title.trim(),
        originalTitle: formState.originalTitle?.trim() || null,
        language: formState.language?.trim() || null,
        posterUrl: formState.posterUrl?.trim() || null,
        synopsis: formState.synopsis?.trim() || null,
        genres: formState.genres?.filter(Boolean),
      }
      let result: Movie
      if (editingId) {
        result = await updateMovie(editingId, payload)
        setMovies(movies.map((movie) => (movie.id === editingId ? result : movie)))
      } else {
        result = await createMovie(payload)
        setMovies([result, ...movies])
      }
      setFormState({
        title: "",
        originalTitle: "",
        releaseYear: undefined,
        language: "",
        runtimeMinutes: undefined,
        genres: [],
        posterUrl: "",
        synopsis: "",
      })
      setEditingId(null)
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : "保存影片失败")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("确定删除该影片及其相关资料吗？")) {
      return
    }
    setGlobalError(undefined)
    try {
      await deleteMovie(id)
      setMovies(movies.filter((movie) => movie.id !== id))
      if (editingId === id) {
        setEditingId(null)
      }
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : "删除影片失败")
    }
  }

  return (
    <section className="space-y-8">
      <header>
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-amber-200">
          <Film className="h-6 w-6" />
          影片管理
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          创建或更新影片基本信息，支持维护类型、上映年份与剧情简介。
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <div className={cardContainerClass}>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {editingId ? "编辑影片" : "新增影片"}
          </h3>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className={labelClass}>
                影片标题
                <input
                  type="text"
                  value={formState.title}
                  onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                  className={inputBaseClass}
                  required
                />
              </label>
              <label className={labelClass}>
                原始片名
                <input
                  type="text"
                  value={formState.originalTitle ?? ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, originalTitle: event.target.value }))}
                  className={inputBaseClass}
                />
              </label>
              <label className={labelClass}>
                上映年份
                <input
                  type="number"
                  value={formState.releaseYear ?? ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, releaseYear: Number(event.target.value) || undefined }))}
                  className={inputBaseClass}
                  min={1895}
                  max={2100}
                />
              </label>
              <label className={labelClass}>
                语言
                <input
                  type="text"
                  value={formState.language ?? ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, language: event.target.value }))}
                  className={inputBaseClass}
                />
              </label>
              <label className={labelClass}>
                片长（分钟）
                <input
                  type="number"
                  value={formState.runtimeMinutes ?? ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, runtimeMinutes: Number(event.target.value) || undefined }))}
                  className={inputBaseClass}
                  min={1}
                  max={600}
                />
              </label>
              <label className={labelClass}>
                类型（逗号分隔）
                <input
                  type="text"
                  value={formState.genres?.join(", ") ?? ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, genres: event.target.value.split(/,|，/).map((item) => item.trim()).filter(Boolean) }))}
                  className={inputBaseClass}
                />
              </label>
              <label className={`${labelClass} md:col-span-2`}>
                海报链接
                <input
                  type="url"
                  value={formState.posterUrl ?? ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, posterUrl: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                />
              </label>
              <label className={`${labelClass} md:col-span-2`}>
                剧情简介
                <textarea
                  value={formState.synopsis ?? ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, synopsis: event.target.value }))}
                  rows={4}
                  className={textareaBaseClass}
                />
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-amber-500/60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookMarked className="h-4 w-4" />}
                {editingId ? "保存修改" : "创建影片"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="text-sm text-slate-400 hover:text-slate-200"
                  onClick={() => {
                    setEditingId(null)
                    setFormState({
                      title: "",
                      originalTitle: "",
                      releaseYear: undefined,
                      language: "",
                      runtimeMinutes: undefined,
                      genres: [],
                      posterUrl: "",
                      synopsis: "",
                    })
                  }}
                >
                  取消编辑
                </button>
              )}
            </div>
          </form>
        </div>

        <div className={cardContainerClass}>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">影片列表</h3>
          {loading ? (
            <div className="mt-6 flex items-center gap-3 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> 正在加载影片...
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {movies.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">暂无影片数据，请先录入。</p>
              ) : (
                movies.map((movie) => (
                  <div
                    key={movie.id}
                    className={listCardClass}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{movie.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">ID: {movie.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200"
                          onClick={() => {
                            setEditingId(movie.id)
                            setFormState({
                              title: movie.title,
                              originalTitle: movie.originalTitle ?? "",
                              releaseYear: movie.releaseYear ?? undefined,
                              language: movie.language ?? "",
                              runtimeMinutes: movie.runtimeMinutes ?? undefined,
                              genres: movie.genres ?? [],
                              posterUrl: movie.posterUrl ?? "",
                              synopsis: movie.synopsis ?? "",
                            })
                          }}
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:border-red-400 hover:text-red-200"
                          onClick={() => handleDelete(movie.id)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-slate-500 dark:text-slate-400 md:grid-cols-2">
                      <span>原始片名：{movie.originalTitle || "-"}</span>
                      <span>年份：{movie.releaseYear || "-"}</span>
                      <span>语言：{movie.language || "-"}</span>
                      <span>片长：{movie.runtimeMinutes ? `${movie.runtimeMinutes} 分钟` : "-"}</span>
                      <span>类型：{movie.genres && movie.genres.length ? movie.genres.join(" / ") : "-"}</span>
                      <span>更新时间：{formatDateTime(movie.updatedAt)}</span>
                    </div>
                    {movie.synopsis && (
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                        {movie.synopsis}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

interface ScriptManagerProps {
  movies: Movie[]
  setGlobalError: (value?: string) => void
}

function ScriptManager({ movies, setGlobalError }: ScriptManagerProps) {
  const [selectedMovieId, setSelectedMovieId] = useState<string>("")
  const [scripts, setScripts] = useState<MovieScript[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [scriptTitle, setScriptTitle] = useState("")
  const [plotText, setPlotText] = useState("")
  const [screenplayText, setScreenplayText] = useState("")
  const [createdBy, setCreatedBy] = useState("")

  useEffect(() => {
    if (!selectedMovieId) {
      setScripts([])
      return
    }
    const loadScripts = async () => {
      setLoading(true)
      setGlobalError(undefined)
      try {
        const data = await fetchMovieScripts(selectedMovieId)
        setScripts(data)
      } catch (error) {
        setGlobalError(error instanceof Error ? error.message : "加载剧本失败")
      } finally {
        setLoading(false)
      }
    }
    void loadScripts()
  }, [selectedMovieId, setGlobalError])

  const handleFileRead = async (file: File, setter: (value: string) => void) => {
    const text = await file.text()
    setter(text)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedMovieId) {
      setGlobalError("请先选择影片")
      return
    }
    if (!screenplayText.trim()) {
      setGlobalError("剧本文本不能为空")
      return
    }

    setUploading(true)
    setGlobalError(undefined)
    try {
      const payload = {
        movieId: selectedMovieId,
        scriptTitle: scriptTitle.trim() || null,
        plotText: plotText.trim() || null,
        screenplayText,
        createdBy: createdBy.trim() || null,
      }
      const result = await createMovieScript(payload)
      setScripts([result, ...scripts])
      setScriptTitle("")
      setPlotText("")
      setScreenplayText("")
      setCreatedBy("")
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : "上传剧本失败")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("确认删除该剧本记录？")) {
      return
    }
    setGlobalError(undefined)
    try {
      await deleteMovieScript(id)
      setScripts(scripts.filter((item) => item.id !== id))
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : "删除剧本失败")
    }
  }

  return (
    <section className="space-y-8">
      <header>
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-amber-200">
          <FileText className="h-6 w-6" />
          剧情与剧本管理
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          支持上传剧情梗概与完整剧本文字文件，系统将以文本形式存储于数据库。
        </p>
      </header>

      <div className={cardContainerClass}>
        <div className="grid gap-4 md:grid-cols-[260px,1fr]">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              选择影片
              <select
                className={selectBaseClass}
                value={selectedMovieId}
                onChange={(event) => setSelectedMovieId(event.target.value)}
              >
                <option value="">请选择影片</option>
                {movies.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              建议使用 UTF-8 编码的纯文本文件（.txt、.md 等）。上传后内容将直接存入数据库。
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className={labelClass}>
                剧本标题（可选）
                <input
                  type="text"
                  value={scriptTitle}
                  onChange={(event) => setScriptTitle(event.target.value)}
                  className={inputBaseClass}
                />
              </label>
              <label className={labelClass}>
                上传人（可选）
                <input
                  type="text"
                  value={createdBy}
                  onChange={(event) => setCreatedBy(event.target.value)}
                  className={inputBaseClass}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className={labelClass}>
                剧情文本文件（可选）
                <input
                  type="file"
                  accept=".txt,.md,.json,.csv"
                  className={fileInputClass}
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) {
                      void handleFileRead(file, setPlotText)
                    }
                  }}
                />
              </label>
              <label className={labelClass}>
                剧本文本文件（必选）
                <input
                  type="file"
                  accept=".txt,.md,.json,.csv"
                  className={fileInputClass}
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) {
                      void handleFileRead(file, setScreenplayText)
                      if (!scriptTitle) {
                        setScriptTitle(file.name.replace(/\.[^.]+$/, ""))
                      }
                    }
                  }}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className={labelClass}>
                剧情文本预览
                <textarea
                  value={plotText}
                  onChange={(event) => setPlotText(event.target.value)}
                  rows={6}
                  placeholder="可粘贴或编辑剧情概要，将与剧本文本一同保存"
                  className={textareaBaseClass}
                />
              </label>
              <label className={labelClass}>
                剧本文本预览（必填）
                <textarea
                  value={screenplayText}
                  onChange={(event) => setScreenplayText(event.target.value)}
                  rows={6}
                  placeholder="上传文件后会自动填充，可继续调整。"
                  className={textareaBaseClass}
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedMovieId}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-amber-500/60"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              上传剧本
            </button>
          </form>
        </div>
      </div>

      <div className={cardContainerClass}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">已有剧本</h3>
        {selectedMovieId ? (
          loading ? (
            <div className="mt-6 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> 正在加载...
            </div>
          ) : scripts.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">暂无剧本记录，可通过上方表单上传。</p>
          ) : (
            <div className="mt-4 space-y-3">
              {scripts.map((item) => (
                <div key={item.id} className={listCardClass}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{item.scriptTitle || "未命名剧本"}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">上传人：{item.createdBy || "-"}</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:border-red-400 hover:text-red-200"
                      onClick={() => handleDelete(item.id)}
                    >
                      删除
                    </button>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-500 dark:text-slate-400 md:grid-cols-2">
                    <span>剧情字数：{item.plotText ? item.plotText.length : 0}</span>
                    <span>剧本字数：{item.screenplayText.length}</span>
                    <span>更新时间：{formatDateTime(item.updatedAt)}</span>
                  </div>
                  {item.plotText && (
                    <details className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                      <summary className="cursor-pointer text-amber-600 dark:text-amber-300">展开剧情文本</summary>
                      <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-100 p-3 text-xs text-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
                        {item.plotText}
                      </pre>
                    </details>
                  )}
                  <details className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    <summary className="cursor-pointer text-amber-600 dark:text-amber-300">展开剧本文本</summary>
                    <pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-100 p-3 text-xs text-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
                      {item.screenplayText}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )
        ) : (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">请选择影片以查看或上传剧本。</p>
        )}
      </div>
    </section>
  )
}

interface DialogueManagerProps {
  movies: Movie[]
  setGlobalError: (value?: string) => void
}

function DialogueManager({ movies, setGlobalError }: DialogueManagerProps) {
  const [selectedMovieId, setSelectedMovieId] = useState<string>("")
  const [dialogues, setDialogues] = useState<MovieDialogueFile[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState("")
  const [dialogueText, setDialogueText] = useState("")
  const [createdBy, setCreatedBy] = useState("")

  useEffect(() => {
    if (!selectedMovieId) {
      setDialogues([])
      return
    }
    const load = async () => {
      setLoading(true)
      setGlobalError(undefined)
      try {
        const data = await fetchMovieDialogues(selectedMovieId)
        setDialogues(data)
      } catch (error) {
        setGlobalError(error instanceof Error ? error.message : "加载对白失败")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [selectedMovieId, setGlobalError])

  const handleFileChange = async (file: File) => {
    const text = await file.text()
    setDialogueText(text)
    setFileName(file.name)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedMovieId) {
      setGlobalError("请先选择影片")
      return
    }
    if (!dialogueText.trim()) {
      setGlobalError("对白文本不能为空")
      return
    }

    setUploading(true)
    setGlobalError(undefined)
    try {
      const payload = {
        movieId: selectedMovieId,
        fileName: fileName.trim() || null,
        dialogueText,
        totalLines: splitLinesCount(dialogueText),
        createdBy: createdBy.trim() || null,
      }
      const result = await createMovieDialogue(payload)
      setDialogues([result, ...dialogues])
      setFileName("")
      setDialogueText("")
      setCreatedBy("")
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : "上传对白失败")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("确认删除该对白文件？")) {
      return
    }
    setGlobalError(undefined)
    try {
      await deleteMovieDialogue(id)
      setDialogues(dialogues.filter((item) => item.id !== id))
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : "删除对白失败")
    }
  }

  return (
    <section className="space-y-8">
      <header>
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-amber-200">
          <FileAudio className="h-6 w-6" />
          对白管理
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          上传按时间顺序整理的对白脚本，系统将以文本形式保存，方便后续分段处理。
        </p>
      </header>

      <div className={cardContainerClass}>
        <div className="grid gap-4 md:grid-cols-[260px,1fr]">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              选择影片
              <select
                className={selectBaseClass}
                value={selectedMovieId}
                onChange={(event) => setSelectedMovieId(event.target.value)}
              >
                <option value="">请选择影片</option>
                {movies.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              对白文本将按行计算总行数，以辅助后续分段。建议每行包含时间戳或角色说明。
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className={labelClass}>
                文件名（可选）
                <input
                  type="text"
                  value={fileName}
                  onChange={(event) => setFileName(event.target.value)}
                  className={inputBaseClass}
                  placeholder="如：对白_终稿.txt"
                />
              </label>
              <label className={labelClass}>
                上传人（可选）
                <input
                  type="text"
                  value={createdBy}
                  onChange={(event) => setCreatedBy(event.target.value)}
                  className={inputBaseClass}
                />
              </label>
            </div>

            <label className={labelClass}>
              上传对白文本文件
              <input
                type="file"
                accept=".txt,.md,.json,.csv"
                className={fileInputClass}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) {
                    void handleFileChange(file)
                  }
                }}
              />
            </label>

            <label className={labelClass}>
              对白文本预览
              <textarea
                value={dialogueText}
                onChange={(event) => setDialogueText(event.target.value)}
                rows={8}
                placeholder="可直接粘贴对白内容或通过文件上传"
                className={textareaBaseClass}
                required
              />
            </label>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span>当前对白行数：{splitLinesCount(dialogueText)}</span>
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedMovieId}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-amber-500/60"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileAudio className="h-4 w-4" />}
              上传对白
            </button>
          </form>
        </div>
      </div>

      <div className={cardContainerClass}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">对白档案</h3>
        {selectedMovieId ? (
          loading ? (
            <div className="mt-6 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> 正在加载...
            </div>
          ) : dialogues.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">暂无对白文件，可通过上方表单上传。</p>
          ) : (
            <div className="mt-4 space-y-3">
              {dialogues.map((item) => (
                <div key={item.id} className={listCardClass}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{item.fileName || "未命名对白"}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">上传人：{item.createdBy || "-"}</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:border-red-400 hover:text-red-200"
                      onClick={() => handleDelete(item.id)}
                    >
                      删除
                    </button>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-500 dark:text-slate-400 md:grid-cols-2">
                    <span>对白字数：{item.dialogueText.length}</span>
                    <span>对白行数：{item.totalLines ?? splitLinesCount(item.dialogueText)}</span>
                    <span>更新时间：{formatDateTime(item.updatedAt)}</span>
                  </div>
                  <details className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    <summary className="cursor-pointer text-amber-600 dark:text-amber-300">展开对白文本</summary>
                    <pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-100 p-3 text-xs text-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
                      {item.dialogueText}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )
        ) : (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">请选择影片以查看对白档案。</p>
        )}
      </div>
    </section>
  )
}

interface CharacterManagerProps {
  movies: Movie[]
  setGlobalError: (value?: string) => void
}

function CharacterManager({ movies, setGlobalError }: CharacterManagerProps) {
  const [selectedMovieId, setSelectedMovieId] = useState<string>("")
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formState, setFormState] = useState({
    name: "",
    aliases: "",
    actorName: "",
    description: "",
    traits: "",
    isPrimary: false,
    createdBy: "",
    updatedBy: "",
  })

  useEffect(() => {
    if (!selectedMovieId) {
      setCharacters([])
      return
    }
    const load = async () => {
      setLoading(true)
      setGlobalError(undefined)
      try {
        const data = await fetchCharacters(selectedMovieId)
        setCharacters(data)
      } catch (error) {
        setGlobalError(error instanceof Error ? error.message : "加载角色失败")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [selectedMovieId, setGlobalError])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedMovieId) {
      setGlobalError("请先选择影片")
      return
    }
    if (!formState.name.trim()) {
      setGlobalError("角色名称不能为空")
      return
    }

    setSubmitting(true)
    setGlobalError(undefined)
    try {
      const payload = {
        movieId: selectedMovieId,
        name: formState.name.trim(),
        aliases: formState.aliases
          .split(/,|，/)
          .map((item) => item.trim())
          .filter(Boolean),
        actorName: formState.actorName.trim() || null,
        description: formState.description.trim() || null,
        traits: formState.traits
          ? JSON.parse(formState.traits)
          : undefined,
        isPrimary: formState.isPrimary,
        createdBy: formState.createdBy.trim() || null,
        updatedBy: formState.updatedBy.trim() || null,
      }
      let result: Character
      if (editingId) {
        result = await updateCharacter(editingId, payload)
        setCharacters(characters.map((item) => (item.id === editingId ? result : item)))
      } else {
        result = await createCharacter(payload)
        setCharacters([result, ...characters])
      }
      setEditingId(null)
      setFormState({
        name: "",
        aliases: "",
        actorName: "",
        description: "",
        traits: "",
        isPrimary: false,
        createdBy: "",
        updatedBy: "",
      })
    } catch (error) {
      if (error instanceof Error && /JSON/.test(error.message)) {
        setGlobalError("特质字段需为合法 JSON 文本，例如 {\"性格\": \"坚韧\"}")
      } else {
        setGlobalError(error instanceof Error ? error.message : "保存角色失败")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("确定删除该角色？")) {
      return
    }
    setGlobalError(undefined)
    try {
      await deleteCharacter(id)
      setCharacters(characters.filter((item) => item.id !== id))
      if (editingId === id) {
        setEditingId(null)
      }
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : "删除角色失败")
    }
  }

  return (
    <section className="space-y-8">
      <header>
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-amber-200">
          <Users className="h-6 w-6" />
          角色管理
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          管理影片角色档案，可维护角色别名、演员、性格特质等信息。
        </p>
      </header>

      <div className={cardContainerClass}>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          选择影片
          <select
            className={selectBaseClass}
            value={selectedMovieId}
            onChange={(event) => setSelectedMovieId(event.target.value)}
          >
            <option value="">请选择影片</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedMovieId ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className={cardContainerClass}>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {editingId ? "编辑角色" : "新增角色"}
            </h3>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className={labelClass}>
                  角色名称
                  <input
                    type="text"
                    value={formState.name}
                    onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                    className={inputBaseClass}
                    required
                  />
                </label>
                <label className={labelClass}>
                  别名（逗号分隔）
                  <input
                    type="text"
                    value={formState.aliases}
                    onChange={(event) => setFormState((prev) => ({ ...prev, aliases: event.target.value }))}
                    className={inputBaseClass}
                  />
                </label>
                <label className={labelClass}>
                  扮演演员
                  <input
                    type="text"
                    value={formState.actorName}
                    onChange={(event) => setFormState((prev) => ({ ...prev, actorName: event.target.value }))}
                    className={inputBaseClass}
                  />
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formState.isPrimary}
                    onChange={(event) => setFormState((prev) => ({ ...prev, isPrimary: event.target.checked }))}
                    className="h-4 w-4 rounded border border-slate-400 bg-white text-amber-500 focus:ring-amber-400 dark:border-slate-600 dark:bg-slate-900"
                  />
                  是否主要角色
                </label>
              </div>

                <label className={labelClass}>
                  角色描述
                  <textarea
                    value={formState.description}
                    onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                    rows={3}
                    className={textareaBaseClass}
                  />
                </label>

                <label className={labelClass}>
                  特质（JSON 格式，可选）
                  <textarea
                    value={formState.traits}
                    onChange={(event) => setFormState((prev) => ({ ...prev, traits: event.target.value }))}
                    rows={3}
                    placeholder='例如：{"性格": "敏感", "擅长": "小提琴"}'
                    className={textareaBaseClass}
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className={labelClass}>
                    创建人（可选）
                    <input
                      type="text"
                      value={formState.createdBy}
                      onChange={(event) => setFormState((prev) => ({ ...prev, createdBy: event.target.value }))}
                      className={inputBaseClass}
                    />
                  </label>
                  <label className={labelClass}>
                    更新人（可选）
                    <input
                      type="text"
                      value={formState.updatedBy}
                      onChange={(event) => setFormState((prev) => ({ ...prev, updatedBy: event.target.value }))}
                      className={inputBaseClass}
                    />
                  </label>
                </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-amber-500/60"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                  {editingId ? "保存角色" : "创建角色"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="text-sm text-slate-400 hover:text-slate-200"
                    onClick={() => {
                      setEditingId(null)
                      setFormState({
                        name: "",
                        aliases: "",
                        actorName: "",
                        description: "",
                        traits: "",
                        isPrimary: false,
                        createdBy: "",
                        updatedBy: "",
                      })
                    }}
                  >
                    取消编辑
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className={cardContainerClass}>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">角色列表</h3>
            {loading ? (
              <div className="mt-6 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" /> 正在加载...
              </div>
            ) : characters.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">暂无角色数据，可在左侧创建。</p>
            ) : (
              <div className="mt-4 space-y-3">
                {characters.map((character) => (
                  <div key={character.id} className={listCardClass}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{character.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">角色 ID：{character.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 transition hover:border-amber-400 hover:text-amber-500 dark:border-slate-700 dark:text-slate-200"
                          onClick={() => {
                            setEditingId(character.id)
                            setFormState({
                              name: character.name,
                              aliases: character.aliases?.join(", ") ?? "",
                              actorName: character.actorName ?? "",
                              description: character.description ?? "",
                              traits: character.traits ? JSON.stringify(character.traits, null, 2) : "",
                              isPrimary: character.isPrimary,
                              createdBy: character.createdBy ?? "",
                              updatedBy: character.updatedBy ?? "",
                            })
                          }}
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:border-red-400 hover:text-red-200"
                          onClick={() => handleDelete(character.id)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-slate-500 dark:text-slate-400 md:grid-cols-2">
                      <span>别名：{character.aliases?.join(" / ") || "-"}</span>
                      <span>演员：{character.actorName || "-"}</span>
                      <span>主要角色：{character.isPrimary ? "是" : "否"}</span>
                      <span>更新时间：{formatDateTime(character.updatedAt)}</span>
                    </div>
                    {character.description && (
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{character.description}</p>
                    )}
                    {character.traits && (
                      <details className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                        <summary className="cursor-pointer text-amber-600 dark:text-amber-300">查看特质 JSON</summary>
                        <pre className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
                          {JSON.stringify(character.traits, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-400">请选择影片以管理角色资料。</p>
      )}
    </section>
  )
}
