'use client';
import Link from 'next/link';
import { ClientWalletButton } from './ClientWalletButton';
import { useUser } from '../context/UserContext';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { AdminSettings } from '../types/types';
import { WalletMultiButton } from '@solana/wallet-adapter-react';

export const Navigation = () => {
  const { user } = useUser();
  const router = useRouter();
  const [settings, setSettings] = useState<AdminSettings>({ 
    adminWallet: '', 
    escrowWallet: '', 
    serviceFee: 0.05 
  });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Only access localStorage on the client side
    const stored = localStorage.getItem('adminSettings');
    if (stored) {
      const parsedSettings = JSON.parse(stored);
      setSettings(parsedSettings);
      if (user?.walletAddress === parsedSettings.adminWallet) {
        setIsAdmin(true);
      }
    }
  }, [user?.walletAddress]);

  return (
    <nav className="p-4 border-b border-white/10 bg-black/90 backdrop-blur-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link 
            href="/" 
            className="flex flex-col items-start hover:opacity-80"
            passHref
          >
            <div className="flex items-baseline">
              <h1 className="text-5xl font-black tracking-tighter mr-2">SOLANA</h1>
              <span className="text-3xl font-extralight tracking-widest border-l border-white/20 pl-2">
                SILK ROAD
              </span>
            </div>
            <span className="text-[10px] font-medium text-white/50 tracking-[0.5em] mt-1 ml-1">
              ANONYMOUS MARKET
            </span>
          </Link>
          
          {user && isAdmin && (
            <Link href="/admin" className="text-gray-300 hover:text-white">
              Admin Dashboard
            </Link>
          )}
        </div>
        
        <div className="flex flex-col items-end">
          <ClientWalletButton />
        </div>
      </div>
    </nav>
  );
}; 