import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../context/UserContext';
import { Navigation } from '../components/Navigation';
import { Category, Item } from '../types/types';
import { useWallet } from '@solana/wallet-adapter-react';
import { uploadImage } from '../utils/storage';
import { generateId } from '../utils/ids';

const ListItem = () => {
  const { user, loading } = useUser();
  const { connected } = useWallet();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: Category.DIGITAL_GOODS,
    requiresAddress: false,
    requiresEmail: false,
    images: [] as File[],
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!loading && (!user || !connected)) {
      router.push('/');
    }
  }, [loading, user, connected, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Limit to 3 images total
      const newImages = [...formData.images, ...files].slice(0, 3);
      setFormData(prev => ({ ...prev, images: newImages }));

      // Generate previews
      const newPreviews = newImages.map(file => URL.createObjectURL(file));
      // Clean up old previews
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
      setImagePreviews(newPreviews);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
    
    // Update previews
    URL.revokeObjectURL(imagePreviews[index]);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
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

      // Upload all images
      const imageUrls = await Promise.all(
        formData.images.map(image => uploadImage(image))
      );

      // Create new listing
      const newListing: Item = {
        id: generateId(),
        title: formData.title,
        description: formData.description,
        price: priceInSol,
        category: formData.category,
        requiresAddress: formData.requiresAddress,
        requiresEmail: formData.requiresEmail,
        seller: user!.walletAddress,
        images: imageUrls.filter((url): url is string => url !== null),
        status: 'active',
        createdAt: Date.now(),
        quantity: Number(quantity),
        quantitySold: 0,
      };

      // TODO: Replace with actual blockchain transaction
      // For now, we'll just store in localStorage
      const listings = JSON.parse(localStorage.getItem('listings') || '[]');
      listings.push(newListing);
      localStorage.setItem('listings', JSON.stringify(listings));

      // Update user's listings
      const updatedUser = {
        ...user!,
        listings: [...(user!.listings || []), newListing.id],
      };
      localStorage.setItem(`user_${user!.walletAddress}`, JSON.stringify(updatedUser));

      // Redirect to home page
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !connected) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">List New Item</h1>
            <button
              onClick={() => router.push('/')}
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
              <label className="block text-sm font-medium mb-2">Images (up to 3)</label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                    multiple
                    disabled={formData.images.length >= 3}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 cursor-pointer ${
                      formData.images.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Choose Files
                  </label>
                  <span className="text-sm text-gray-400">
                    {formData.images.length}/3 images selected
                  </span>
                </div>

                {/* Image Previews */}
                <div className="flex gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requires-email"
                  checked={formData.requiresEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiresEmail: e.target.checked }))}
                  className="rounded border-white/20"
                />
                <label htmlFor="requires-email" className="text-sm">
                  Requires buyer email
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Quantity Available
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                className="w-full bg-black border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
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
              {isSubmitting ? 'Creating Listing...' : 'List Item'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ListItem; 