const axios = require('axios');
const { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const bs58 = require('bs58');

// ===== CONFIG =====
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

async function testAceDataServices() {
    console.log('\n=== Testing AceDataCloud Services ===');
    
    // Service 1: Chat
    const r1 = await callAI('What is Solana? One sentence.');
    console.log('[Chat]', r1);
    
    // Service 2: Analysis 
    const r2 = await callAI('Analyze this sentence sentiment: "Solana is revolutionizing DeFi". Reply only: Positive/Negative/Neutral');
    console.log('[Sentiment]', r2);
    
    // Service 3: Summarization
    const r3 = await callAI('Summarize in 5 words: Solana is a high-performance blockchain that enables fast and low-cost transactions.');
    console.log('[Summary]', r3);
    
    console.log('All 3 AI services working!');
    return [r1, r2, r3];
}

async function main() {
    console.log('=== OOBE Autonomous Agent ===');
    console.log('Starting...');
    
    // Step 1: Check wallet
    await checkBalance();
    
    // Step 2: Test AI
    await testAceDataServices();
    
    // Step 3: Info
    console.log('\n=== Next Steps ===');
    console.log('1. Fund wallet with SOL for SAP registration');
    console.log('2. Register agent on SAP mainnet');
    console.log('3. Set up Synapse RPC');
    console.log('4. Record demo video');
}

main().catch(console.error);
