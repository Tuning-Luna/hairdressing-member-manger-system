import Database from "@tauri-apps/plugin-sql"
import { appDataDir, join } from "@tauri-apps/api/path"
let db: Database | null = null
import { save } from "@tauri-apps/plugin-dialog"
import { writeTextFile } from "@tauri-apps/plugin-fs"
import { open } from "@tauri-apps/plugin-dialog"
import { readTextFile } from "@tauri-apps/plugin-fs"
import Papa from "papaparse"

interface ImportResult {
  success: number
  failed: number
  duplicated: number
}

// 初始化数据库
export async function initDb() {
  const appDataDirPath = await appDataDir()
  const fullPath = await join(appDataDirPath, "members.db")
  console.log("数据库文件在:", fullPath)

  db = await Database.load("sqlite:members.db")

  // 创建表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      level TEXT
    )
  `)
}

// 获取所有会员
export async function getAllMembers(): Promise<any[]> {
  if (!db) throw new Error("Database not initialized")
  const result = await db.select("SELECT * FROM members")
  return result as any[] // 或者更严格的类型
}

// 分页获取会员
export async function getMembersWithPagination(
  page: number,
  pageSize: number
): Promise<any[]> {
  if (!db) throw new Error("Database not initialized")
  const offset = (page - 1) * pageSize
  const result = await db.select("SELECT * FROM members LIMIT ? OFFSET ?", [
    pageSize,
    offset,
  ])
  return result as any[] // 或者更严格的类型
}

// 获取总数量
export async function getMemberCount(): Promise<number> {
  if (!db) throw new Error("Database not initialized")
  const result = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM members"
  )
  return result[0].count as number
}

// 根据手机号模糊查询
export async function searchMembersByPhone(keyword: string): Promise<any[]> {
  if (!db) throw new Error("Database not initialized")

  const result = await db.select(
    "SELECT * FROM members WHERE phone LIKE ? ORDER BY id DESC",
    [`%${keyword}%`]
  )

  return result as any[]
}

// 添加会员
export async function addMember(name: string, phone: string, level: string) {
  if (!db) throw new Error("Database not initialized")
  await db.execute(
    "INSERT INTO members (name, phone, level) VALUES (?, ?, ?)",
    [name, phone, level]
  )
}

// 更新会员
export async function updateMember(
  id: number,
  name: string,
  phone: string,
  level: string
) {
  if (!db) throw new Error("Database not initialized")
  await db.execute(
    "UPDATE members SET name = ?, phone = ?, level = ? WHERE id = ?",
    [name, phone, level, id]
  )
}

// 删除会员
export async function deleteMember(id: number) {
  if (!db) throw new Error("Database not initialized")
  await db.execute("DELETE FROM members WHERE id = ?", [id])
}

// 删除所有会员
export async function deleteAllMembers() {
  if (!db) throw new Error("Database not initialized")
  await db.execute("DELETE FROM members")
}

// 导出为 CSV
export async function exportMembersASCSV() {
  try {
    const members = await getAllMembers()
    const csvContent = members
      .map((m) => `${m.name},${m.phone},${m.level}`)
      .join("\n")

    const filePath = await save({
      filters: [{ name: "CSV", extensions: ["csv"] }],
      defaultPath: "members.csv",
    })

    if (filePath) {
      await writeTextFile(filePath, csvContent)
      return true
    }
    return false
  } catch (e) {
    console.error("导出失败:", e)
    return false
  }
}

// 导入 CSV
export async function importMembersCSV(): Promise<ImportResult> {
  if (!db) throw new Error("Database not initialized")

  const result: ImportResult = { success: 0, failed: 0, duplicated: 0 }

  // 1. 文件选择与读取 (省略部分重复代码...)
  const filePath = await open({
    filters: [{ name: "CSV", extensions: ["csv"] }],
  })
  if (!filePath || Array.isArray(filePath)) return result
  let content = await readTextFile(filePath as string)
  if (content.charCodeAt(0) === 0xfeff) content = content.slice(1)

  // 2. 解析 CSV
  const parsed = Papa.parse(content, { header: true, skipEmptyLines: true })
  const rows = parsed.data as any[]
  if (!rows.length) return result

  // 3. 开始处理数据
  // 内存去重：处理 CSV 内部重复的电话
  const seenInCsv = new Set<string>()

  // 开启事务保证性能（批量操作建议开启，否则每行都会写磁盘）
  await db.execute("BEGIN")

  try {
    for (const row of rows) {
      const name = row.name?.trim()
      const phone = row.phone?.trim()
      const level = row.level?.trim()

      // 基础验证：如果没名字或没电话，算失败
      if (!name || !phone) {
        result.failed++
        continue
      }

      // A. 检查当前 CSV 文件内部是否已经处理过这个电话
      if (seenInCsv.has(phone)) {
        result.duplicated++
        continue
      }
      seenInCsv.add(phone)

      // B. 查询数据库：判断该 phone 是否已存在
      const existing = (await db.select(
        "SELECT id FROM members WHERE phone = ? LIMIT 1",
        [phone]
      )) as any[]

      if (existing.length > 0) {
        // 如果数据库里已经有了
        result.duplicated++
        continue
      }

      // C. 执行插入
      await db.execute(
        "INSERT INTO members (name, phone, level) VALUES (?, ?, ?)",
        [name, phone, level]
      )
      result.success++
    }

    // await db.execute("COMMIT")
  } catch (err) {
    await db.execute("ROLLBACK")
    console.error("导入出错:", err)
    throw err
  }

  return result
}
