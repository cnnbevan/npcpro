import { Router, type Request, type Response } from "express"
import type { NarrativeRequestPayload, NarrativeResponse } from "@/lib/types"
import { sendError, sendSuccess } from "../lib/http.js"

const router = Router()

function sanitizeNarrativePayload(rawBody: unknown): NarrativeRequestPayload {
  if (!rawBody || typeof rawBody !== "object") {
    throw new Error("请求体格式不正确")
  }
  const body = rawBody as Record<string, unknown>
  if (!body.movieTitle || typeof body.movieTitle !== "string") {
    throw new Error("缺少电影名称")
  }
  if (!body.characterName || typeof body.characterName !== "string") {
    throw new Error("缺少角色名称")
  }

  return {
    movieTitle: body.movieTitle.trim(),
    characterName: body.characterName.trim(),
    promptModifiers: body.promptModifiers ? String(body.promptModifiers) : undefined,
  }
}

router.post("/narrative", async (req: Request, res: Response) => {
  try {
    const payload = sanitizeNarrativePayload(req.body)
    const now = new Date().toISOString()

    const lines: string[] = []
    lines.push(`我是来自《${payload.movieTitle}》的${payload.characterName}。`)
    lines.push("这是一次基于数据库素材的占位叙事，真实的 AI 生成后续会接入。")
    lines.push(
      "我会结合剧情发展，以第一人称带你回顾那些关键的时刻。"
    )

    if (payload.promptModifiers) {
      lines.push(`你特别希望我强调：${payload.promptModifiers}。`)
    }

    lines.push("接下来，让我们从故事的起点重新踏上旅程……")

    const response: NarrativeResponse = {
      story: lines.join("\n\n"),
      movieTitle: payload.movieTitle,
      characterName: payload.characterName,
      tokensUsed: undefined,
      cached: false,
      generatedAt: now,
    }

    sendSuccess(res, response)
  } catch (error) {
    sendError(res, error instanceof Error ? error.message : "生成叙事失败", 400)
  }
})

export default router
