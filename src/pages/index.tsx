import type { NextPage } from 'next';
import { Category, Item } from '../types/types';
import Link from 'next/link';
import { Navigation } from '../components/Navigation';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useDataSync } from '../hooks/useDataSync';

const Home: NextPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [listings, setListings] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Add data sync
  useDataSync();

  useEffect(() => {
    // Load initial data
    const loadListings = () => {
      const storedListings = JSON.parse(localStorage.getItem('listings') || '[]');
      setListings(storedListings);
    };

    loadListings();

    // Listen for updates
    const handleUpdate = (event: CustomEvent) => {
      setListings(event.detail.listings);
    };

    window.addEventListener('datastoreUpdate', handleUpdate as EventListener);

    return () => {
      window.removeEventListener('datastoreUpdate', handleUpdate as EventListener);
    };
  }, []);

  // Filter listings by category
  const filteredListings = selectedCategory === 'ALL' 
    ? listings
    : listings.filter(item => item.category === selectedCategory);

  const handleCreateListing = () => {
    if (!user) return;

    const newListing: Item = {
      id: generateId(),
      title,
      description,
      price: Number(price),
      category,
      requiresAddress,
      seller: user.walletAddress,
      image: selectedImage,
      status: 'active',
      createdAt: Date.now(),
      quantity: Number(quantity),
      quantitySold: 0,
    };

    // ... rest of the function ...
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="container mx-auto p-4">
        <div className="flex justify-between mb-8">
          <select 
            className="bg-black border border-white/20 p-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {Object.values(Category).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          
          <button 
            onClick={() => router.push('/list-item')}
            className="bg-white text-black px-6 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200"
          >
            List New Item
          </button>
        </div>

        {filteredListings.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No items found. Be the first to list something!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredListings.map((item) => (
              <div 
                key={item.id} 
                className="bg-black border border-white/10 p-6 rounded-xl hover:border-white/30 transition-all duration-200"
              >
                <div className="w-full h-48 rounded-lg mb-4 overflow-hidden">
                  {(item.images?.length > 0 || item.image) ? (
                    <img
                      src={item.images?.[0] || item.image}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/30">
                      No Image
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold mb-2 text-white">{item.title}</h2>
                <p className="text-gray-400 mb-2">{item.description}</p>
                <p className="text-2xl font-bold text-white mb-4">
                  {item.price} SOL
                </p>
                <div className="mt-2 text-sm text-gray-400">
                  {item.status === 'sold' ? (
                    <span className="text-red-400">Sold Out</span>
                  ) : (
                    <span>
                      {item.quantity - (item.quantitySold || 0)} available
                      {item.quantitySold > 0 && ` (${item.quantitySold} sold)`}
                    </span>
                  )}
                </div>

                <button 
                  onClick={() => router.push(`/item/${item.id}`)}
                  disabled={item.status === 'sold' || item.quantitySold >= item.quantity}
                  className={`w-full mt-4 py-2 rounded-lg transition-all duration-200 ${
                    item.status === 'sold' || item.quantitySold >= item.quantity
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-200'
                  }`}
                >
                  {item.status === 'sold' ? 'Sold Out' : `Buy for ${item.price} SOL`}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;