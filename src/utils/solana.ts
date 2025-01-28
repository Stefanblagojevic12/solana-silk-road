import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

// Use QuickNode RPC endpoint
const SOLANA_CONNECTION = new Connection(
  'https://solemn-green-pine.solana-mainnet.quiknode.pro/80293fb0c28dcba21a781984d30749827e3b5fd1',
  {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
    wsEndpoint: 'wss://solemn-green-pine.solana-mainnet.quiknode.pro/80293fb0c28dcba21a781984d30749827e3b5fd1',
  }
);

// Add delay between retries
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sendSolPayment = async (
  wallet: WalletContextState,
  recipientAddress: string,
  amount: number,
  retries = 3
): Promise<string> => {
  try {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Please connect your wallet first');
    }

    let recipientPubKey: PublicKey;
    try {
      recipientPubKey = new PublicKey(recipientAddress);
    } catch (err) {
      throw new Error('Invalid recipient address');
    }

    // Get latest blockhash with retry
    let blockhash, lastValidBlockHeight;
    for (let i = 0; i < 3; i++) {
      try {
        const result = await SOLANA_CONNECTION.getLatestBlockhash('finalized');
        blockhash = result.blockhash;
        lastValidBlockHeight = result.lastValidBlockHeight;
        break;
      } catch (error) {
        if (i === 2) throw error;
        await delay(1000); // Wait 1 second before retry
        continue;
      }
    }

    // Create transaction
    const transaction = new Transaction({
      feePayer: wallet.publicKey,
      recentBlockhash: blockhash,
    }).add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipientPubKey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    // Estimate fee and check balance
    const fee = await transaction.getEstimatedFee(SOLANA_CONNECTION);
    const balance = await SOLANA_CONNECTION.getBalance(wallet.publicKey);
    const totalRequired = (amount * LAMPORTS_PER_SOL) + fee;

    if (balance < totalRequired) {
      throw new Error(
        `Insufficient balance. Required: ${(totalRequired / LAMPORTS_PER_SOL).toFixed(4)} SOL (including fee), ` +
        `Available: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`
      );
    }

    // Sign and send with retry logic
    const signed = await wallet.signTransaction(transaction);
    let signature: string;
    
    try {
      signature = await SOLANA_CONNECTION.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
        preflightCommitment: 'confirmed',
      });
    } catch (error) {
      if (retries > 0) {
        await delay(1000);
        return sendSolPayment(wallet, recipientAddress, amount, retries - 1);
      }
      throw error;
    }

    // Wait for confirmation
    const confirmation = await SOLANA_CONNECTION.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    }, 'confirmed');

    if (confirmation.value.err) {
      if (retries > 0) {
        await delay(1000);
        return sendSolPayment(wallet, recipientAddress, amount, retries - 1);
      }
      throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
    }

    return signature;
  } catch (error) {
    console.error('Payment failed:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Payment failed. Please try again.');
  }
};

export const getBalance = async (address: string): Promise<number> => {
  try {
    if (!address) {
      throw new Error('No address provided');
    }
    const publicKey = new PublicKey(address);
    const balance = await SOLANA_CONNECTION.getBalance(publicKey, 'confirmed');
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Failed to get balance:', error);
    throw error;
  }
}; 