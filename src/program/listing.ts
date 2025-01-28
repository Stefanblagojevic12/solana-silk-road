import * as web3 from '@solana/web3.js';
import * as borsh from '@project-serum/borsh';

export interface ListingState {
  seller: web3.PublicKey;
  price: number;
  title: string;
  description: string;
  category: string;
  requiresAddress: boolean;
  imageUrl: string;
  status: 'active' | 'sold' | 'cancelled';
}

export class Listing {
  static SEED = 'listing';
  
  constructor(
    public seller: web3.PublicKey,
    public price: number,
    public title: string,
    public description: string,
    public category: string,
    public requiresAddress: boolean,
    public imageUrl: string,
    public status: 'active' | 'sold' | 'cancelled'
  ) {}

  static borshSchema = borsh.struct([
    borsh.publicKey('seller'),
    borsh.u64('price'),
    borsh.str('title'),
    borsh.str('description'),
    borsh.str('category'),
    borsh.bool('requiresAddress'),
    borsh.str('imageUrl'),
    borsh.str('status'),
  ]);

  static async createListing(
    connection: web3.Connection,
    payer: web3.Keypair,
    listing: ListingState
  ): Promise<web3.TransactionSignature> {
    const program = new web3.PublicKey('YOUR_PROGRAM_ID'); // We'll update this later
    
    const [listingPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from(Listing.SEED), payer.publicKey.toBuffer()],
      program
    );

    const instruction = new web3.TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: listingPda, isSigner: false, isWritable: true },
        { pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: program,
      data: Buffer.from([/* instruction data */]), // We'll implement this
    });

    const transaction = new web3.Transaction().add(instruction);
    
    return await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [payer]
    );
  }
} 