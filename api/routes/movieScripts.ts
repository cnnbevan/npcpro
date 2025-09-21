import { randomUUID } from "node:crypto"
import { Router, type Request, type Response } from "express"
import type { MovieScriptPayload } from "@/lib/types"
import { execute, query } from "../lib/db.js"
import { sendCreated, sendError, sendSuccess } from "../lib/http.js"
import { mapMovieScript } from "../lib/transformers.js"

interface MovieScriptRow {
  id: string
  movieId: string
  scriptTitle: string | null
  plotText: string | null
  screenplayText: string
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

const router = Router()

function sanitizeMovieScriptPayload(rawBody: unknown): MovieScriptPayload {
  if (!rawBody || typeof rawBody !== "object") {
    throw new Error("请求体格式不正确")
  }
  const body = rawBody as Record<string, unknown>

  if (!body.movieId || typeof body.movieId !== "string") {
    throw new Error("缺少电影 ID")
  }

  const screenplayText = body.screenplayText
  if (!screenplayText || typeof screenplayText !== "string") {
    throw new Error("剧本文本不能为空")
  }

  return {
    movieId: body.movieId,
    scriptTitle:
      typeof body.scriptTitle === "string" || body.scriptTitle === null
        ? (body.scriptTitle as string | null)
        : null,
    plotText:
      typeof body.plotText === "string" || body.plotText === null
        ? (body.plotText as string | null)
        : null,
    screenplayText,
    createdBy:
      typeof body.createdBy === "string" || body.createdBy === null
        ? (body.createdBy as string | null)
        : null,
  }
}

router.get("/movies/:movieId/scripts", async (req: Request, res: Response) => {
  try {
    const rows = await query<MovieScriptRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        script_title AS scriptTitle,
        plot_text AS plotText,
        screenplay_text AS screenplayText,
        created_by AS createdBy,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM movie_scripts
      WHERE movie_id = :movieId
      ORDER BY created_at DESC`,
      { movieId: req.params.movieId }
    )

    sendSuccess(res, rows.map(mapMovieScript))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "获取剧本失败", 500)
  }
})

router.get("/movie-scripts/:id", async (req: Request, res: Response) => {
  try {
    const rows = await query<MovieScriptRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        script_title AS scriptTitle,
        plot_text AS plotText,
        screenplay_text AS screenplayText,
        created_by AS createdBy,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM movie_scripts
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    if (!rows.length) {
      sendError(res, "未找到指定剧本", 404)
      return
    }

    sendSuccess(res, mapMovieScript(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "获取剧本失败", 500)
  }
})

router.post("/movies/:movieId/scripts", async (req: Request, res: Response) => {
  try {
    const payload = sanitizeMovieScriptPayload({ ...req.body, movieId: req.params.movieId })
    const id = randomUUID()

    await execute(
      `INSERT INTO movie_scripts (
        id,
        movie_id,
        script_title,
        plot_text,
        screenplay_text,
        created_by
      ) VALUES (
        :id,
        :movieId,
        :scriptTitle,
        :plotText,
        :screenplayText,
        :createdBy
      )`,
      {
        id,
        movieId: payload.movieId,
        scriptTitle: payload.scriptTitle ?? null,
        plotText: payload.plotText ?? null,
        screenplayText: payload.screenplayText,
        createdBy: payload.createdBy ?? null,
      }
    )

    const rows = await query<MovieScriptRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        script_title AS scriptTitle,
        plot_text AS plotText,
        screenplay_text AS screenplayText,
        created_by AS createdBy,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM movie_scripts
      WHERE id = :id
      LIMIT 1`,
      { id }
    )

    sendCreated(res, mapMovieScript(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "创建剧本失败", 400)
  }
})

router.put("/movie-scripts/:id", async (req: Request, res: Response) => {
  try {
    const existingRows = await query<MovieScriptRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        script_title AS scriptTitle,
        plot_text AS plotText,
        screenplay_text AS screenplayText,
        created_by AS createdBy,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM movie_scripts
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    if (!existingRows.length) {
      sendError(res, "未找到指定剧本", 404)
      return
    }

    const existing = mapMovieScript(existingRows[0])
    const payload = sanitizeMovieScriptPayload({ ...existing, ...req.body })

    await execute(
      `UPDATE movie_scripts SET
        movie_id = :movieId,
        script_title = :scriptTitle,
        plot_text = :plotText,
        screenplay_text = :screenplayText,
        created_by = :createdBy
      WHERE id = :id`,
      {
        id: req.params.id,
        movieId: payload.movieId,
        scriptTitle: payload.scriptTitle ?? null,
        plotText: payload.plotText ?? null,
        screenplayText: payload.screenplayText,
        createdBy: payload.createdBy ?? null,
      }
    )

    const rows = await query<MovieScriptRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        script_title AS scriptTitle,
        plot_text AS plotText,
        screenplay_text AS screenplayText,
        created_by AS createdBy,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM movie_scripts
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    sendSuccess(res, mapMovieScript(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "更新剧本失败", 400)
  }
})

router.delete("/movie-scripts/:id", async (req: Request, res: Response) => {
  try {
    const result = await execute("DELETE FROM movie_scripts WHERE id = :id", {
      id: req.params.id,
    })

    if (!result.affectedRows) {
      sendError(res, "未找到指定剧本", 404)
      return
    }

    sendSuccess(res, { id: req.params.id })
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "删除剧本失败", 400)
  }
})

export default router
