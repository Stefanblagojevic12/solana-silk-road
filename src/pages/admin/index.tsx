import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Navigation } from '../../components/Navigation';
import { useUser } from '../../context/UserContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { AdminSettings, Purchase, Transaction } from '../../types/types';
import { sendSolPayment } from '../../utils/solana';

const AdminDashboard = () => {
  const router = useRouter();
  const { user } = useUser();
  const { connected } = useWallet();
  const wallet = useWallet();
  
  const [settings, setSettings] = useState<AdminSettings>({
    adminWallet: '',
    escrowWallet: '',
    serviceFee: 0.001
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load admin settings
    const storedSettings = localStorage.getItem('adminSettings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    } else {
      // Initialize with current wallet as admin
      const newSettings = {
        adminWallet: user?.walletAddress || '',
        escrowWallet: user?.walletAddress || '',
        serviceFee: 0.001
      };
      localStorage.setItem('adminSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    }

    // Load transactions and purchases
    const storedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const storedPurchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    setTransactions(storedTransactions);
    setPurchases(storedPurchases);
    setLoading(false);
  }, [user]);

  // Check if current user is admin
  const isAdmin = user?.walletAddress === settings.adminWallet;

  const handleReleaseFunds = async (purchase: Purchase) => {
    if (!connected || !isAdmin) return;

    try {
      // Send payment from escrow to seller
      const txId = await sendSolPayment(
        wallet,
        purchase.seller,
        purchase.price
      );

      // Update purchase status
      const updatedPurchases = purchases.map(p => {
        if (p.id === purchase.id) {
          return {
            ...p,
            escrowStatus: 'released',
            releaseTxId: txId
          };
        }
        return p;
      });

      // Update transaction record
      const newTransaction: Transaction = {
        id: `rel_${purchase.id}`,
        purchaseId: purchase.id,
        buyerWallet: purchase.buyer,
        sellerWallet: purchase.seller,
        amount: purchase.price,
        status: 'released',
        timestamp: Date.now(),
        escrowTxId: purchase.escrowTxId,
        releaseTxId: txId
      };

      const updatedTransactions = [...transactions, newTransaction];

      // Save updates
      localStorage.setItem('purchases', JSON.stringify(updatedPurchases));
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      
      setPurchases(updatedPurchases);
      setTransactions(updatedTransactions);

    } catch (error) {
      console.error('Failed to release funds:', error);
      alert('Failed to release funds. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

        {/* Settings Section */}
        <div className="bg-white/5 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400">Admin Wallet</label>
              <p className="font-mono">{settings.adminWallet}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400">Escrow Wallet</label>
              <p className="font-mono">{settings.escrowWallet}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400">Service Fee</label>
              <p>{settings.serviceFee} SOL</p>
            </div>
          </div>
        </div>

        {/* Pending Releases */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Pending Releases</h2>
          <div className="space-y-4">
            {purchases
              .filter(p => p.escrowStatus === 'held')
              .map(purchase => (
                <div key={purchase.id} className="bg-white/5 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{purchase.item.title}</h3>
                      <p className="text-sm text-gray-400">
                        Buyer: {purchase.buyer}
                      </p>
                      <p className="text-sm text-gray-400">
                        Seller: {purchase.seller}
                      </p>
                      <p className="text-sm text-gray-400">
                        Amount: {purchase.price} SOL
                      </p>
                    </div>
                    <button
                      onClick={() => handleReleaseFunds(purchase)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Release Funds
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-xl font-bold mb-4">Transaction History</h2>
          <div className="space-y-4">
            {transactions.map(tx => (
              <div key={tx.id} className="bg-white/5 rounded-lg p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-400">
                      From: {tx.buyerWallet}
                    </p>
                    <p className="text-sm text-gray-400">
                      To: {tx.sellerWallet}
                    </p>
                    <p className="font-bold">{tx.amount} SOL</p>
                    <p className="text-sm text-gray-400">
                      Status: {tx.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                    {tx.escrowTxId && (
                      <a
                        href={`https://explorer.solana.com/tx/${tx.escrowTxId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        View Escrow TX
                      </a>
                    )}
                    {tx.releaseTxId && (
                      <a
                        href={`https://explorer.solana.com/tx/${tx.releaseTxId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 block"
                      >
                        View Release TX
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 