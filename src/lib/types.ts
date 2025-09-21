export interface MoviePayload {
  title: string
  originalTitle?: string | null
  releaseYear?: number | null
  language?: string | null
  runtimeMinutes?: number | null
  genres?: string[]
  posterUrl?: string | null
  synopsis?: string | null
}

export interface Movie extends MoviePayload {
  id: string
  createdAt: string
  updatedAt: string
}

export interface CharacterPayload {
  movieId: string
  name: string
  aliases?: string[]
  actorName?: string | null
  description?: string | null
  traits?: Record<string, unknown>
  isPrimary?: boolean
  createdBy?: string | null
  updatedBy?: string | null
}

export interface Character extends CharacterPayload {
  id: string
  createdAt: string
  updatedAt: string
}

export interface ScenePayload {
  movieId: string
  sceneNumber: number
  startMs?: number | null
  endMs?: number | null
  summary?: string | null
  location?: string | null
  chapter?: string | null
}

export interface Scene extends ScenePayload {
  id: string
  createdAt: string
  updatedAt: string
}

export interface SubtitleSegmentPayload {
  movieId: string
  sceneId?: string | null
  characterId?: string | null
  startMs: number
  endMs: number
  speaker?: string | null
  text: string
  confidence?: number | null
  source?: string | null
}

export interface SubtitleSegment extends SubtitleSegmentPayload {
  id: string
  createdAt: string
}

export type MovieReferenceType = "plot_point" | "background" | "trivia" | "marketing"

export interface MovieReferencePayload {
  movieId: string
  type: MovieReferenceType
  title?: string | null
  content: string
  sourceUrl?: string | null
  createdBy?: string | null
}

export interface MovieReference extends MovieReferencePayload {
  id: string
  createdAt: string
}

export type CharacterNoteType =
  | "persona"
  | "relationship"
  | "backstory"
  | "speech_pattern"
  | "other"

export interface CharacterNotePayload {
  characterId: string
  noteType: CharacterNoteType
  content: string
  source?: string | null
  createdBy?: string | null
}

export interface CharacterNote extends CharacterNotePayload {
  id: string
  createdAt: string
}

export interface NarrativeRequestPayload {
  movieTitle: string
  characterName: string
  promptModifiers?: string
}

export interface NarrativeResponse {
  story: string
  movieTitle: string
  characterName: string
  tokensUsed?: number
  cached?: boolean
  generatedAt: string
}

export interface MovieScriptPayload {
  movieId: string
  scriptTitle?: string | null
  plotText?: string | null
  screenplayText: string
  createdBy?: string | null
}

export interface MovieScript extends MovieScriptPayload {
  id: string
  createdAt: string
  updatedAt: string
}

export interface MovieDialoguePayload {
  movieId: string
  fileName?: string | null
  dialogueText: string
  totalLines?: number | null
  createdBy?: string | null
}

export interface MovieDialogueFile extends MovieDialoguePayload {
  id: string
  createdAt: string
  updatedAt: string
}
