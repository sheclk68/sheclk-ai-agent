const { SapConnection } = require("./synapse-sap-sdk/dist/cjs/core/connection.js");
const { Keypair, Connection } = require("@solana/web3.js");
const bs58 = require("bs58");

const PRIVATE_KEY = "5wW3GmCW9na7mH6unEhYHkzaJ6dAL35AmpxavXD8TVPbQUMyJJyrgzFvBzjj4LsyaCrwa6gKq3aBUBnMQHgpW6ht";
const WALLET = Keypair.fromSecretKey(bs58.default.decode(PRIVATE_KEY));

async function main() {
    console.log("Wallet:", WALLET.publicKey.toBase58());

    const conn = new Connection("https://api.mainnet-beta.solana.com");
    const bal = await conn.getBalance(WALLET.publicKey);
    console.log("Balance:", bal / 1e9, "SOL");

    if (bal < 0.005 * 1e9) {
        console.log("Insufficient SOL. Need ~0.005 SOL for rent + fees.");
        return;
    }

    console.log("");
    console.log("Registering agent on mainnet-beta...");

    const { client } = SapConnection.fromKeypair(
        "https://api.mainnet-beta.solana.com",
        WALLET
    );

    const result = await client.builder
        .agent("Sheclk AI Agent")
        .description("Autonomous AI agent powered by AceDataCloud - chat, sentiment analysis, and summarization services.")
        .addCapability("ai:chat", { protocol: "acedata", description: "General AI chat and conversation" })
        .addCapability("ai:sentiment", { protocol: "acedata", description: "Sentiment analysis for text" })
        .addCapability("ai:summarization", { protocol: "acedata", description: "Text summarization" })
        .addProtocol("acedata")
        .register();

    console.log("");
    console.log("✅ AGENT REGISTERED!");
    console.log("Transaction: https://solscan.io/tx/" + result.txSignature);
    console.log("Agent PDA:", result.agentPda.toBase58());
    console.log("Stats PDA:", result.statsPda.toBase58());
}

main().catch(e => console.error("Error:", e.message));
