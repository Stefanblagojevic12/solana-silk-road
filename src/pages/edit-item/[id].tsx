import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Navigation } from '../../components/Navigation';
import { Category, Item } from '../../types/types';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUser } from '../../context/UserContext';
import { uploadImage } from '../../utils/storage';

const EditItem = () => {
  const router = useRouter();
  const { id } = router.query;
  const { connected } = useWallet();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: Category.DIGITAL_GOODS,
    requiresAddress: false,
    image: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalItem, setOriginalItem] = useState<Item | null>(null);

  useEffect(() => {
    if (id) {
      const listings = JSON.parse(localStorage.getItem('listings') || '[]');
      const item = listings.find((listing: Item) => listing.id === id);
      
      if (item) {
        setOriginalItem(item);
        setFormData({
          title: item.title,
          description: item.description,
          price: item.price.toString(),
          category: item.category,
          requiresAddress: item.requiresAddress,
          image: null,
        });
        setImagePreview(item.image);
      }
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!loading && (!user || !connected)) {
      router.push('/');
    }
  }, [loading, user, connected, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

      // Get image URL
      let imageUrl = imagePreview;
      if (formData.image) {
        imageUrl = await uploadImage(formData.image);
      }

      // Update listing
      const listings = JSON.parse(localStorage.getItem('listings') || '[]');
      const updatedListings = listings.map((listing: Item) => {
        if (listing.id === id) {
          return {
            ...listing,
            title: formData.title,
            description: formData.description,
            price: priceInSol,
            category: formData.category,
            requiresAddress: formData.requiresAddress,
            image: imageUrl,
          };
        }
        return listing;
      });

      localStorage.setItem('listings', JSON.stringify(updatedListings));

      // Redirect to item page
      router.push(`/item/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!originalItem) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-xl">Item not found</div>
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
              onClick={() => router.push(`/item/${id}`)}
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

            <div>
              <label className="block text-sm font-medium mb-2">Image</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                >
                  Choose File
                </label>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                )}
              </div>
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

export default EditItem; 