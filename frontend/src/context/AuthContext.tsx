import { createContext, useContext, useState } from 'react'
import type { User } from '@/types'
import { STORAGE_KEYS } from '@/constants'

interface AuthContextType {
  token: string | null
  user: User | null
  setToken: (token: string | null) => void
  setUser: (user: User | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  })

  const [user, setUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER)
    return saved ? JSON.parse(saved) : null
  })

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, newToken)
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
    }
    setTokenState(newToken)
  }

  const setUser = (newUser: User | null) => {
    if (newUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser))
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER)
    }
    setUserState(newUser)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, setToken, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
