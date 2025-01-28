import { Purchase } from '../types/types';
import { formatDate } from '../utils/format';

interface PurchaseHistoryProps {
  purchases: Purchase[];
}

export const PurchaseHistory = ({ purchases }: PurchaseHistoryProps) => {
  if (!purchases || purchases.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        No purchases yet. Browse the marketplace to get started.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {purchases.map((purchase) => (
        <div key={purchase.id} className="bg-black border border-white/10 p-6 rounded-xl">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              {purchase.item.image && (
                <img 
                  src={purchase.item.image} 
                  alt={purchase.item.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="text-xl font-bold">{purchase.item.title}</h3>
                <p className="text-gray-400">Purchased on {formatDate(purchase.purchaseDate)}</p>
                <p className="text-white/50 mt-2">Status: {purchase.status}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold">{purchase.price} SOL</span>
              <p className="text-sm text-gray-400 mt-1">Transaction ID:</p>
              <p className="text-xs text-white/50">{purchase.transactionId.slice(0, 8)}...</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button className="bg-black text-white border border-white/20 px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200">
              View Transaction
            </button>
            {purchase.status === 'shipped' && (
              <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200">
                Confirm Receipt
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}; 