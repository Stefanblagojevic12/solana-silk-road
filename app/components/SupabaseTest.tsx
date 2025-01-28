'use client'
import { useEffect, useState } from 'react'

export function SupabaseTest() {
  const [status, setStatus] = useState('Testing connection...')

  useEffect(() => {
    async function testConnection() {
      try {
        const response = await fetch('/api/supabase-test')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to connect')
        }

        setStatus(`Connection successful! ${data.message}`)
      } catch (error) {
        console.error('Connection error:', error)
        setStatus('Connection failed. Check console for details.')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h2 className="text-lg font-bold">Supabase Connection Status:</h2>
      <p>{status}</p>
      <p className="text-sm text-gray-600 mt-2">
        API URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
      </p>
    </div>
  )
} 