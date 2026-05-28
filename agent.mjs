import axios from 'axios';
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';

const ACEDATA_KEY = 'a93f53ca29bb4a1497f8471aaf2eb971';
const PRIVATE_KEY = '5wW3GmCW9na7mH6unEhYHkzaJ6dAL35AmpxavXD8TVPbQUMyJJyrgzFvBzjj4LsyaCrwa6gKq3aBUBnMQHgpW6ht';
const WALLET = Keypair.fromSecretKey(bs58.default.decode(PRIVATE_KEY));

async function callAI(prompt) {
    const res = await axios.post(
        'https://api.acedata.cloud/v1/chat/completions',
        { model: 'claude-sonnet-4-6', messages: [{ role: 'user', content: prompt }], max_tokens: 200 },
        { headers: { Authorization: 'Bearer ' + ACEDATA_KEY } }
    );
    return res.data.choices[0].message.content;
}

async function checkBalance() {
    const conn = new Connection('https://api.mainnet-beta.solana.com');
    const bal = await conn.getBalance(WALLET.publicKey);
    console.log('Wallet:', WALLET.publicKey.toBase58());
    console.log('Balance:', bal / LAMPORTS_PER_SOL, 'SOL');
    return bal;
}

async function main() {
    console.log('=== OOBE Agent ===');
    console.log('Wallet:', WALLET.publicKey.toBase58());
    
    const conn = new Connection('https://api.mainnet-beta.solana.com');
    const bal = await conn.getBalance(WALLET.publicKey);
    console.log('Balance:', bal / LAMPORTS_PER_SOL, 'SOL');
    
    // Test AI
    console.log('\n--- AI Service 1: Chat ---');
    const r1 = await callAI('What is Solana? One sentence.');
    console.log(r1);
    
    console.log('\n--- AI Service 2: Sentiment ---');
    const r2 = await callAI('Sentiment: "Solana DeFi is growing fast". Reply: Positive/Negative/Neutral');
    console.log(r2);
    
    console.log('\n--- AI Service 3: Summary ---');
    const r3 = await callAI('Summarize: Solana is a fast blockchain. 5 words.');
    console.log(r3);
    
    console.log('\n=== All tests passed! Ready for SAP registration ===');
    console.log('Next: Fund wallet -> Register agent -> Record demo');
}
main().catch(console.error);
