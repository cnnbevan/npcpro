import type {
  Character,
  CharacterPayload,
  Movie,
  MovieDialogueFile,
  MovieDialoguePayload,
  MoviePayload,
  MovieScript,
  MovieScriptPayload,
  NarrativeResponse,
  NarrativeRequestPayload,
  Scene,
  ScenePayload,
  SubtitleSegment,
  SubtitleSegmentPayload,
} from "@/lib/types"

interface ApiSuccess<T> {
  success: true
  data: T
}

interface ApiFailure {
  success: false
  error?: string
  message?: string
}

type ApiResponse<T> = ApiSuccess<T> | ApiFailure

const defaultErrorMessage = "请求失败，请稍后重试。"

async function requestJson<T>(
  input: RequestInfo,
  init?: RequestInit,
  fallbackMessage = defaultErrorMessage
): Promise<T> {
  const response = await fetch(input, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  const contentType = response.headers.get("content-type")
  const canParseJson = contentType?.includes("application/json") ?? false
  const parsedBody: ApiResponse<T> | undefined = canParseJson
    ? await response.json()
    : undefined

  if (!response.ok) {
    const message = parsedBody?.error || parsedBody?.message || fallbackMessage
    throw new Error(message)
  }

  if (!parsedBody || !parsedBody.success || parsedBody.data === undefined) {
    throw new Error(fallbackMessage)
  }

  return parsedBody.data
}

export async function requestGenerateNarrative(
  payload: NarrativeRequestPayload
): Promise<NarrativeResponse> {
  try {
    return await requestJson<NarrativeResponse>("/api/narrative", {
      method: "POST",
      body: JSON.stringify(payload),
    }, "生成请求失败，请稍后重试。")
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || "生成请求失败，请稍后重试。")
    }
    throw new Error("生成请求失败，请稍后重试。")
  }
}

export async function fetchMovies(): Promise<Movie[]> {
  const data = await requestJson<{ items: Movie[] }>("/api/movies?limit=200")
  return data?.items ?? []
}

export async function createMovie(payload: MoviePayload): Promise<Movie> {
  return requestJson<Movie>("/api/movies", {
    method: "POST",
    body: JSON.stringify(payload),
  }, "创建影片失败")
}

export async function updateMovie(id: string, payload: MoviePayload): Promise<Movie> {
  return requestJson<Movie>(`/api/movies/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, "更新影片失败")
}

export async function deleteMovie(id: string): Promise<void> {
  await requestJson<{ id: string }>(`/api/movies/${id}`, {
    method: "DELETE",
  }, "删除影片失败")
}

export async function fetchCharacters(movieId: string): Promise<Character[]> {
  return requestJson<Character[]>(`/api/movies/${movieId}/characters`)
}

export async function createCharacter(payload: CharacterPayload): Promise<Character> {
  return requestJson<Character>(`/api/movies/${payload.movieId}/characters`, {
    method: "POST",
    body: JSON.stringify(payload),
  }, "创建角色失败")
}

export async function updateCharacter(id: string, payload: CharacterPayload): Promise<Character> {
  return requestJson<Character>(`/api/characters/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, "更新角色失败")
}

export async function deleteCharacter(id: string): Promise<void> {
  await requestJson<{ id: string }>(`/api/characters/${id}`, {
    method: "DELETE",
  }, "删除角色失败")
}

export async function fetchScenes(movieId: string): Promise<Scene[]> {
  return requestJson<Scene[]>(`/api/movies/${movieId}/scenes`)
}

export async function createScene(payload: ScenePayload): Promise<Scene> {
  return requestJson<Scene>(`/api/movies/${payload.movieId}/scenes`, {
    method: "POST",
    body: JSON.stringify(payload),
  }, "创建剧情失败")
}

export async function updateScene(id: string, payload: ScenePayload): Promise<Scene> {
  return requestJson<Scene>(`/api/scenes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, "更新剧情失败")
}

export async function deleteScene(id: string): Promise<void> {
  await requestJson<{ id: string }>(`/api/scenes/${id}`, {
    method: "DELETE",
  }, "删除剧情失败")
}

export async function fetchSubtitleSegments(movieId: string, params?: { limit?: number; offset?: number }): Promise<{ items: SubtitleSegment[]; pagination: { limit: number; offset: number; count: number } }> {
  const searchParams = new URLSearchParams()
  searchParams.set("limit", String(params?.limit ?? 200))
  searchParams.set("offset", String(params?.offset ?? 0))
  return requestJson(`/api/movies/${movieId}/subtitle-segments?${searchParams.toString()}`)
}

export async function createSubtitleSegment(payload: SubtitleSegmentPayload): Promise<SubtitleSegment> {
  return requestJson<SubtitleSegment>(`/api/movies/${payload.movieId}/subtitle-segments`, {
    method: "POST",
    body: JSON.stringify(payload),
  }, "创建对白失败")
}

export async function updateSubtitleSegment(id: string, payload: SubtitleSegmentPayload): Promise<SubtitleSegment> {
  return requestJson<SubtitleSegment>(`/api/subtitle-segments/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, "更新对白失败")
}

export async function deleteSubtitleSegment(id: string): Promise<void> {
  await requestJson<{ id: string }>(`/api/subtitle-segments/${id}`, {
    method: "DELETE",
  }, "删除对白失败")
}

export async function fetchMovieScripts(movieId: string): Promise<MovieScript[]> {
  return requestJson<MovieScript[]>(`/api/movies/${movieId}/scripts`)
}

export async function createMovieScript(payload: MovieScriptPayload): Promise<MovieScript> {
  return requestJson<MovieScript>(`/api/movies/${payload.movieId}/scripts`, {
    method: "POST",
    body: JSON.stringify(payload),
  }, "上传剧本失败")
}

export async function updateMovieScript(id: string, payload: MovieScriptPayload): Promise<MovieScript> {
  return requestJson<MovieScript>(`/api/movie-scripts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, "更新剧本失败")
}

export async function deleteMovieScript(id: string): Promise<void> {
  await requestJson<{ id: string }>(`/api/movie-scripts/${id}`, {
    method: "DELETE",
  }, "删除剧本失败")
}

export async function fetchMovieDialogues(movieId: string): Promise<MovieDialogueFile[]> {
  return requestJson<MovieDialogueFile[]>(`/api/movies/${movieId}/dialogues`)
}

export async function createMovieDialogue(payload: MovieDialoguePayload): Promise<MovieDialogueFile> {
  return requestJson<MovieDialogueFile>(`/api/movies/${payload.movieId}/dialogues`, {
    method: "POST",
    body: JSON.stringify(payload),
  }, "上传对白失败")
}

export async function updateMovieDialogue(id: string, payload: MovieDialoguePayload): Promise<MovieDialogueFile> {
  return requestJson<MovieDialogueFile>(`/api/movie-dialogues/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, "更新对白失败")
}

export async function deleteMovieDialogue(id: string): Promise<void> {
  await requestJson<{ id: string }>(`/api/movie-dialogues/${id}`, {
    method: "DELETE",
  }, "删除对白失败")
}
