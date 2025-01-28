'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the wallet button with no SSR
const WalletMultiButtonDynamic = dynamic(
  async () => {
    const { WalletMultiButton } = await import('@solana/wallet-adapter-react-ui');
    return WalletMultiButton;
  },
  { 
    ssr: false,
    loading: () => <div className="h-[36px] w-[180px] bg-white/10 rounded animate-pulse" />
  }
);

export const WalletButton = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[36px] w-[180px] bg-white/10 rounded animate-pulse" />;
  }

  return <WalletMultiButtonDynamic className="bg-white text-black hover:bg-gray-200 transition-all duration-200" />;
}; 