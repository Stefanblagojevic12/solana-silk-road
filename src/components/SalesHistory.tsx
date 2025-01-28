import { Sale } from '../types/types';
import { formatDate } from '../utils/format';

interface SalesHistoryProps {
  sales: Sale[];
}

export const SalesHistory = ({ sales }: SalesHistoryProps) => {
  if (!sales || sales.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        No sales yet. List some items to get started.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {sales.map((sale) => (
        <div key={sale.id} className="bg-black border border-white/10 p-6 rounded-xl">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              {sale.item.image && (
                <img 
                  src={sale.item.image} 
                  alt={sale.item.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="text-xl font-bold">{sale.item.title}</h3>
                <p className="text-gray-400">Sold on {formatDate(sale.saleDate)}</p>
                <p className="text-white/50 mt-2">Status: {sale.status}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold">{sale.price} SOL</span>
              <p className="text-sm text-gray-400 mt-1">Buyer:</p>
              <p className="text-xs text-white/50">{sale.buyer.slice(0, 8)}...</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            {sale.status === 'paid' && (
              <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200">
                Mark as Shipped
              </button>
            )}
            <button className="bg-black text-white border border-white/20 px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200">
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}; 