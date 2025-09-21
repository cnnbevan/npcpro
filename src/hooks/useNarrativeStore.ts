import { create } from "zustand"
import {
  requestGenerateNarrative,
  type GenerateNarrativePayload,
  type NarrativeData,
} from "@/lib/api"

export type NarrativeStatus = "idle" | "loading" | "success" | "error"

export interface NarrativeMeta {
  tokensUsed?: number
  cached?: boolean
  generatedAt?: string
}

interface NarrativeState {
  status: NarrativeStatus
  story?: string
  error?: string
  lastRequest?: GenerateNarrativePayload
  meta?: NarrativeMeta
  generateNarrative: (payload: GenerateNarrativePayload) => Promise<void>
  reset: () => void
}

export const useNarrativeStore = create<NarrativeState>((set) => ({
  status: "idle",
  story: undefined,
  error: undefined,
  lastRequest: undefined,
  meta: undefined,
  async generateNarrative(payload) {
    set({ status: "loading", error: undefined, meta: undefined })
    try {
      const data: NarrativeData = await requestGenerateNarrative(payload)
      const meta: NarrativeMeta = {
        tokensUsed: data.tokensUsed,
        cached: data.cached,
        generatedAt: data.generatedAt,
      }

      set({
        status: "success",
        story: data.story,
        lastRequest: payload,
        meta,
      })
    } catch (error) {
      set({
        status: "error",
        error: error instanceof Error ? error.message : "未知错误",
      })
    }
  },
  reset() {
    set({ status: "idle", story: undefined, error: undefined, meta: undefined })
  },
}))
