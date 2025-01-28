export interface Item {
  id: string;
  title: string;
  description: string;
  price: number; // in SOL
  category: Category;
  requiresAddress: boolean;
  requiresEmail: boolean;
  seller: string; // seller's wallet address
  images: string[];  // Change from single image to array of images
  status: 'active' | 'sold' | 'cancelled';
  createdAt: number;
  quantity: number;
  quantitySold: number;
}

export enum Category {
  DIGITAL_GOODS = 'Digital Goods',
  PHYSICAL_ITEMS = 'Physical Items',
  SERVICES = 'Services',
  OTHER = 'Other'
}

export interface Order {
  id: string;
  itemId: string;
  buyer: string;
  seller: string;
  price: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  shippingAddress?: string;
  escrowAccount: string;
}

export interface User {
  walletAddress: string;
  isSeller: boolean;
  listings?: string[];  // Array of listing IDs
  purchases?: string[]; // Array of order IDs
  joinedAt: number;     // Timestamp
  lastActive: number;   // Timestamp
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

export interface Purchase {
  id: string;
  itemId: string;
  item: Item;
  buyer: string;
  seller: string;
  price: number;
  status: 'pending' | 'paid' | 'completed';
  shippingAddress?: string;
  buyerEmail?: string;
  transactionId: string;
  purchaseDate: number;
  escrowStatus: 'pending' | 'held' | 'released' | 'refunded';
  escrowTxId?: string;
  releaseTxId?: string;
}

export interface Sale {
  id: string;
  itemId: string;
  item: Item;
  buyer: string;
  seller: string;
  price: number;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  shippingAddress?: string;
  transactionId: string;
  saleDate: number;
}

export interface AdminSettings {
  adminWallet: string;
  escrowWallet: string;
  serviceFee: number;
}

export interface Transaction {
  id: string;
  purchaseId: string;
  buyerWallet: string;
  sellerWallet: string;
  amount: number;
  status: 'pending' | 'held' | 'released' | 'refunded';
  timestamp: number;
  escrowTxId?: string;
  releaseTxId?: string;
}