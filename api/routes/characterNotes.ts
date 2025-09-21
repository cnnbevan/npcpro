import { randomUUID } from "node:crypto"
import { Router, type Request, type Response } from "express"
import type { CharacterNotePayload } from "@/lib/types"
import { execute, query } from "../lib/db.js"
import { sendCreated, sendError, sendSuccess } from "../lib/http.js"
import { mapCharacterNote } from "../lib/transformers.js"

interface CharacterNoteRow {
  id: string
  characterId: string
  noteType: string
  content: string
  source: string | null
  createdAt: string
  createdBy: string | null
}

const router = Router()

function sanitizeCharacterNotePayload(rawBody: unknown): CharacterNotePayload {
  if (!rawBody || typeof rawBody !== "object") {
    throw new Error("请求体格式不正确")
  }
  const body = rawBody as Record<string, unknown>
  if (!body.characterId || typeof body.characterId !== "string") {
    throw new Error("缺少角色 ID")
  }
  if (!body.noteType || typeof body.noteType !== "string") {
    throw new Error("笔记类型不能为空")
  }
  if (!body.content || typeof body.content !== "string") {
    throw new Error("笔记内容不能为空")
  }

  return {
    characterId: body.characterId,
    noteType: body.noteType,
    content: body.content,
    source:
      typeof body.source === "string" || body.source === null
        ? (body.source as string | null)
        : null,
    createdBy:
      typeof body.createdBy === "string" || body.createdBy === null
        ? (body.createdBy as string | null)
        : null,
  }
}

router.get("/characters/:characterId/notes", async (req: Request, res: Response) => {
  try {
    const rows = await query<CharacterNoteRow[]>(
      `SELECT
        id,
        character_id AS characterId,
        note_type AS noteType,
        content,
        source,
        created_at AS createdAt,
        created_by AS createdBy
      FROM character_notes
      WHERE character_id = :characterId
      ORDER BY created_at DESC`,
      { characterId: req.params.characterId }
    )

    sendSuccess(res, rows.map(mapCharacterNote))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "获取角色笔记失败", 500)
  }
})

router.get("/notes/:id", async (req: Request, res: Response) => {
  try {
    const rows = await query<CharacterNoteRow[]>(
      `SELECT
        id,
        character_id AS characterId,
        note_type AS noteType,
        content,
        source,
        created_at AS createdAt,
        created_by AS createdBy
      FROM character_notes
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    if (!rows.length) {
      sendError(res, "未找到指定角色笔记", 404)
      return
    }

    sendSuccess(res, mapCharacterNote(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "获取角色笔记失败", 500)
  }
})

router.post("/characters/:characterId/notes", async (req: Request, res: Response) => {
  try {
    const payload = sanitizeCharacterNotePayload({ ...req.body, characterId: req.params.characterId })
    const id = randomUUID()

    await execute(
      `INSERT INTO character_notes (
        id,
        character_id,
        note_type,
        content,
        source,
        created_by
      ) VALUES (
        :id,
        :characterId,
        :noteType,
        :content,
        :source,
        :createdBy
      )`,
      {
        id,
        characterId: payload.characterId,
        noteType: payload.noteType,
        content: payload.content,
        source: payload.source ?? null,
        createdBy: payload.createdBy ?? null,
      }
    )

    const rows = await query<CharacterNoteRow[]>(
      `SELECT
        id,
        character_id AS characterId,
        note_type AS noteType,
        content,
        source,
        created_at AS createdAt,
        created_by AS createdBy
      FROM character_notes
      WHERE id = :id
      LIMIT 1`,
      { id }
    )

    sendCreated(res, mapCharacterNote(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "创建角色笔记失败", 400)
  }
})

router.put("/notes/:id", async (req: Request, res: Response) => {
  try {
    const existingRows = await query<CharacterNoteRow[]>(
      `SELECT
        id,
        character_id AS characterId,
        note_type AS noteType,
        content,
        source,
        created_at AS createdAt,
        created_by AS createdBy
      FROM character_notes
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    if (!existingRows.length) {
      sendError(res, "未找到指定角色笔记", 404)
      return
    }

    const existing = mapCharacterNote(existingRows[0])
    const payload = sanitizeCharacterNotePayload({ ...existing, ...req.body })

    await execute(
      `UPDATE character_notes SET
        character_id = :characterId,
        note_type = :noteType,
        content = :content,
        source = :source,
        created_by = :createdBy
      WHERE id = :id`,
      {
        id: req.params.id,
        characterId: payload.characterId,
        noteType: payload.noteType,
        content: payload.content,
        source: payload.source ?? null,
        createdBy: payload.createdBy ?? null,
      }
    )

    const rows = await query<CharacterNoteRow[]>(
      `SELECT
        id,
        character_id AS characterId,
        note_type AS noteType,
        content,
        source,
        created_at AS createdAt,
        created_by AS createdBy
      FROM character_notes
      WHERE id = :id
      LIMIT 1`,
      { id: req.params.id }
    )

    sendSuccess(res, mapCharacterNote(rows[0]))
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "更新角色笔记失败", 400)
  }
})

router.delete("/notes/:id", async (req: Request, res: Response) => {
  try {
    const result = await execute("DELETE FROM character_notes WHERE id = :id", {
      id: req.params.id,
    })

    if (!result.affectedRows) {
      sendError(res, "未找到指定角色笔记", 404)
      return
    }

    sendSuccess(res, { id: req.params.id })
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "删除角色笔记失败", 400)
  }
})

export default router
