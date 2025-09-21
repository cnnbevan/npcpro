import { Response } from "express"

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data })
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201)
}

export function sendError(
  res: Response,
  message: string,
  status = 400,
  details?: unknown
): void {
  res.status(status).json({ success: false, error: message, details })
}
