'use client'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useAuth } from '@/lib/AuthContext'

export function WalletLogin() {
  const { connected } = useWallet()
  const { user, signIn, signOut } = useAuth()

  return (
    <div className="flex items-center gap-4">
      <WalletMultiButton />
      {connected && !user && (
        <button
          onClick={signIn}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Sign In with Wallet
        </button>
      )}
      {user && (
        <button
          onClick={signOut}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      )}
    </div>
  )
} 