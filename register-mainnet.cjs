const { SapConnection } = require('./synapse-sap-sdk/dist/cjs/core/connection.js');
const { Keypair, Connection } = require('@solana/web3.js');
const bs58 = require('bs58');

const PRIVATE_KEY = '5wW3GmCW9na7mH6unEhYHkzaJ6dAL35AmpxavXD8TVPbQUMyJJyrgzFvBzjj4LsyaCrwa6gKq3aBUBnMQHgpW6ht';
const WALLET = Keypair.fromSecretKey(bs58.default.decode(PRIVATE_KEY));
const RPC_URL = 'https://us-1-mainnet.oobeprotocol.ai/rpc?api_key=sk_live_0c47d46a50df41ce0bfebb802d564930be009086b5854de386b894ec3de79863';

async function main() {
    console.log('Wallet:', WALLET.publicKey.toBase58());

    // Check OOBE RPC slot
    const oobeConn = new Connection(RPC_URL);
    const slot = await oobeConn.getSlot();
    console.log('OOBE RPC slot:', slot);
    
    // Check public RPC slot
    const pubConn = new Connection('https://api.mainnet-beta.solana.com');
    const pubSlot = await pubConn.getSlot();
    console.log('Public RPC slot:', pubSlot);
    
    // Check balance on OOBE RPC
    const bal = await oobeConn.getBalance(WALLET.publicKey);
    console.log('Balance on OOBE:', bal / 1e9, 'SOL');
    
    if (Math.abs(slot - pubSlot) > 500) {
        console.log('OOBE RPC too far behind (' + (pubSlot - slot) + ' slots) - trying public RPC');
        const conn = SapConnection.mainnet('https://api.mainnet-beta.solana.com');
        const client = conn.fromKeypair(WALLET);
        try {
            const result = await client.agent.register({
                name: 'Sheclk AI Agent',
                description: 'Autonomous agent powered by AceDataCloud',
                capabilities: [{ id: 'ai:chat', description: 'AI chat', protocolId: 'acedata', version: '1.0.0' }],
                pricing: [],
                protocols: ['acedata'],
            });
            console.log('✅ REGISTERED!', JSON.stringify(result));
        } catch(e) {
            console.log('Public RPC failed:', e.message);
            console.log('The SAP program may need initialization on mainnet');
        }
    } else {
        console.log('OOBE RPC is synced - proceeding');
        const conn = SapConnection.mainnet(RPC_URL);
        const client = conn.fromKeypair(WALLET);
        const result = await client.agent.register({
            name: 'Sheclk AI Agent',
            description: 'Autonomous agent powered by AceDataCloud',
            capabilities: [{ id: 'ai:chat', description: 'AI chat', protocolId: 'acedata', version: '1.0.0' }],
            pricing: [],
            protocols: ['acedata'],
        });
        console.log('✅ AGENT REGISTERED!', JSON.stringify(result, null, 2));
    }
}
main().catch(e => console.error('Error:', e.message));
