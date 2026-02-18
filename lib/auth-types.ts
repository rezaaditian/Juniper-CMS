export interface User {
  id: number
  username: string
  role: string
}

export interface SessionPayload {
  userId: number
  username: string
  role: string
  exp: number
}
