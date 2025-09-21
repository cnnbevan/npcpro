import { randomUUID } from "node:crypto"
import { Router, type Request, type Response } from "express"
import type { MoviePayload } from "@/lib/types"
import { execute, query } from "../lib/db.js"
import { sendCreated, sendError, sendSuccess } from "../lib/http.js"
import { mapMovie } from "../lib/transformers.js"

interface MovieRow {
  id: string
  title: string
  originalTitle: string | null
  releaseYear: number | null
  language: string | null
  runtimeMinutes: number | null
  genres: string | null
  posterUrl: string | null
  synopsis: string | null
  createdAt: string
  updatedAt: string
}

const router = Router()

function sanitizeMoviePayload(rawBody: unknown): MoviePayload {
  if (!rawBody || typeof rawBody !== "object") {
    throw new Error("请求体格式不正确")
  }
  const body = rawBody as Record<string, unknown>

  const titleValue = body.title
  if (!titleValue || typeof titleValue !== "string") {
    throw new Error("电影标题不能为空")
  }

  const releaseYearValue = body.releaseYear
  const releaseYear =
    typeof releaseYearValue === "number"
      ? releaseYearValue
      : releaseYearValue !== undefined && releaseYearValue !== null && releaseYearValue !== ""
        ? Number(releaseYearValue)
        : null

  const runtimeMinutesValue = body.runtimeMinutes
  const runtimeMinutes =
    typeof runtimeMinutesValue === "number"
      ? runtimeMinutesValue
      : runtimeMinutesValue !== undefined && runtimeMinutesValue !== null && runtimeMinutesValue !== ""
        ? Number(runtimeMinutesValue)
        : null

  const genresValue = body.genres

  return {
    title: titleValue.trim(),
    originalTitle:
      typeof body.originalTitle === "string" || body.originalTitle === null
        ? (body.originalTitle as string | null)
        : null,
    releaseYear,
    language:
      typeof body.language === "string" || body.language === null
        ? (body.language as string | null)
        : null,
    runtimeMinutes,
    genres: Array.isArray(genresValue)
      ? genresValue.map((item) => String(item))
      : undefined,
    posterUrl:
      typeof body.posterUrl === "string" || body.posterUrl === null
        ? (body.posterUrl as string | null)
        : null,
    synopsis:
      typeof body.synopsis === "string" || body.synopsis === null
        ? (body.synopsis as string | null)
        : null,
  }
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : null
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100)
    const offset = Math.max(Number(req.query.offset) || 0, 0)

    const rows = await query<MovieRow[]>(
      `SELECT 
        id,
        title,
        original_title AS originalTitle,
        release_year AS releaseYear,
        language,
        runtime_minutes AS runtimeMinutes,
        genres,
        poster_url AS posterUrl,
        synopsis,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM movies
      WHERE (:search IS NULL OR title LIKE CONCAT('%', :search, '%'))
      ORDER BY created_at DESC
      LIMIT :limit OFFSET :offset`,
      {
        search,
        limit,
        offset,
      }
    )

    const items = rows.map(mapMovie)
    sendSuccess(res, {
      items,
      pagination: {
        limit,
        offset,
        count: items.length,
      },
    })
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "获取电影列表失败", 500)
  }
})

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const rows = await query<MovieRow[]>(
      `SELECT 
        id,
        title,
        original_title AS originalTitle,
        release_year AS releaseYear,
        language,
        runtime_minutes AS runtimeMinutes,
        genres,
        poster_url AS posterUrl,
        synopsis,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM movies
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    if (!rows.length) {
      sendError(res, "未找到指定电影", 404)
      return
    }

    sendSuccess(res, mapMovie(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "获取电影详情失败", 500)
  }
})

router.post("/", async (req: Request, res: Response) => {
  try {
    const payload = sanitizeMoviePayload(req.body)
    const id = randomUUID()

    await execute(
      `INSERT INTO movies (
        id,
        title,
        original_title,
        release_year,
        language,
        runtime_minutes,
        genres,
        poster_url,
        synopsis
      ) VALUES (
        :id,
        :title,
        :originalTitle,
        :releaseYear,
        :language,
        :runtimeMinutes,
        :genres,
        :posterUrl,
        :synopsis
      )`,
      {
        id,
        title: payload.title,
        originalTitle: payload.originalTitle,
        releaseYear: payload.releaseYear ?? null,
        language: payload.language ?? null,
        runtimeMinutes: payload.runtimeMinutes ?? null,
        genres: payload.genres ? JSON.stringify(payload.genres) : JSON.stringify([]),
        posterUrl: payload.posterUrl ?? null,
        synopsis: payload.synopsis ?? null,
      }
    )

    const rows = await query<MovieRow[]>(
      `SELECT 
        id,
        title,
        original_title AS originalTitle,
        release_year AS releaseYear,
        language,
        runtime_minutes AS runtimeMinutes,
        genres,
        poster_url AS posterUrl,
        synopsis,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM movies
      WHERE id = :id
      LIMIT 1`,
      { id }
    )

    sendCreated(res, mapMovie(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "创建电影失败", 400)
  }
})

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const existingRows = await query<MovieRow[]>(
      `SELECT 
        id,
        title,
        original_title AS originalTitle,
        release_year AS releaseYear,
        language,
        runtime_minutes AS runtimeMinutes,
        genres,
        poster_url AS posterUrl,
        synopsis,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM movies
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    if (!existingRows.length) {
      sendError(res, "未找到指定电影", 404)
      return
    }

    const existing = mapMovie(existingRows[0])
    const payload = sanitizeMoviePayload({ ...existing, ...req.body })

    await execute(
      `UPDATE movies SET
        title = :title,
        original_title = :originalTitle,
        release_year = :releaseYear,
        language = :language,
        runtime_minutes = :runtimeMinutes,
        genres = :genres,
        poster_url = :posterUrl,
        synopsis = :synopsis
      WHERE id = :id`,
      {
        id: req.params.id,
        title: payload.title,
        originalTitle: payload.originalTitle,
        releaseYear: payload.releaseYear ?? null,
        language: payload.language ?? null,
        runtimeMinutes: payload.runtimeMinutes ?? null,
        genres: payload.genres ? JSON.stringify(payload.genres) : JSON.stringify([]),
        posterUrl: payload.posterUrl ?? null,
        synopsis: payload.synopsis ?? null,
      }
    )

    const rows = await query<MovieRow[]>(
      `SELECT 
        id,
        title,
        original_title AS originalTitle,
        release_year AS releaseYear,
        language,
        runtime_minutes AS runtimeMinutes,
        genres,
        poster_url AS posterUrl,
        synopsis,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM movies
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    if (!rows.length) {
      sendError(res, "未找到指定电影", 404)
      return
    }

    sendSuccess(res, mapMovie(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "更新电影失败", 400)
  }
})

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const result = await execute("DELETE FROM movies WHERE id = :id", {
      id: req.params.id,
    })

    if (!result.affectedRows) {
      sendError(res, "未找到指定电影", 404)
      return
    }

    sendSuccess(res, { id: req.params.id })
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "删除电影失败", 400)
  }
})

export default router
