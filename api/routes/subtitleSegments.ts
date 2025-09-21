import { randomUUID } from "node:crypto"
import { Router, type Request, type Response } from "express"
import type { SubtitleSegmentPayload } from "@/lib/types"
import { execute, query } from "../lib/db.js"
import { sendCreated, sendError, sendSuccess } from "../lib/http.js"
import { mapSubtitleSegment } from "../lib/transformers.js"

interface SubtitleRow {
  id: string
  movieId: string
  sceneId: string | null
  characterId: string | null
  startMs: number
  endMs: number
  speaker: string | null
  text: string
  confidence: number | null
  source: string | null
  createdAt: string
}

const router = Router()

function sanitizeSubtitlePayload(rawBody: unknown): SubtitleSegmentPayload {
  if (!rawBody || typeof rawBody !== "object") {
    throw new Error("请求体格式不正确")
  }
  const body = rawBody as Record<string, unknown>
  if (!body.movieId || typeof body.movieId !== "string") {
    throw new Error("缺少电影 ID")
  }
  if (body.startMs === undefined || body.endMs === undefined) {
    throw new Error("开始与结束时间不能为空")
  }
  const startMs = Number(body.startMs)
  const endMs = Number(body.endMs)
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    throw new Error("时间戳必须为数字")
  }
  if (!body.text || typeof body.text !== "string") {
    throw new Error("字幕文本不能为空")
  }

  return {
    movieId: body.movieId,
    sceneId:
      typeof body.sceneId === "string" || body.sceneId === null
        ? (body.sceneId as string | null)
        : null,
    characterId:
      typeof body.characterId === "string" || body.characterId === null
        ? (body.characterId as string | null)
        : null,
    startMs,
    endMs,
    speaker:
      typeof body.speaker === "string" || body.speaker === null
        ? (body.speaker as string | null)
        : null,
    text: body.text,
    confidence:
      body.confidence !== undefined && body.confidence !== null && body.confidence !== ""
        ? Number(body.confidence)
        : null,
    source:
      typeof body.source === "string" || body.source === null
        ? (body.source as string | null)
        : null,
  }
}

router.get("/movies/:movieId/subtitle-segments", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500)
    const offset = Math.max(Number(req.query.offset) || 0, 0)

    const rows = await query<SubtitleRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        scene_id AS sceneId,
        character_id AS characterId,
        start_ms AS startMs,
        end_ms AS endMs,
        speaker,
        text,
        confidence,
        source,
        created_at AS createdAt
      FROM subtitle_segments
      WHERE movie_id = :movieId
      ORDER BY start_ms ASC
      LIMIT :limit OFFSET :offset`,
      {
        movieId: req.params.movieId,
        limit,
        offset,
      }
    )

    sendSuccess(res, {
      items: rows.map(mapSubtitleSegment),
      pagination: { limit, offset, count: rows.length },
    })
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "获取字幕失败", 500)
  }
})

router.get("/subtitle-segments/:id", async (req: Request, res: Response) => {
  try {
    const rows = await query<SubtitleRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        scene_id AS sceneId,
        character_id AS characterId,
        start_ms AS startMs,
        end_ms AS endMs,
        speaker,
        text,
        confidence,
        source,
        created_at AS createdAt
      FROM subtitle_segments
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    if (!rows.length) {
      sendError(res, "未找到指定字幕片段", 404)
      return
    }

    sendSuccess(res, mapSubtitleSegment(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "获取字幕详情失败", 500)
  }
})

router.post("/movies/:movieId/subtitle-segments", async (req: Request, res: Response) => {
  try {
    const payload = sanitizeSubtitlePayload({ ...req.body, movieId: req.params.movieId })
    const id = randomUUID()

    await execute(
      `INSERT INTO subtitle_segments (
        id,
        movie_id,
        scene_id,
        character_id,
        start_ms,
        end_ms,
        speaker,
        text,
        confidence,
        source
      ) VALUES (
        :id,
        :movieId,
        :sceneId,
        :characterId,
        :startMs,
        :endMs,
        :speaker,
        :text,
        :confidence,
        :source
      )`,
      {
        id,
        movieId: payload.movieId,
        sceneId: payload.sceneId ?? null,
        characterId: payload.characterId ?? null,
        startMs: payload.startMs,
        endMs: payload.endMs,
        speaker: payload.speaker ?? null,
        text: payload.text,
        confidence: payload.confidence ?? null,
        source: payload.source ?? null,
      }
    )

    const rows = await query<SubtitleRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        scene_id AS sceneId,
        character_id AS characterId,
        start_ms AS startMs,
        end_ms AS endMs,
        speaker,
        text,
        confidence,
        source,
        created_at AS createdAt
      FROM subtitle_segments
      WHERE id = :id
      LIMIT 1`,
      { id }
    )

    sendCreated(res, mapSubtitleSegment(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "创建字幕失败", 400)
  }
})

router.put("/subtitle-segments/:id", async (req: Request, res: Response) => {
  try {
    const existingRows = await query<SubtitleRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        scene_id AS sceneId,
        character_id AS characterId,
        start_ms AS startMs,
        end_ms AS endMs,
        speaker,
        text,
        confidence,
        source,
        created_at AS createdAt
      FROM subtitle_segments
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    if (!existingRows.length) {
      sendError(res, "未找到指定字幕片段", 404)
      return
    }

    const existing = mapSubtitleSegment(existingRows[0])
    const payload = sanitizeSubtitlePayload({ ...existing, ...req.body })

    await execute(
      `UPDATE subtitle_segments SET
        movie_id = :movieId,
        scene_id = :sceneId,
        character_id = :characterId,
        start_ms = :startMs,
        end_ms = :endMs,
        speaker = :speaker,
        text = :text,
        confidence = :confidence,
        source = :source
      WHERE id = :id`,
      {
        id: req.params.id,
        movieId: payload.movieId,
        sceneId: payload.sceneId ?? null,
        characterId: payload.characterId ?? null,
        startMs: payload.startMs,
        endMs: payload.endMs,
        speaker: payload.speaker ?? null,
        text: payload.text,
        confidence: payload.confidence ?? null,
        source: payload.source ?? null,
      }
    )

    const rows = await query<SubtitleRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        scene_id AS sceneId,
        character_id AS characterId,
        start_ms AS startMs,
        end_ms AS endMs,
        speaker,
        text,
        confidence,
        source,
        created_at AS createdAt
      FROM subtitle_segments
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    sendSuccess(res, mapSubtitleSegment(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "更新字幕失败", 400)
  }
})

router.delete("/subtitle-segments/:id", async (req: Request, res: Response) => {
  try {
    const result = await execute("DELETE FROM subtitle_segments WHERE id = :id", {
      id: req.params.id,
    })

    if (!result.affectedRows) {
      sendError(res, "未找到指定字幕片段", 404)
      return
    }

    sendSuccess(res, { id: req.params.id })
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "删除字幕失败", 400)
  }
})

export default router
