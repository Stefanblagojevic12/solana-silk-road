'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { supabase } from './supabase'

interface AuthContextType {
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  user: any
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { publicKey, signMessage } = useWallet()

  const signIn = async () => {
    if (!publicKey || !signMessage) return

    try {
      // Create a random nonce
      const nonce = Math.floor(Math.random() * 1000000).toString()
      
      // Sign the nonce with the wallet
      const message = new TextEncoder().encode(`Sign this message for authentication\nNonce: ${nonce}`)
      const signature = await signMessage(message)
      
      // Sign in to Supabase with the wallet address and signature
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${publicKey.toString()}@solana.com`,
        password: Buffer.from(signature).toString('hex')
      })

      if (error) throw error
      setUser(data.user)
    } catch (error) {
      console.error('Error signing in:', error)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for changes on auth state 
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ signIn, signOut, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
} 