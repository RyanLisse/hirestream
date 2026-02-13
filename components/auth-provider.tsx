'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: string
  ) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // TODO: Replace with Convex auth when ready
  const [user] = useState<AuthUser | null>({
    id: 'demo-user',
    email: 'recruiter@hirestream.ai',
    name: 'Demo Recruiter',
    role: 'admin',
  })
  const [loading] = useState(false)

  const signIn = async (_email: string, _password: string) => {
    return { error: null }
  }

  const signUp = async (_email: string, _password: string, _fullName: string, _role: string) => {
    return { error: null }
  }

  const signOut = async () => {
    // no-op for demo
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, signIn, signUp }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
