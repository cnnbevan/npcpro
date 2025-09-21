import { randomUUID } from "node:crypto"
import { Router, type Request, type Response } from "express"
import type { MovieDialoguePayload } from "@/lib/types"
import { execute, query } from "../lib/db.js"
import { sendCreated, sendError, sendSuccess } from "../lib/http.js"
import { mapMovieDialogueFile } from "../lib/transformers.js"

interface MovieDialogueRow {
  id: string
  movieId: string
  fileName: string | null
  dialogueText: string
  totalLines: number | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

const router = Router()

function sanitizeMovieDialoguePayload(rawBody: unknown): MovieDialoguePayload {
  if (!rawBody || typeof rawBody !== "object") {
    throw new Error("请求体格式不正确")
  }
  const body = rawBody as Record<string, unknown>

  if (!body.movieId || typeof body.movieId !== "string") {
    throw new Error("缺少电影 ID")
  }

  const dialogueText = body.dialogueText
  if (!dialogueText || typeof dialogueText !== "string") {
    throw new Error("对白文本不能为空")
  }

  return {
    movieId: body.movieId,
    fileName:
      typeof body.fileName === "string" || body.fileName === null
        ? (body.fileName as string | null)
        : null,
    dialogueText,
    totalLines:
      typeof body.totalLines === "number"
        ? body.totalLines
        : body.totalLines !== undefined && body.totalLines !== null && body.totalLines !== ""
          ? Number(body.totalLines)
          : null,
    createdBy:
      typeof body.createdBy === "string" || body.createdBy === null
        ? (body.createdBy as string | null)
        : null,
  }
}

router.get("/movies/:movieId/dialogues", async (req: Request, res: Response) => {
  try {
    const rows = await query<MovieDialogueRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        file_name AS fileName,
        dialogue_text AS dialogueText,
        total_lines AS totalLines,
        created_by AS createdBy,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM movie_dialogue_files
      WHERE movie_id = :movieId
      ORDER BY created_at DESC`,
      { movieId: req.params.movieId }
    )

    sendSuccess(res, rows.map(mapMovieDialogueFile))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "获取对白失败", 500)
  }
})

router.get("/movie-dialogues/:id", async (req: Request, res: Response) => {
  try {
    const rows = await query<MovieDialogueRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        file_name AS fileName,
        dialogue_text AS dialogueText,
        total_lines AS totalLines,
        created_by AS createdBy,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM movie_dialogue_files
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    if (!rows.length) {
      sendError(res, "未找到指定对白文件", 404)
      return
    }

    sendSuccess(res, mapMovieDialogueFile(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "获取对白失败", 500)
  }
})

router.post("/movies/:movieId/dialogues", async (req: Request, res: Response) => {
  try {
    const payload = sanitizeMovieDialoguePayload({ ...req.body, movieId: req.params.movieId })
    const id = randomUUID()

    await execute(
      `INSERT INTO movie_dialogue_files (
        id,
        movie_id,
        file_name,
        dialogue_text,
        total_lines,
        created_by
      ) VALUES (
        :id,
        :movieId,
        :fileName,
        :dialogueText,
        :totalLines,
        :createdBy
      )`,
      {
        id,
        movieId: payload.movieId,
        fileName: payload.fileName ?? null,
        dialogueText: payload.dialogueText,
        totalLines: payload.totalLines ?? null,
        createdBy: payload.createdBy ?? null,
      }
    )

    const rows = await query<MovieDialogueRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        file_name AS fileName,
        dialogue_text AS dialogueText,
        total_lines AS totalLines,
        created_by AS createdBy,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM movie_dialogue_files
      WHERE id = :id
      LIMIT 1`,
      { id }
    )

    sendCreated(res, mapMovieDialogueFile(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "创建对白失败", 400)
  }
})

router.put("/movie-dialogues/:id", async (req: Request, res: Response) => {
  try {
    const existingRows = await query<MovieDialogueRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        file_name AS fileName,
        dialogue_text AS dialogueText,
        total_lines AS totalLines,
        created_by AS createdBy,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM movie_dialogue_files
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    if (!existingRows.length) {
      sendError(res, "未找到指定对白文件", 404)
      return
    }

    const existing = mapMovieDialogueFile(existingRows[0])
    const payload = sanitizeMovieDialoguePayload({ ...existing, ...req.body })

    await execute(
      `UPDATE movie_dialogue_files SET
        movie_id = :movieId,
        file_name = :fileName,
        dialogue_text = :dialogueText,
        total_lines = :totalLines,
        created_by = :createdBy
      WHERE id = :id`,
      {
        id: req.params.id,
        movieId: payload.movieId,
        fileName: payload.fileName ?? null,
        dialogueText: payload.dialogueText,
        totalLines: payload.totalLines ?? null,
        createdBy: payload.createdBy ?? null,
      }
    )

    const rows = await query<MovieDialogueRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        file_name AS fileName,
        dialogue_text AS dialogueText,
        total_lines AS totalLines,
        created_by AS createdBy,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM movie_dialogue_files
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    sendSuccess(res, mapMovieDialogueFile(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "更新对白失败", 400)
  }
})

router.delete("/movie-dialogues/:id", async (req: Request, res: Response) => {
  try {
    const result = await execute("DELETE FROM movie_dialogue_files WHERE id = :id", {
      id: req.params.id,
    })

    if (!result.affectedRows) {
      sendError(res, "未找到指定对白文件", 404)
      return
    }

    sendSuccess(res, { id: req.params.id })
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "删除对白失败", 400)
  }
})

export default router
