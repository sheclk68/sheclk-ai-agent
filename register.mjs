import { SapConnection } from './synapse-sap-sdk/dist/esm/index.js';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const PRIVATE_KEY = '5wW3GmCW9na7mH6unEhYHkzaJ6dAL35AmpxavXD8TVPbQUMyJJyrgzFvBzjj4LsyaCrwa6gKq3aBUBnMQHgpW6ht';
const WALLET = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));

async function main() {
    console.log('=== Registering SAP Agent ===');
    console.log('Wallet:', WALLET.publicKey.toBase58());

    // Use OOBE's mainnet RPC
    const conn = SapConnection.mainnet('https://us-1-mainnet.oobeprotocol.ai/rpc');
    const client = conn.fromKeypair(WALLET);
    console.log('Connected to SAP mainnet');
    
    // Register agent
    const result = await client.agent.register({
        name: 'Sheclk AI Agent',
        description: 'Autonomous agent powered by AceDataCloud AI services on Solana',
        capabilities: [
            { id: 'ai:chat', description: 'AI chat completion', protocolId: 'acedata', version: '1.0.0' },
            { id: 'ai:sentiment', description: 'Sentiment analysis', protocolId: 'acedata', version: '1.0.0' },
            { id: 'ai:summary', description: 'Text summarization', protocolId: 'acedata', version: '1.0.0' },
        ],
        pricing: [],
        protocols: ['acedata'],
    });
    
    console.log('Agent registered!');
    console.log('Result:', JSON.stringify(result, null, 2));
}
main().catch(e => {
    console.error('Error:', e.message);
    if (e.stack) console.error(e.stack.slice(0, 500));
});
