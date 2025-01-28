'use client';
import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { WalletButton } from './WalletButton';
import '@solana/wallet-adapter-react-ui/styles.css';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';

export const ClientWalletButton = () => {
  const { user } = useUser();
  const { connected, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-end">
      <WalletButton />
      {user && mounted && (
        <div className="mt-2 flex gap-2">
          <Link 
            href="/dashboard/buyer"
            className="text-xs text-white/50 hover:text-white transition-all duration-200 cursor-pointer"
          >
            Purchases
          </Link>
          <span className="text-white/50">·</span>
          <Link 
            href="/dashboard/seller"
            className="text-xs text-white/50 hover:text-white transition-all duration-200 cursor-pointer"
          >
            Seller Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}; 