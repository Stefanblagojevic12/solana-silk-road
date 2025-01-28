import { SupabaseTest } from './components/SupabaseTest'
import { WalletLogin } from './components/WalletLogin'
import ItemsList from './components/ItemsList'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <WalletLogin />
      </div>
      
      <div className="mb-8">
        <SupabaseTest />
      </div>

      <div className="mb-8">
        <ItemsList />
      </div>
    </main>
  )
} 