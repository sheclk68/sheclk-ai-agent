const axios = require("axios");
const { Connection, Keypair, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const bs58 = require("bs58");

const ACEDATA_KEY = "a93f53ca29bb4a1497f8471aaf2eb971";
const PRIVATE_KEY = "5wW3GmCW9na7mH6unEhYHkzaJ6dAL35AmpxavXD8TVPbQUMyJJyrgzFvBzjj4LsyaCrwa6gKq3aBUBnMQHgpW6ht";
const WALLET = Keypair.fromSecretKey(bs58.default.decode(PRIVATE_KEY));
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";
const ACEDATA_API = "https://api.acedata.cloud";

async function callAI(model, messages) {
    const res = await axios.post(
        ACEDATA_API + "/v1/chat/completions",
        { model, messages, max_tokens: 200 },
        { headers: { Authorization: "Bearer " + ACEDATA_KEY } }
    );
    return res.data.choices[0].message.content;
}

async function generateImage(prompt) {
    const res = await axios.post(
        ACEDATA_API + "/v1/images/generations",
        { model: "dall-e-3", prompt, n: 1, size: "1024x1024" },
        { headers: { Authorization: "Bearer " + ACEDATA_KEY } }
    );
    return res.data.data[0].url;
}

async function getEmbedding(text) {
    const res = await axios.post(
        ACEDATA_API + "/v1/embeddings",
        { model: "text-embedding-3-small", input: text },
        { headers: { Authorization: "Bearer " + ACEDATA_KEY } }
    );
    return res.data.data[0].embedding.slice(0, 5); // preview first 5 values
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

        // Service 1: Chat - market sentiment
        const sentiment = await callAI("gpt-4o-mini", [
            { role: "user", content: "What is the current crypto market sentiment? Reply in one sentence." }
        ]);
        console.log("[%s] [CHAT] %s", now, sentiment);

        // Service 2: Image generation - weekly market card
        const imageUrl = await generateImage("A minimalist crypto market chart with bullish green candles, digital art style");
        console.log("[%s] [IMAGE] %s", now, imageUrl);

        // Service 3: Embedding - demonstrate third capability
        const embedding = await getEmbedding("Solana blockchain AI agent autonomous");
        console.log("[%s] [EMBED] preview: [%s ...]", now, embedding.join(", "));

        console.log("[%s] All 3 AceDataCloud services working!", now);
    } catch (e) {
        console.error("[%s] Error: %s", now, e.message);
    }
}

console.log("[BOOT] OOBE Autonomous Agent Daemon v2");
console.log("[BOOT] Wallet: %s", WALLET.publicKey.toBase58());
console.log("[BOOT] AceDataCloud Services: chat, image, embedding");

tick();
setInterval(tick, 5 * 60 * 1000);
