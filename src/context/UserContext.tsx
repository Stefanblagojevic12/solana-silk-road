'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { User, UserContextType } from '../types/types';

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toString();
      const storedUser = localStorage.getItem(`user_${walletAddress}`);
      
      if (storedUser) {
        // Load existing user
        setUser(JSON.parse(storedUser));
      } else {
        // Create new user
        const newUser: User = {
          walletAddress,
          isSeller: false,
          listings: [],
          purchases: [],
          joinedAt: Date.now(),
          lastActive: Date.now(),
        };
        localStorage.setItem(`user_${walletAddress}`, JSON.stringify(newUser));
        setUser(newUser);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [connected, publicKey]);

  // Update lastActive whenever user is active
  useEffect(() => {
    if (user) {
      const updatedUser = {
        ...user,
        lastActive: Date.now(),
      };
      localStorage.setItem(`user_${user.walletAddress}`, JSON.stringify(updatedUser));
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
} 