import { save, open } from "@tauri-apps/plugin-dialog"
import { writeTextFile, readTextFile } from "@tauri-apps/plugin-fs"
import Papa from "papaparse"
import { getAllMembers, db } from "../db/useDatabase"

interface ImportResult {
  success: number
  failed: number
  duplicated: number
}
// 导出 CSV
export async function exportMembersAsCSV() {
  const members = await getAllMembers()

  const header = "name,phone,type,balance\n"
  const body = members
    .map((m) => `${m.name},${m.phone},${m.type},${m.balance}`)
    .join("\n")

  const filePath = await save({
    filters: [{ name: "CSV", extensions: ["csv"] }],
    defaultPath: "members.csv",
  })

  if (filePath) {
    await writeTextFile(filePath, header + body)
    return true
  }

  return false
}

// 导入 CSV
export async function importMembersCSV(): Promise<ImportResult> {
  if (!db) throw new Error("Database not initialized")

  const result: ImportResult = { success: 0, failed: 0, duplicated: 0 }

  const filePath = await open({
    filters: [{ name: "CSV", extensions: ["csv"] }],
  })

  if (!filePath || Array.isArray(filePath)) return result

  let content = await readTextFile(filePath as string)
  if (content.charCodeAt(0) === 0xfeff) content = content.slice(1)

  const parsed = Papa.parse(content, { header: true, skipEmptyLines: true })
  const rows = parsed.data as any[]

  if (!rows.length) return result

  const seenInCsv = new Set<string>()

  await db.execute("BEGIN")

  try {
    for (const row of rows) {
      const name = row.name?.trim()
      const phone = row.phone?.trim()
      const type = Number(row.type)
      const balance = Number(row.balance ?? 0)

      if (!name || !phone || !type) {
        result.failed++
        continue
      }

      if (seenInCsv.has(phone)) {
        result.duplicated++
        continue
      }

      seenInCsv.add(phone)

      try {
        await db.execute(
          "INSERT INTO members (name, phone, type, balance) VALUES (?, ?, ?, ?)",
          [name, phone, type, balance]
        )
        result.success++
      } catch {
        result.duplicated++
      }
    }

    await db.execute("COMMIT")
  } catch (err) {
    await db.execute("ROLLBACK")
    throw err
  }

  return result
}
