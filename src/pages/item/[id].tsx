import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Navigation } from '../../components/Navigation';
import { Item } from '../../types/types';
import { useUser } from '../../context/UserContext';
import { useWallet } from '@solana/wallet-adapter-react';

const ItemDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const { connected } = useWallet();
  const [item, setItem] = useState<Item | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      const listings = JSON.parse(localStorage.getItem('listings') || '[]');
      const foundItem = listings.find((listing: Item) => listing.id === id);
      
      // Handle legacy image format
      if (foundItem && !foundItem.images && foundItem.image) {
        foundItem.images = [foundItem.image];
      }
      
      setItem(foundItem || null);
    }
  }, [id]);

  if (!item) {
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
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="w-full aspect-square rounded-lg overflow-hidden">
                <img
                  src={item.images?.[selectedImageIndex] || item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thumbnails */}
              {item.images && item.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {item.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                        selectedImageIndex === index ? 'border-white' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${item.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">{item.title}</h1>
                <p className="text-gray-400 mt-2">{item.description}</p>
              </div>

              <div>
                <p className="text-4xl font-bold">{item.price} SOL</p>
                <p className="text-sm text-gray-400 mt-1">
                  {item.quantity - (item.quantitySold || 0)} available
                  {item.quantitySold > 0 && ` (${item.quantitySold} sold)`}
                </p>
              </div>

              <button
                onClick={() => router.push(`/checkout/${item.id}`)}
                disabled={!connected || item.status === 'sold' || item.quantitySold >= item.quantity}
                className={`w-full py-4 rounded-lg transition-all duration-200 ${
                  !connected || item.status === 'sold' || item.quantitySold >= item.quantity
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                {!connected
                  ? 'Connect Wallet to Purchase'
                  : item.status === 'sold'
                  ? 'Sold Out'
                  : `Buy for ${item.price} SOL`}
              </button>

              {!connected && (
                <p className="text-sm text-center text-gray-400">
                  You need to connect your wallet to make a purchase
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ItemDetail; 