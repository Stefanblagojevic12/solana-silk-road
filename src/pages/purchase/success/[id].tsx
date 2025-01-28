import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Navigation } from '../../../components/Navigation';
import { Purchase } from '../../../types/types';

const PurchaseSuccess = () => {
  const router = useRouter();
  const { id } = router.query;
  const [purchase, setPurchase] = useState<Purchase | null>(null);

  useEffect(() => {
    if (id) {
      const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
      const foundPurchase = purchases.find((p: Purchase) => p.id === id);
      setPurchase(foundPurchase || null);
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto mt-8">
          {/* Success Message */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-8 mb-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg 
                className="w-8 h-8 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-500 mb-2">Purchase Successful!</h1>
            <p className="text-green-400/80">Your transaction has been confirmed</p>
          </div>

          {/* Purchase Details */}
          <div className="bg-white/5 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Purchase Details</h2>
            <div className="space-y-4">
              {/* Item Info */}
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                {purchase?.item.image && (
                  <img
                    src={purchase.item.image}
                    alt={purchase.item.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="font-bold">{purchase?.item.title}</h3>
                  <p className="text-sm text-gray-400">{purchase?.item.description}</p>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Amount Paid</p>
                  <p className="font-bold">{purchase?.price} SOL</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Date</p>
                  <p className="font-bold">
                    {purchase?.purchaseDate 
                      ? new Date(purchase.purchaseDate).toLocaleDateString()
                      : '-'
                    }
                  </p>
                </div>
              </div>

              {/* Transaction ID */}
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Transaction ID</p>
                <p className="font-mono text-sm break-all">
                  {purchase?.transactionId}
                </p>
              </div>

              {/* Shipping Address if applicable */}
              {purchase?.shippingAddress && (
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Shipping Address</p>
                  <p className="text-sm">{purchase.shippingAddress}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/dashboard/buyer')}
              className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-bold"
            >
              View Purchase History
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-black text-white border border-white/20 px-6 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 font-bold"
            >
              Continue Shopping
            </button>
          </div>

          {/* View on Explorer Link */}
          {purchase?.transactionId && (
            <div className="text-center mt-8">
              <a
                href={`https://explorer.solana.com/tx/${purchase.transactionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                View on Solana Explorer →
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PurchaseSuccess; 