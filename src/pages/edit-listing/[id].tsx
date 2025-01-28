import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Navigation } from '../../components/Navigation';
import { useUser } from '../../context/UserContext';
import { Category, Item } from '../../types/types';

const EditListing = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useUser();
  const [listing, setListing] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: Category.DIGITAL_GOODS,
    requiresAddress: false,
    quantity: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !id)) {
      router.push('/');
      return;
    }

    // Load listing data
    if (id) {
      const listings = JSON.parse(localStorage.getItem('listings') || '[]');
      const foundListing = listings.find((l: Item) => l.id === id);
      
      if (!foundListing || foundListing.seller !== user?.walletAddress) {
        router.push('/dashboard/seller');
        return;
      }

      setListing(foundListing);
      setFormData({
        title: foundListing.title,
        description: foundListing.description,
        price: foundListing.price.toString(),
        category: foundListing.category,
        requiresAddress: foundListing.requiresAddress,
        quantity: foundListing.quantity,
      });
    }
  }, [id, user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate price
      const priceInSol = parseFloat(formData.price);
      if (isNaN(priceInSol) || priceInSol <= 0) {
        throw new Error('Please enter a valid price');
      }

      // Update listing
      const listings = JSON.parse(localStorage.getItem('listings') || '[]');
      const updatedListings = listings.map((l: Item) => {
        if (l.id === id) {
          return {
            ...l,
            title: formData.title,
            description: formData.description,
            price: priceInSol,
            category: formData.category,
            requiresAddress: formData.requiresAddress,
            quantity: formData.quantity,
          };
        }
        return l;
      });

      localStorage.setItem('listings', JSON.stringify(updatedListings));
      router.push('/dashboard/seller');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !listing) {
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
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Edit Listing</h1>
            <button
              onClick={() => router.push('/dashboard/seller')}
              className="bg-black text-white border border-white/20 px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-black border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-black border border-white/20 rounded-lg p-3 h-32 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price (SOL)</label>
              <input
                type="number"
                step="0.000000001"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full bg-black border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                min={listing.quantitySold}
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                className="w-full bg-black border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
              {listing.quantitySold > 0 && (
                <p className="text-sm text-gray-400 mt-1">
                  Minimum quantity is {listing.quantitySold} (already sold)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Category }))}
                className="w-full bg-black border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                {Object.values(Category).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requires-address"
                checked={formData.requiresAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, requiresAddress: e.target.checked }))}
                className="rounded border-white/20"
              />
              <label htmlFor="requires-address" className="text-sm">
                Requires shipping address
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg transition-all duration-200 ${
                isSubmitting
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {isSubmitting ? 'Updating...' : 'Update Listing'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditListing; 