import { randomUUID } from "node:crypto"
import { Router, type Request, type Response } from "express"
import type { ScenePayload } from "@/lib/types"
import { execute, query } from "../lib/db.js"
import { sendCreated, sendError, sendSuccess } from "../lib/http.js"
import { mapScene } from "../lib/transformers.js"

interface SceneRow {
  id: string
  movieId: string
  sceneNumber: number
  startMs: number | null
  endMs: number | null
  summary: string | null
  location: string | null
  chapter: string | null
  createdAt: string
  updatedAt: string
}

const router = Router()

function sanitizeScenePayload(rawBody: unknown): ScenePayload {
  if (!rawBody || typeof rawBody !== "object") {
    throw new Error("请求体格式不正确")
  }
  const body = rawBody as Record<string, unknown>
  if (!body.movieId || typeof body.movieId !== "string") {
    throw new Error("缺少电影 ID")
  }
  const sceneNumberRaw = body.sceneNumber ?? body.scene_number
  if (sceneNumberRaw === undefined) {
    throw new Error("场景编号不能为空")
  }
  const sceneNumber = Number(sceneNumberRaw)
  if (Number.isNaN(sceneNumber)) {
    throw new Error("场景编号必须为数字")
  }

  const startMsValue = body.startMs ?? body.start_ms ?? null
  const endMsValue = body.endMs ?? body.end_ms ?? null

  const startMs =
    startMsValue === null || startMsValue === undefined ? null : Number(startMsValue)
  const endMs =
    endMsValue === null || endMsValue === undefined ? null : Number(endMsValue)

  if (startMs !== null && Number.isNaN(startMs)) {
    throw new Error("开始时间必须为数字或留空")
  }
  if (endMs !== null && Number.isNaN(endMs)) {
    throw new Error("结束时间必须为数字或留空")
  }

  return {
    movieId: body.movieId,
    sceneNumber,
    startMs,
    endMs,
    summary:
      typeof body.summary === "string" || body.summary === null
        ? (body.summary as string | null)
        : null,
    location:
      typeof body.location === "string" || body.location === null
        ? (body.location as string | null)
        : null,
    chapter:
      typeof body.chapter === "string" || body.chapter === null
        ? (body.chapter as string | null)
        : null,
  }
}

router.get("/movies/:movieId/scenes", async (req: Request, res: Response) => {
  try {
    const rows = await query<SceneRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        scene_number AS sceneNumber,
        start_ms AS startMs,
        end_ms AS endMs,
        summary,
        location,
        chapter,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM scenes
      WHERE movie_id = :movieId
      ORDER BY scene_number ASC`,
      { movieId: req.params.movieId }
    )

    sendSuccess(res, rows.map(mapScene))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "获取场景列表失败", 500)
  }
})

router.get("/scenes/:id", async (req: Request, res: Response) => {
  try {
    const rows = await query<SceneRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        scene_number AS sceneNumber,
        start_ms AS startMs,
        end_ms AS endMs,
        summary,
        location,
        chapter,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM scenes
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    if (!rows.length) {
      sendError(res, "未找到指定场景", 404)
      return
    }

    sendSuccess(res, mapScene(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "获取场景详情失败", 500)
  }
})

router.post("/movies/:movieId/scenes", async (req: Request, res: Response) => {
  try {
    const payload = sanitizeScenePayload({ ...req.body, movieId: req.params.movieId })
    const id = randomUUID()

    await execute(
      `INSERT INTO scenes (
        id,
        movie_id,
        scene_number,
        start_ms,
        end_ms,
        summary,
        location,
        chapter
      ) VALUES (
        :id,
        :movieId,
        :sceneNumber,
        :startMs,
        :endMs,
        :summary,
        :location,
        :chapter
      )`,
      {
        id,
        movieId: payload.movieId,
        sceneNumber: payload.sceneNumber,
        startMs: payload.startMs ?? null,
        endMs: payload.endMs ?? null,
        summary: payload.summary ?? null,
        location: payload.location ?? null,
        chapter: payload.chapter ?? null,
      }
    )

    const rows = await query<SceneRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        scene_number AS sceneNumber,
        start_ms AS startMs,
        end_ms AS endMs,
        summary,
        location,
        chapter,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM scenes
      WHERE id = :id
      LIMIT 1`,
      { id }
    )

    sendCreated(res, mapScene(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "创建场景失败", 400)
  }
})

router.put("/scenes/:id", async (req: Request, res: Response) => {
  try {
    const existingRows = await query<SceneRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        scene_number AS sceneNumber,
        start_ms AS startMs,
        end_ms AS endMs,
        summary,
        location,
        chapter,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM scenes
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    if (!existingRows.length) {
      sendError(res, "未找到指定场景", 404)
      return
    }

    const existing = mapScene(existingRows[0])
    const payload = sanitizeScenePayload({ ...existing, ...req.body })

    await execute(
      `UPDATE scenes SET
        movie_id = :movieId,
        scene_number = :sceneNumber,
        start_ms = :startMs,
        end_ms = :endMs,
        summary = :summary,
        location = :location,
        chapter = :chapter
      WHERE id = :id`,
      {
        id: req.params.id,
        movieId: payload.movieId,
        sceneNumber: payload.sceneNumber,
        startMs: payload.startMs ?? null,
        endMs: payload.endMs ?? null,
        summary: payload.summary ?? null,
        location: payload.location ?? null,
        chapter: payload.chapter ?? null,
      }
    )

    const rows = await query<SceneRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        scene_number AS sceneNumber,
        start_ms AS startMs,
        end_ms AS endMs,
        summary,
        location,
        chapter,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM scenes
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    sendSuccess(res, mapScene(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "更新场景失败", 400)
  }
})

router.delete("/scenes/:id", async (req: Request, res: Response) => {
  try {
    const result = await execute("DELETE FROM scenes WHERE id = :id", {
      id: req.params.id,
    })

    if (!result.affectedRows) {
      sendError(res, "未找到指定场景", 404)
      return
    }

    sendSuccess(res, { id: req.params.id })
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "删除场景失败", 400)
  }
})

export default router
