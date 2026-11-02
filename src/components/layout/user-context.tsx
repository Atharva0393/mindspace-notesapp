'use client'

import React, { createContext, useContext } from 'react'

export interface UserContextType {
  isAuthenticated: boolean
  userEmail: string | null
  userName: string | null
  displayName: string
  avatarUrl: string | null
}

const UserContext = createContext<UserContextType>({
  isAuthenticated: false,
  userEmail: null,
  userName: null,
  displayName: 'Guest',
  avatarUrl: null,
})

export function UserProvider({
  children,
  userEmail,
  userName,
  avatarUrl,
}: {
  children: React.ReactNode
  userEmail?: string | null
  userName?: string | null
  avatarUrl?: string | null
}) {
  const isAuthenticated = Boolean(userEmail)
  const rawName = userName?.trim() || (userEmail ? userEmail.split('@')[0] : 'Guest')
  const displayName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : 'Friend'

  return (
    <UserContext.Provider
      value={{
        isAuthenticated,
        userEmail: userEmail ?? null,
        userName: userName ?? null,
        displayName,
        avatarUrl: avatarUrl ?? null,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useCurrentUser() {
  return useContext(UserContext)
}
