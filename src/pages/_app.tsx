import type { AppProps } from 'next/app';
import WalletContextProvider from '../components/WalletContextProvider';
import { UserProvider } from '../context/UserContext';
import '../styles/globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WalletContextProvider>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </WalletContextProvider>
  );
} 