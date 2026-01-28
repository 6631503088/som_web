export type UserRole = 'admin' | 'dean' | 'lecturer'

export interface RolePassword {
  role: UserRole
  password: string
}

export interface RolePasswordStore {
  [role: string]: string
}

export interface UserRoleData {
  email: string
  role?: UserRole
  displayName?: string | null
  photoURL?: string | null
  createdAt: Date
  verified?: boolean
  isActive?: boolean
  lastLogin?: string
  lastLoginIP?: string
}
