import "dotenv/config"
import { createPool, Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise"

const pool: Pool = createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "npcdb",
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  namedPlaceholders: true,
  timezone: "Z",
})

export async function query<T extends RowDataPacket[]>(
  sql: string,
  params: Record<string, unknown>
): Promise<T> {
  const [rows] = await pool.query<T>(sql, params)
  return rows
}

export async function execute(
  sql: string,
  params: Record<string, unknown>
): Promise<ResultSetHeader> {
  const [result] = await pool.execute<ResultSetHeader>(sql, params)
  return result
}

export default pool
