import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Navigation } from '../../components/Navigation';
import { useUser } from '../../context/UserContext';
import { Purchase } from '../../types/types';

const BuyerDashboard = () => {
  const router = useRouter();
  const { user, loading } = useUser();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      // Load all purchases
      const allPurchases = JSON.parse(localStorage.getItem('purchases') || '[]');
      // Filter purchases for current user
      const userPurchases = allPurchases.filter(
        (purchase: Purchase) => purchase.buyer === user.walletAddress
      );
      setPurchases(userPurchases);
      setLoadingPurchases(false);
    }
  }, [user, loading, router]);

  if (loading || loadingPurchases) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-8">My Purchases</h1>

        {purchases.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No purchases yet
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="bg-white/5 rounded-lg p-6"
              >
                <div className="flex items-center gap-4">
                  {purchase.item.image && (
                    <img
                      src={purchase.item.image}
                      alt={purchase.item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold">{purchase.item.title}</h3>
                    <p className="text-sm text-gray-400">
                      {purchase.item.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{purchase.price} SOL</p>
                    <p className="text-sm text-gray-400">
                      {new Date(purchase.purchaseDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400">
                    Transaction ID: 
                    <a
                      href={`https://explorer.solana.com/tx/${purchase.transactionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-400 hover:text-blue-300"
                    >
                      {purchase.transactionId.slice(0, 8)}...
                      {purchase.transactionId.slice(-8)}
                    </a>
                  </p>
                  {purchase.shippingAddress && (
                    <p className="text-sm text-gray-400 mt-2">
                      Shipping to: {purchase.shippingAddress}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BuyerDashboard; 