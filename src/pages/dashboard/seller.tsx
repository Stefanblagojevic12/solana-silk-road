import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../../context/UserContext';
import { Navigation } from '../../components/Navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { Item, Purchase } from '../../types/types';
import { useDataSync } from '../../hooks/useDataSync';

const SellerDashboard = () => {
  const router = useRouter();
  const { user, loading } = useUser();
  const { connected } = useWallet();
  const [listings, setListings] = useState<Item[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useDataSync();

  useEffect(() => {
    if (!loading && (!user || !connected)) {
      router.push('/');
    }
  }, [loading, user, connected, router]);

  useEffect(() => {
    const loadData = () => {
      if (user) {
        const allListings = JSON.parse(localStorage.getItem('listings') || '[]');
        const userListings = allListings.filter(
          (listing: Item) => listing.seller === user.walletAddress
        );
        setListings(userListings);

        const allPurchases = JSON.parse(localStorage.getItem('purchases') || '[]');
        const sellerPurchases = allPurchases.filter(
          (purchase: Purchase) => purchase.seller === user.walletAddress
        );
        setPurchases(sellerPurchases);
        setLoadingData(false);
      }
    };

    loadData();

    // Listen for updates
    const handleUpdate = (event: CustomEvent) => {
      if (user) {
        const userListings = event.detail.listings.filter(
          (listing: Item) => listing.seller === user.walletAddress
        );
        setListings(userListings);

        const sellerPurchases = event.detail.purchases.filter(
          (purchase: Purchase) => purchase.seller === user.walletAddress
        );
        setPurchases(sellerPurchases);
      }
    };

    window.addEventListener('datastoreUpdate', handleUpdate as EventListener);

    return () => {
      window.removeEventListener('datastoreUpdate', handleUpdate as EventListener);
    };
  }, [user]);

  const handleDeleteListing = (listingId: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      // Get all listings
      const allListings = JSON.parse(localStorage.getItem('listings') || '[]');
      
      // Filter out the deleted listing
      const updatedListings = allListings.filter(
        (listing: Item) => listing.id !== listingId
      );
      
      // Save back to localStorage
      localStorage.setItem('listings', JSON.stringify(updatedListings));

      // Update local state
      setListings(updatedListings.filter(
        (listing: Item) => listing.seller === user?.walletAddress
      ));
    }
  };

  const handleFulfillOrder = (purchaseId: string) => {
    // Get all purchases
    const allPurchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    
    // Update the status of the specific purchase
    const updatedPurchases = allPurchases.map((p: Purchase) => {
      if (p.id === purchaseId) {
        return { ...p, status: 'completed' };
      }
      return p;
    });

    // Save back to localStorage
    localStorage.setItem('purchases', JSON.stringify(updatedPurchases));

    // Update local state
    setPurchases(updatedPurchases.filter(
      (p: Purchase) => p.seller === user?.walletAddress
    ));
  };

  const getListingStatus = (listing: Item) => {
    if (listing.quantitySold >= listing.quantity) {
      return 'sold';
    }
    return listing.status;
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user || !connected) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="container mx-auto p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Seller Dashboard</h1>
            <button
              onClick={() => router.push('/list-item')}
              className="bg-white text-black px-6 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200"
            >
              List New Item
            </button>
          </div>

          {/* Active Listings */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4">Your Listings</h2>
            <div className="grid grid-cols-1 gap-6">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-white/5 rounded-lg p-6">
                  <div className="flex items-center gap-4">
                    {listing.image && (
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold">{listing.title}</h3>
                      <p className="text-sm text-gray-400">
                        {listing.description}
                      </p>
                      <div className="mt-2">
                        <span className="text-sm text-gray-400">
                          {listing.quantitySold} of {listing.quantity} sold
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col gap-2">
                      <p className="font-bold">{listing.price} SOL</p>
                      <p className={`text-sm ${
                        getListingStatus(listing) === 'sold' ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {getListingStatus(listing).toUpperCase()}
                      </p>
                      {getListingStatus(listing) === 'active' && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => router.push(`/edit-listing/${listing.id}`)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-sm"
                          >
                            Edit Listing
                          </button>
                          <button
                            onClick={() => handleDeleteListing(listing.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm"
                          >
                            Delete Listing
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {listings.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No active listings
                </div>
              )}
            </div>
          </div>

          {/* Orders to Fulfill */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4">Orders to Fulfill</h2>
            <div className="grid grid-cols-1 gap-6">
              {purchases
                .filter(purchase => purchase.status === 'paid')
                .map((purchase) => (
                <div key={purchase.id} className="bg-white/5 rounded-lg p-6">
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
                      <p className="text-sm text-gray-400 mt-1">
                        Buyer: {purchase.buyer}
                      </p>
                      {purchase.shippingAddress && (
                        <div className="mt-2 p-2 bg-white/5 rounded">
                          <p className="text-sm text-gray-400">Shipping Address:</p>
                          <p className="text-sm">{purchase.shippingAddress}</p>
                        </div>
                      )}
                      <p className="text-sm text-gray-400 mt-2">
                        Purchase Date: {new Date(purchase.purchaseDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex flex-col gap-2">
                      <p className="font-bold">{purchase.price} SOL</p>
                      <a
                        href={`https://explorer.solana.com/tx/${purchase.transactionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        View Transaction
                      </a>
                      <button
                        onClick={() => handleFulfillOrder(purchase.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200"
                      >
                        Mark as Fulfilled
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {purchases.filter(p => p.status === 'paid').length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No orders to fulfill
                </div>
              )}
            </div>
          </div>

          {/* Fulfilled Orders */}
          <div>
            <h2 className="text-xl font-bold mb-4">Fulfilled Orders</h2>
            <div className="grid grid-cols-1 gap-6">
              {purchases
                .filter(purchase => purchase.status === 'completed')
                .map((purchase) => (
                <div key={purchase.id} className="bg-white/5 rounded-lg p-6 opacity-75">
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
                      <p className="text-sm text-gray-400 mt-1">
                        Buyer: {purchase.buyer}
                      </p>
                      {purchase.shippingAddress && (
                        <div className="mt-2 p-2 bg-white/5 rounded">
                          <p className="text-sm text-gray-400">Shipping Address:</p>
                          <p className="text-sm">{purchase.shippingAddress}</p>
                        </div>
                      )}
                      <p className="text-sm text-gray-400 mt-2">
                        Purchase Date: {new Date(purchase.purchaseDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{purchase.price} SOL</p>
                      <a
                        href={`https://explorer.solana.com/tx/${purchase.transactionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        View Transaction
                      </a>
                      <p className="text-sm text-green-400 mt-2">
                        ✓ Fulfilled
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {purchases.filter(p => p.status === 'completed').length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No fulfilled orders yet
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard; 