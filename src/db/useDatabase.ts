import Database from "@tauri-apps/plugin-sql"
import { appDataDir, join } from "@tauri-apps/api/path"

import {
  MEMBER_TYPE,
  Member,
  MemberType,
  CreateMemberDTO,
  UpdateMemberDTO,
} from "../types/member"

export let db: Database | null = null

// 类型定义
export interface MemberRecord {
  id: number
  member_id: number
  amount: number
  created_at: string
}

// 初始化数据库
export async function initDb() {
  const appDataDirPath = await appDataDir()
  const fullPath = await join(appDataDirPath, "members.db")
  console.log("数据库文件路径在:", fullPath)

  db = await Database.load("sqlite:members.db")

  // 会员表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      type INTEGER NOT NULL,
      balance REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 消费记录表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS member_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(member_id) REFERENCES members(id)
    )
  `)

  // 索引优化
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_phone ON members(phone)
  `)
}

// 全部查询
export async function getAllMembers(): Promise<Member[]> {
  if (!db) throw new Error("Database not initialized")
  const result = await db.select<Member[]>(
    "SELECT * FROM members ORDER BY id DESC"
  )
  return result
}

export async function getMembersWithPagination(
  page: number,
  pageSize: number
): Promise<Member[]> {
  if (!db) throw new Error("Database not initialized")
  const offset = (page - 1) * pageSize

  const result = await db.select<Member[]>(
    "SELECT * FROM members ORDER BY id DESC LIMIT ? OFFSET ?",
    [pageSize, offset]
  )

  return result
}

export async function getMemberCount(): Promise<number> {
  if (!db) throw new Error("Database not initialized")

  const result = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM members"
  )

  return result[0]?.count ?? 0
}

// 分页模糊搜索
export async function searchMembersByPhone(
  keyword: string,
  page: number,
  pageSize: number
): Promise<Member[]> {
  if (!db) throw new Error("Database not initialized")

  const offset = (page - 1) * pageSize

  return await db.select<Member[]>(
    `
    SELECT * FROM members
    WHERE phone LIKE ?
    ORDER BY id DESC
    LIMIT ? OFFSET ?
    `,
    [`%${keyword}%`, pageSize, offset]
  )
}

// 模糊搜索总数
export async function searchMemberCount(keyword: string): Promise<number> {
  if (!db) throw new Error("Database not initialized")

  const result = await db.select<{ count: number }[]>(
    `
    SELECT COUNT(*) as count
    FROM members
    WHERE phone LIKE ?
    `,
    [`%${keyword}%`]
  )

  return result[0]?.count ?? 0
}

// 会员类型统计
export async function getMemberTypeCount(type: number): Promise<number> {
  if (!db) throw new Error("Database not initialized")

  const result = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM members WHERE type = ?",
    [type]
  )

  return result[0]?.count ?? 0
}

// 总余额查询
export async function getTotalBalance(): Promise<number> {
  if (!db) throw new Error("Database not initialized")

  const result = await db.select<{ total: number }[]>(
    "SELECT SUM(balance) as total FROM members"
  )

  return result[0]?.total ?? 0
}

// 今日新增会员
export async function getTodayNewMembers(): Promise<number> {
  if (!db) throw new Error("Database not initialized")

  const result = await db.select<{ count: number }[]>(
    `
    SELECT COUNT(*) as count
    FROM members
    WHERE DATE(created_at) = DATE('now')
    `
  )

  return result[0]?.count ?? 0
}

// 会员 CRUD
export async function addMember(data: CreateMemberDTO) {
  if (!db) throw new Error("Database not initialized")

  const { name, phone, type, balance = 0 } = data

  await db.execute(
    "INSERT INTO members (name, phone, type, balance) VALUES (?, ?, ?, ?)",
    [name, phone, type, balance]
  )
}

export async function updateMember(data: UpdateMemberDTO) {
  if (!db) throw new Error("Database not initialized")

  const { id, name, phone, type, balance = 0 } = data

  await db.execute(
    "UPDATE members SET name = ?, phone = ?, type = ?, balance = ? WHERE id = ?",
    [name, phone, type, balance, id]
  )
}

export async function deleteMember(id: number) {
  if (!db) throw new Error("Database not initialized")

  await db.execute("BEGIN")

  try {
    await db.execute("DELETE FROM member_records WHERE member_id = ?", [id])

    await db.execute("DELETE FROM members WHERE id = ?", [id])

    await db.execute("COMMIT")
  } catch (err) {
    await db.execute("ROLLBACK")
    throw err
  }
}

export async function deleteAllMembers() {
  if (!db) throw new Error("Database not initialized")

  await db.execute("BEGIN")

  try {
    // 先删消费记录
    await db.execute("DELETE FROM member_records")

    // 再删会员
    await db.execute("DELETE FROM members")

    await db.execute("COMMIT")
  } catch (err) {
    await db.execute("ROLLBACK")
    throw err
  }
}
// 消费逻辑
function getPriceByType(type: MemberType): number {
  switch (type) {
    case MEMBER_TYPE.SAVING:
      return 30
    case MEMBER_TYPE.VIP:
      return 20
  }
}

export async function consume(memberId: number) {
  if (!db) throw new Error("Database not initialized")

  await db.execute("BEGIN")

  try {
    const member = (
      await db.select<Member[]>("SELECT * FROM members WHERE id = ? LIMIT 1", [
        memberId,
      ])
    )[0]

    if (!member) throw new Error("会员不存在")

    // 根据类型决定价格
    const price = getPriceByType(member.type)

    if (member.balance < price) {
      throw new Error("余额不足")
    }

    // ✅ 所有类型都扣余额
    await db.execute("UPDATE members SET balance = balance - ? WHERE id = ?", [
      price,
      memberId,
    ])

    // 写消费记录
    await db.execute(
      "INSERT INTO member_records (member_id, amount) VALUES (?, ?)",
      [memberId, price]
    )

    await db.execute("COMMIT")
  } catch (err) {
    await db.execute("ROLLBACK")
    throw err
  }
}
