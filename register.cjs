const { SapClient } = require('./synapse-sap-sdk/dist/cjs/index.js');
const { SapConnection } = require('./synapse-sap-sdk/dist/cjs/core/connection.js');
const { Keypair, Connection } = require('@solana/web3.js');
const bs58 = require('bs58');

const PRIVATE_KEY = '5wW3GmCW9na7mH6unEhYHkzaJ6dAL35AmpxavXD8TVPbQUMyJJyrgzFvBzjj4LsyaCrwa6gKq3aBUBnMQHgpW6ht';
const WALLET = Keypair.fromSecretKey(bs58.default.decode(PRIVATE_KEY));

async function main() {
    console.log('Wallet:', WALLET.publicKey.toBase58());

    // Use public Solana mainnet RPC
    const conn = new SapConnection({
        rpcUrl: 'https://api.mainnet-beta.solana.com',
        cluster: 'mainnet-beta',
        commitment: 'confirmed'
    });
    const client = conn.fromKeypair(WALLET);
    console.log('Connected! Attempting registration...');
    
    const result = await client.agent.register({
        name: 'Sheclk AI Agent',
        description: 'Autonomous agent using AceDataCloud AI',
        capabilities: [
            { id: 'ai:chat', description: 'Chat', protocolId: 'acedata', version: '1.0.0' },
            { id: 'ai:sentiment', description: 'Sentiment', protocolId: 'acedata', version: '1.0.0' },
        ],
        pricing: [],
        protocols: ['acedata'],
    });
    
    console.log('Registered:', JSON.stringify(result, null, 2));
}
main().catch(e => console.error('Error:', e.message));
