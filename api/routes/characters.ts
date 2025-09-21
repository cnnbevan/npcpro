import { randomUUID } from "node:crypto"
import { Router, type Request, type Response } from "express"
import type { CharacterPayload } from "@/lib/types"
import { execute, query } from "../lib/db.js"
import { sendCreated, sendError, sendSuccess } from "../lib/http.js"
import { mapCharacter } from "../lib/transformers.js"

interface CharacterRow {
  id: string
  movieId: string
  name: string
  aliases: string | null
  actorName: string | null
  description: string | null
  traits: string | null
  isPrimary: number
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
}

const router = Router()

function sanitizeCharacterPayload(rawBody: unknown): CharacterPayload {
  if (!rawBody || typeof rawBody !== "object") {
    throw new Error("请求体格式不正确")
  }
  const body = rawBody as Record<string, unknown>
  if (!body.movieId || typeof body.movieId !== "string") {
    throw new Error("缺少电影 ID")
  }
  if (!body.name || typeof body.name !== "string") {
    throw new Error("角色名称不能为空")
  }

  return {
    movieId: body.movieId,
    name: body.name.trim(),
    aliases: Array.isArray(body.aliases)
      ? body.aliases.map((item) => String(item))
      : undefined,
    actorName:
      typeof body.actorName === "string" || body.actorName === null
        ? (body.actorName as string | null)
        : null,
    description:
      typeof body.description === "string" || body.description === null
        ? (body.description as string | null)
        : null,
    traits: body.traits && typeof body.traits === "object" ? (body.traits as Record<string, unknown>) : undefined,
    isPrimary: Boolean(body.isPrimary),
    createdBy:
      typeof body.createdBy === "string" || body.createdBy === null
        ? (body.createdBy as string | null)
        : null,
    updatedBy:
      typeof body.updatedBy === "string" || body.updatedBy === null
        ? (body.updatedBy as string | null)
        : null,
  }
}

router.get("/movies/:movieId/characters", async (req: Request, res: Response) => {
  try {
    const rows = await query<CharacterRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        name,
        aliases,
        actor_name AS actorName,
        description,
        traits,
        is_primary AS isPrimary,
        created_at AS createdAt,
        updated_at AS updatedAt,
        created_by AS createdBy,
        updated_by AS updatedBy
      FROM characters
      WHERE movie_id = :movieId
      ORDER BY created_at DESC`,
      { movieId: req.params.movieId }
    )

    sendSuccess(res, rows.map(mapCharacter))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "获取角色列表失败", 500)
  }
})

router.get("/characters/:id", async (req: Request, res: Response) => {
  try {
    const rows = await query<CharacterRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        name,
        aliases,
        actor_name AS actorName,
        description,
        traits,
        is_primary AS isPrimary,
        created_at AS createdAt,
        updated_at AS updatedAt,
        created_by AS createdBy,
        updated_by AS updatedBy
      FROM characters
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    if (!rows.length) {
      sendError(res, "未找到指定角色", 404)
      return
    }

    sendSuccess(res, mapCharacter(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "获取角色详情失败", 500)
  }
})

router.post("/movies/:movieId/characters", async (req: Request, res: Response) => {
  try {
    const payload = sanitizeCharacterPayload({ ...req.body, movieId: req.params.movieId })
    const id = randomUUID()

    await execute(
      `INSERT INTO characters (
        id,
        movie_id,
        name,
        aliases,
        actor_name,
        description,
        traits,
        is_primary,
        created_by,
        updated_by
      ) VALUES (
        :id,
        :movieId,
        :name,
        :aliases,
        :actorName,
        :description,
        :traits,
        :isPrimary,
        :createdBy,
        :updatedBy
      )`,
      {
        id,
        movieId: payload.movieId,
        name: payload.name,
        aliases: payload.aliases ? JSON.stringify(payload.aliases) : JSON.stringify([]),
        actorName: payload.actorName ?? null,
        description: payload.description ?? null,
        traits: payload.traits ? JSON.stringify(payload.traits) : JSON.stringify({}),
        isPrimary: payload.isPrimary ? 1 : 0,
        createdBy: payload.createdBy ?? null,
        updatedBy: payload.updatedBy ?? null,
      }
    )

    const rows = await query<CharacterRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        name,
        aliases,
        actor_name AS actorName,
        description,
        traits,
        is_primary AS isPrimary,
        created_at AS createdAt,
        updated_at AS updatedAt,
        created_by AS createdBy,
        updated_by AS updatedBy
      FROM characters
      WHERE id = :id
      LIMIT 1`,
      { id }
    )

    sendCreated(res, mapCharacter(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "创建角色失败", 400)
  }
})

router.put("/characters/:id", async (req: Request, res: Response) => {
  try {
    const existingRows = await query<CharacterRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        name,
        aliases,
        actor_name AS actorName,
        description,
        traits,
        is_primary AS isPrimary,
        created_at AS createdAt,
        updated_at AS updatedAt,
        created_by AS createdBy,
        updated_by AS updatedBy
      FROM characters
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    if (!existingRows.length) {
      sendError(res, "未找到指定角色", 404)
      return
    }

    const existing = mapCharacter(existingRows[0])
    const payload = sanitizeCharacterPayload({ ...existing, ...req.body })

    await execute(
      `UPDATE characters SET
        movie_id = :movieId,
        name = :name,
        aliases = :aliases,
        actor_name = :actorName,
        description = :description,
        traits = :traits,
        is_primary = :isPrimary,
        created_by = :createdBy,
        updated_by = :updatedBy
      WHERE id = :id`,
      {
        id: req.params.id,
        movieId: payload.movieId,
        name: payload.name,
        aliases: payload.aliases ? JSON.stringify(payload.aliases) : JSON.stringify([]),
        actorName: payload.actorName ?? null,
        description: payload.description ?? null,
        traits: payload.traits ? JSON.stringify(payload.traits) : JSON.stringify({}),
        isPrimary: payload.isPrimary ? 1 : 0,
        createdBy: payload.createdBy ?? null,
        updatedBy: payload.updatedBy ?? null,
      }
    )

    const rows = await query<CharacterRow[]>(
      `SELECT
        id,
        movie_id AS movieId,
        name,
        aliases,
        actor_name AS actorName,
        description,
        traits,
        is_primary AS isPrimary,
        created_at AS createdAt,
        updated_at AS updatedAt,
        created_by AS createdBy,
        updated_by AS updatedBy
      FROM characters
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    sendSuccess(res, mapCharacter(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "更新角色失败", 400)
  }
})

router.delete("/characters/:id", async (req: Request, res: Response) => {
  try {
    const result = await execute("DELETE FROM characters WHERE id = :id", {
      id: req.params.id,
    })

    if (!result.affectedRows) {
      sendError(res, "未找到指定角色", 404)
      return
    }

    sendSuccess(res, { id: req.params.id })
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "删除角色失败", 400)
  }
})

export default router
