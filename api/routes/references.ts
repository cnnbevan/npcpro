import { randomUUID } from "node:crypto"
import { Router, type Request, type Response } from "express"
import type { MovieReferencePayload } from "@/lib/types"
import { execute, query } from "../lib/db.js"
import { sendCreated, sendError, sendSuccess } from "../lib/http.js"
import { mapMovieReference } from "../lib/transformers.js"

interface ReferenceRow {
  id: string
  movieId: string
  type: string
  title: string | null
  content: string
  sourceUrl: string | null
  createdAt: string
  createdBy: string | null
}

const router = Router()

function sanitizeReferencePayload(rawBody: unknown): MovieReferencePayload {
  if (!rawBody || typeof rawBody !== "object") {
    throw new Error("请求体格式不正确")
  }
  const body = rawBody as Record<string, unknown>
  if (!body.movieId || typeof body.movieId !== "string") {
    throw new Error("缺少电影 ID")
  }
  if (!body.type || typeof body.type !== "string") {
    throw new Error("参考类型不能为空")
  }
  if (!body.content || typeof body.content !== "string") {
    throw new Error("参考内容不能为空")
  }

  return {
    movieId: body.movieId,
    type: body.type,
    title:
      typeof body.title === "string" || body.title === null
        ? (body.title as string | null)
        : null,
    content: body.content,
    sourceUrl:
      typeof body.sourceUrl === "string" || body.sourceUrl === null
        ? (body.sourceUrl as string | null)
        : null,
    createdBy:
      typeof body.createdBy === "string" || body.createdBy === null
        ? (body.createdBy as string | null)
        : null,
  }
}

router.get("/movies/:movieId/references", async (req: Request, res: Response) => {
  try {
    const rows = await query<ReferenceRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        type,
        title,
        content,
        source_url AS sourceUrl,
        created_at AS createdAt,
        created_by AS createdBy
      FROM movie_references
      WHERE movie_id = :movieId
      ORDER BY created_at DESC`,
      { movieId: req.params.movieId }
    )

    sendSuccess(res, rows.map(mapMovieReference))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "获取参考资料失败", 500)
  }
})

router.get("/references/:id", async (req: Request, res: Response) => {
  try {
    const rows = await query<ReferenceRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        type,
        title,
        content,
        source_url AS sourceUrl,
        created_at AS createdAt,
        created_by AS createdBy
      FROM movie_references
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    if (!rows.length) {
      sendError(res, "未找到指定参考资料", 404)
      return
    }

    sendSuccess(res, mapMovieReference(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "获取参考资料失败", 500)
  }
})

router.post("/movies/:movieId/references", async (req: Request, res: Response) => {
  try {
    const payload = sanitizeReferencePayload({ ...req.body, movieId: req.params.movieId })
    const id = randomUUID()

    await execute(
      `INSERT INTO movie_references (
        id,
        movie_id,
        type,
        title,
        content,
        source_url,
        created_by
      ) VALUES (
        :id,
        :movieId,
        :type,
        :title,
        :content,
        :sourceUrl,
        :createdBy
      )`,
      {
        id,
        movieId: payload.movieId,
        type: payload.type,
        title: payload.title ?? null,
        content: payload.content,
        sourceUrl: payload.sourceUrl ?? null,
        createdBy: payload.createdBy ?? null,
      }
    )

    const rows = await query<ReferenceRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        type,
        title,
        content,
        source_url AS sourceUrl,
        created_at AS createdAt,
        created_by AS createdBy
      FROM movie_references
      WHERE id = :id
      LIMIT 1`,
      { id }
    )

    sendCreated(res, mapMovieReference(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "创建参考资料失败", 400)
  }
})

router.put("/references/:id", async (req: Request, res: Response) => {
  try {
    const existingRows = await query<ReferenceRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        type,
        title,
        content,
        source_url AS sourceUrl,
        created_at AS createdAt,
        created_by AS createdBy
      FROM movie_references
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    if (!existingRows.length) {
      sendError(res, "未找到指定参考资料", 404)
      return
    }

    const existing = mapMovieReference(existingRows[0])
    const payload = sanitizeReferencePayload({ ...existing, ...req.body })

    await execute(
      `UPDATE movie_references SET
        movie_id = :movieId,
        type = :type,
        title = :title,
        content = :content,
        source_url = :sourceUrl,
        created_by = :createdBy
      WHERE id = :id`,
      {
        id: req.params.id,
        movieId: payload.movieId,
        type: payload.type,
        title: payload.title ?? null,
        content: payload.content,
        sourceUrl: payload.sourceUrl ?? null,
        createdBy: payload.createdBy ?? null,
      }
    )

    const rows = await query<ReferenceRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        type,
        title,
        content,
        source_url AS sourceUrl,
        created_at AS createdAt,
        created_by AS createdBy
      FROM movie_references
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    sendSuccess(res, mapMovieReference(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "更新参考资料失败", 400)
  }
})

router.delete("/references/:id", async (req: Request, res: Response) => {
  try {
    const result = await execute("DELETE FROM movie_references WHERE id = :id", {
      id: req.params.id,
    })

    if (!result.affectedRows) {
      sendError(res, "未找到指定参考资料", 404)
      return
    }

    sendSuccess(res, { id: req.params.id })
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "删除参考资料失败", 400)
  }
})

export default router
