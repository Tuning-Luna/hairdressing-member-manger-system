// types/member.ts
// 会员类型 1 储值卡（30一次）
// 会员类型 2 会员卡（20一次）
export const MEMBER_TYPE = {
  SAVING: 1,
  VIP: 2,
} as const

export type MemberType = (typeof MEMBER_TYPE)[keyof typeof MEMBER_TYPE]

export interface Member {
  id: number
  name: string
  phone: string
  type: MemberType
  balance: number
  created_at: string
}

export interface CreateMemberDTO {
  name: string
  phone: string
  type: MemberType
  balance?: number
}

export interface UpdateMemberDTO extends CreateMemberDTO {
  id: number
}
