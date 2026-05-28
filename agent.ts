import { SapConnection, SapClient } from './synapse-sap-sdk/dist/esm/index.js';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import axios from 'axios';

// ===== CONFIG =====
const ACEDATA_API_KEY = 'a93f53ca29bb4a1497f8471aaf2eb971';
const ACEDATA_BASE = 'https://api.acedata.cloud';
const AI_MODEL = 'claude-sonnet-4-6';

// Your Solana wallet private key (bs58) - REPLACE WITH YOURS
// From the wallet: HRriR5kcbJhjras9kutTnuncPKZH4g563zLNUrhyRVP7
const PRIVATE_KEY = 'YOUR_PRIVATE_KEY_HERE';

async function callAI(prompt: string): Promise<string> {
    const res = await axios.post(
        ACEDATA_BASE + '/v1/chat/completions',
        {
            model: AI_MODEL,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 500,
        },
        { headers: { Authorization: `Bearer ${ACEDATA_API_KEY}` } }
    );
    return res.data.choices[0].message.content;
}

async function registerSAPAgent(client: SapClient) {
    console.log('Registering agent on SAP...');
    const result = await client.agent.register({
        name: 'Sheclk AI Agent',
        description: 'Autonomous agent using AceDataCloud AI services',
        capabilities: [
            { id: 'ai:chat', description: 'AI chat via AceDataCloud', protocolId: 'acedata', version: '1.0.0' },
            { id: 'ai:analysis', description: 'Text analysis', protocolId: 'acedata', version: '1.0.0' },
        ],
        pricing: [],
        protocols: ['acedata'],
    });
    console.log('Agent registered:', result);
    return result;
}

async function main() {
    // 1. Test AI call
    console.log('=== Step 1: Test AI via AceDataCloud ===');
    const aiResponse = await callAI('What is Solana? Answer in one sentence.');
    console.log('AI response:', aiResponse);

    // 2. Register on SAP
    console.log('\n=== Step 2: Register on SAP ===');
    try {
        const conn = SapConnection.devnet();
        const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
        const client = conn.fromKeypair(keypair);
        await registerSAPAgent(client);
        console.log('Wallet:', keypair.publicKey.toBase58());
    } catch (e: any) {
        console.log('SAP registration skipped (need mainnet RPC):', e.message);
    }

    console.log('\n=== Done! ===');
}

main().catch(console.error);
