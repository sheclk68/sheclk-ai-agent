const axios = require("axios");
const { Connection, Keypair, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const bs58 = require("bs58");

const ACEDATA_KEY = "a93f53ca29bb4a1497f8471aaf2eb971";
const PRIVATE_KEY = "5wW3GmCW9na7mH6unEhYHkzaJ6dAL35AmpxavXD8TVPbQUMyJJyrgzFvBzjj4LsyaCrwa6gKq3aBUBnMQHgpW6ht";
const WALLET = Keypair.fromSecretKey(bs58.default.decode(PRIVATE_KEY));
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

async function callAI(prompt) {
    const res = await axios.post(
        "https://api.acedata.cloud/v1/chat/completions",
        { model: "claude-sonnet-4-6", messages: [{ role: "user", content: prompt }], max_tokens: 200 },
        { headers: { Authorization: "Bearer " + ACEDATA_KEY } }
    );
    return res.data.choices[0].message.content;
}

async function checkBalance() {
    const conn = new Connection(SOLANA_RPC);
    const bal = await conn.getBalance(WALLET.publicKey);
    console.log("[STATUS] Wallet: %s | Balance: %.6f SOL", WALLET.publicKey.toBase58(), bal / LAMPORTS_PER_SOL);
    return bal;
}

async function tick() {
    const now = new Date().toISOString();
    try {
        const bal = await checkBalance();
        const summary = await callAI("Summarize current crypto market sentiment in one sentence.");
        console.log("[%s] %s", now, summary);
    } catch (e) {
        console.error("[%s] Error: %s", now, e.message);
    }
}

console.log("[BOOT] OOBE Autonomous Agent Daemon");
console.log("[BOOT] Wallet: %s", WALLET.publicKey.toBase58());

// Run every 5 minutes
tick();
setInterval(tick, 5 * 60 * 1000);
