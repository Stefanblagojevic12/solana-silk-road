import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Navigation } from '../../components/Navigation';
import { Item } from '../../types/types';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUser } from '../../context/UserContext';
import { sendSolPayment } from '../../utils/solana';
import { generateId } from '../../utils/ids';

const Checkout = () => {
  const router = useRouter();
  const { id } = router.query;
  const { connected } = useWallet();
  const { user, setUser } = useUser();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const wallet = useWallet();

  useEffect(() => {
    if (!loading && (!user || !connected)) {
      router.push('/');
    }
  }, [loading, user, connected, router]);

  useEffect(() => {
    if (id) {
      const listings = JSON.parse(localStorage.getItem('listings') || '[]');
      const foundItem = listings.find((listing: Item) => listing.id === id);
      setItem(foundItem || null);
      setLoading(false);
    }
  }, [id]);

  const savePurchaseData = (purchase: Purchase) => {
    try {
      // 1. Save the purchase
      const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
      // Check if purchase already exists
      const purchaseExists = purchases.some(
        (p: Purchase) => p.transactionId === purchase.transactionId
      );
      
      if (!purchaseExists) {
        purchases.push(purchase);
        localStorage.setItem('purchases', JSON.stringify(purchases));

        // 2. Update the listing quantity and status
        const listings = JSON.parse(localStorage.getItem('listings') || '[]');
        const updatedListings = listings.map((listing: Item) => {
          if (listing.id === purchase.itemId) {
            const newQuantitySold = (listing.quantitySold || 0) + 1;
            return {
              ...listing,
              quantitySold: newQuantitySold,
              // Update status if sold out
              status: newQuantitySold >= listing.quantity ? 'sold' : 'active'
            };
          }
          return listing;
        });
        localStorage.setItem('listings', JSON.stringify(updatedListings));

        // 3. Update the user's purchases
        if (user) {
          // Check if purchase ID is already in user's purchases
          const updatedPurchases = user.purchases || [];
          if (!updatedPurchases.includes(purchase.id)) {
            const updatedUser = {
              ...user,
              purchases: [...updatedPurchases, purchase.id]
            };
            localStorage.setItem(`user_${user.walletAddress}`, JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to save purchase data:', error);
      return false;
    }
  };

  const handleConfirmPurchase = async () => {
    if (!connected || !user || !item) {
      alert('Please connect your wallet first');
      return;
    }
    
    // Check if item is still available
    if (item.quantitySold >= item.quantity) {
      alert('This item is sold out');
      return;
    }

    if (item.requiresAddress && !shippingAddress.trim()) {
      alert('Please enter a shipping address');
      return;
    }

    if (item.requiresEmail && !buyerEmail.trim()) {
      alert('Please enter your email address');
      return;
    }

    setIsProcessing(true);
    try {
      // Wait a moment for wallet to be fully ready
      await new Promise(resolve => setTimeout(resolve, 500));

      // Calculate total amount including fee
      const totalAmount = item.price + 0.001;

      console.log('Starting purchase...', {
        amount: totalAmount,
        seller: item.seller,
        connected: connected,
        userWallet: user?.walletAddress
      });

      // Send SOL payment
      const transactionId = await sendSolPayment(
        wallet,
        item.seller,
        totalAmount
      );

      const purchase = {
        id: generateId(),
        itemId: item.id,
        item: item,
        buyer: user.walletAddress,
        seller: item.seller,
        price: totalAmount,
        status: 'paid',
        shippingAddress: item.requiresAddress ? shippingAddress : undefined,
        buyerEmail: item.requiresEmail ? buyerEmail : undefined,
        transactionId,
        purchaseDate: Date.now()
      };

      const saved = savePurchaseData(purchase);
      if (!saved) {
        throw new Error('Failed to save purchase data');
      }

      router.push(`/purchase/success/${purchase.id}`);
    } catch (error) {
      console.error('Purchase failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !item) {
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
          <h1 className="text-2xl font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 gap-8">
            {/* Item Summary */}
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex gap-4">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h2 className="text-xl font-bold">{item.title}</h2>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </div>
            </div>

            {/* Price Details */}
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Price Details</h3>
              <div className="flex justify-between items-center mb-2">
                <span>Item Price</span>
                <span>{item.price} SOL</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Service Fee</span>
                <span>0.001 SOL</span>
              </div>
              <div className="border-t border-white/10 mt-4 pt-4 flex justify-between items-center font-bold">
                <span>Total</span>
                <span>{(item.price + 0.001).toFixed(3)} SOL</span>
              </div>
            </div>

            {/* Shipping Address (if required) */}
            {item.requiresAddress && (
              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Shipping Address</h3>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-lg p-3 h-32 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Enter your shipping address..."
                  required
                />
              </div>
            )}

            {/* Email Address (if required) */}
            {item.requiresEmail && (
              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Email Address</h3>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-lg p-3"
                  placeholder="Enter your email address..."
                  required
                />
              </div>
            )}

            {/* Purchase Button */}
            <button
              onClick={handleConfirmPurchase}
              disabled={isProcessing}
              className={`w-full py-4 rounded-lg transition-all duration-200 ${
                isProcessing
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {isProcessing ? 'Processing...' : `Pay ${(item.price + 0.001).toFixed(3)} SOL`}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout; 