import type {
  Character,
  CharacterNote,
  CharacterNoteType,
  Movie,
  MovieDialogueFile,
  MovieReference,
  MovieReferenceType,
  MovieScript,
  Scene,
  SubtitleSegment,
} from "@/lib/types"

type GenericRow = Record<string, unknown>

function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) {
    return fallback
  }
  try {
    if (typeof value === "string") {
      return JSON.parse(value) as T
    }
    return value as T
  } catch {
    return fallback
  }
}

function asString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null
  }
  return String(value)
}

function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null
  }
  const numeric = Number(value)
  return Number.isNaN(numeric) ? null : numeric
}

export function mapMovie(row: GenericRow): Movie {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    originalTitle: asString(row.originalTitle),
    releaseYear: asNumber(row.releaseYear),
    language: asString(row.language),
    runtimeMinutes: asNumber(row.runtimeMinutes),
    genres: parseJson<string[]>(row.genres, []),
    posterUrl: asString(row.posterUrl),
    synopsis: asString(row.synopsis),
    createdAt: String(row.createdAt ?? ""),
    updatedAt: String(row.updatedAt ?? ""),
  }
}

export function mapCharacter(row: GenericRow): Character {
  return {
    id: String(row.id),
    movieId: String(row.movieId ?? ""),
    name: String(row.name ?? ""),
    aliases: parseJson<string[]>(row.aliases, []),
    actorName: asString(row.actorName),
    description: asString(row.description),
    traits: parseJson<Record<string, unknown>>(row.traits, {}),
    isPrimary: Boolean(row.isPrimary),
    createdAt: String(row.createdAt ?? ""),
    updatedAt: String(row.updatedAt ?? ""),
    createdBy: asString(row.createdBy),
    updatedBy: asString(row.updatedBy),
  }
}

export function mapScene(row: GenericRow): Scene {
  return {
    id: String(row.id),
    movieId: String(row.movieId ?? ""),
    sceneNumber: Number(row.sceneNumber ?? 0),
    startMs: asNumber(row.startMs),
    endMs: asNumber(row.endMs),
    summary: asString(row.summary),
    location: asString(row.location),
    chapter: asString(row.chapter),
    createdAt: String(row.createdAt ?? ""),
    updatedAt: String(row.updatedAt ?? ""),
  }
}

export function mapSubtitleSegment(row: GenericRow): SubtitleSegment {
  return {
    id: String(row.id),
    movieId: String(row.movieId ?? ""),
    sceneId: asString(row.sceneId),
    characterId: asString(row.characterId),
    startMs: Number(row.startMs ?? 0),
    endMs: Number(row.endMs ?? 0),
    speaker: asString(row.speaker),
    text: String(row.text ?? ""),
    confidence: row.confidence !== null && row.confidence !== undefined ? Number(row.confidence) : null,
    source: asString(row.source),
    createdAt: String(row.createdAt ?? ""),
  }
}

export function mapMovieReference(row: GenericRow): MovieReference {
  return {
    id: String(row.id),
    movieId: String(row.movieId ?? ""),
    type: String(row.type ?? "") as MovieReferenceType,
    title: asString(row.title),
    content: String(row.content ?? ""),
    sourceUrl: asString(row.sourceUrl),
    createdAt: String(row.createdAt ?? ""),
    createdBy: asString(row.createdBy),
  }
}

export function mapCharacterNote(row: GenericRow): CharacterNote {
  return {
    id: String(row.id),
    characterId: String(row.characterId ?? ""),
    noteType: String(row.noteType ?? "") as CharacterNoteType,
    content: String(row.content ?? ""),
    source: asString(row.source),
    createdBy: asString(row.createdBy),
    createdAt: String(row.createdAt ?? ""),
  }
}

export function mapMovieScript(row: GenericRow): MovieScript {
  return {
    id: String(row.id),
    movieId: String(row.movieId ?? ""),
    scriptTitle: asString(row.scriptTitle),
    plotText: asString(row.plotText),
    screenplayText: String(row.screenplayText ?? ""),
    createdBy: asString(row.createdBy),
    createdAt: String(row.createdAt ?? ""),
    updatedAt: String(row.updatedAt ?? ""),
  }
}

export function mapMovieDialogueFile(row: GenericRow): MovieDialogueFile {
  return {
    id: String(row.id),
    movieId: String(row.movieId ?? ""),
    fileName: asString(row.fileName),
    dialogueText: String(row.dialogueText ?? ""),
    totalLines: row.totalLines !== undefined && row.totalLines !== null ? Number(row.totalLines) : null,
    createdBy: asString(row.createdBy),
    createdAt: String(row.createdAt ?? ""),
    updatedAt: String(row.updatedAt ?? ""),
  }
}
