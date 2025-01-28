import { create as ipfsHttpClient } from 'ipfs-http-client';

const projectId = 'YOUR_INFURA_PROJECT_ID';
const projectSecret = 'YOUR_INFURA_PROJECT_SECRET';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = ipfsHttpClient({
  url: 'https://ipfs.infura.io:5001/api/v0',
  headers: {
    authorization: auth,
  },
});

export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    const added = await client.add(
      file,
      {
        progress: (prog) => console.log(`received: ${prog}`)
      }
    );
    return `https://ipfs.io/ipfs/${added.cid.toString()}`;
  } catch (error) {
    console.error('Error uploading file: ', error);
    throw error;
  }
}; 