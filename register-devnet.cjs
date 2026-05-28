const { SapConnection } = require("./synapse-sap-sdk/dist/cjs/core/connection.js");
const { Keypair, Connection } = require("@solana/web3.js");
const bs58 = require("bs58");

const PRIVATE_KEY = "5wW3GmCW9na7mH6unEhYHkzaJ6dAL35AmpxavXD8TVPbQUMyJJyrgzFvBzjj4LsyaCrwa6gKq3aBUBnMQHgpW6ht";
const WALLET = Keypair.fromSecretKey(bs58.default.decode(PRIVATE_KEY));

async function main() {
    const conn = new Connection("https://api.devnet.solana.com");

    // Check balance on devnet
    let bal = await conn.getBalance(WALLET.publicKey);
    console.log("Wallet:", WALLET.publicKey.toBase58());
    console.log("Devnet balance:", bal / 1e9, "SOL");

    // Airdrop if needed
    if (bal < 0.05 * 1e9) {
        console.log("\nRequesting airdrop on devnet...");
        const sig = await conn.requestAirdrop(WALLET.publicKey, 0.1 * 1e9);
        await conn.confirmTransaction(sig, "confirmed");
        bal = await conn.getBalance(WALLET.publicKey);
        console.log("New balance:", bal / 1e9, "SOL");
    }

    const RPC = "https://api.devnet.solana.com";
    const { client } = SapConnection.fromKeypair(RPC, WALLET);

    console.log("\nRegistering agent on devnet...");
    const result = await client.builder
        .agent("Sheclk AI Agent")
        .description("Autonomous AI agent powered by AceDataCloud - chat, sentiment, summarization.")
        .addCapability("ai:chat", { protocol: "acedata", description: "AI chat" })
        .addCapability("ai:sentiment", { protocol: "acedata", description: "Sentiment analysis" })
        .addCapability("ai:summarization", { protocol: "acedata", description: "Text summarization" })
        .addPricingTier({ tierId: "free", pricePerCall: 0, rateLimit: 100, tokenType: "sol", settlementMode: "instant" })
        .addProtocol("acedata")
        .register();

    console.log("\n✅ AGENT REGISTERED ON DEVNET!");
    console.log("Tx:", result.txSignature);
    console.log("Agent PDA:", result.agentPda.toBase58());
    console.log("Stats PDA:", result.statsPda.toBase58());
}

main().catch(e => {
    console.error("\n❌ Error:", e.message.slice(0, 500));
    if (e.logs) console.log("Logs:", e.logs.join("\n").slice(0, 2000));
});
