const { SapConnection } = require("./synapse-sap-sdk/dist/cjs/core/connection.js");
const { Keypair, Connection, PublicKey } = require("@solana/web3.js");
const bs58 = require("bs58");

const PRIVATE_KEY = "5wW3GmCW9na7mH6unEhYHkzaJ6dAL35AmpxavXD8TVPbQUMyJJyrgzFvBzjj4LsyaCrwa6gKq3aBUBnMQHgpW6ht";
const WALLET = Keypair.fromSecretKey(bs58.default.decode(PRIVATE_KEY));
const PROGRAM_ID = new PublicKey("SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ");

async function main() {
    const conn = new Connection("https://api.mainnet-beta.solana.com");
    const bal = await conn.getBalance(WALLET.publicKey);
    console.log("Wallet:", WALLET.publicKey.toBase58());
    console.log("Balance:", bal / 1e9, "SOL");

    // Derive PDAs
    const [agentPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("sap_agent", "utf8"), WALLET.publicKey.toBuffer()],
        PROGRAM_ID
    );
    const [statsPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("sap_stats", "utf8"), agentPda.toBuffer()],
        PROGRAM_ID
    );
    const [pricingPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("sap_pricing", "utf8"), agentPda.toBuffer()],
        PROGRAM_ID
    );
    const [globalPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("sap_global", "utf8")],
        PROGRAM_ID
    );

    console.log("Agent PDA:", agentPda.toBase58());
    console.log("Stats PDA:", statsPda.toBase58());
    console.log("Pricing PDA:", pricingPda.toBase58());
    console.log("Global PDA:", globalPda.toBase58());

    // Get the client to have the program instance
    const { client, connection } = SapConnection.fromKeypair(
        "https://api.mainnet-beta.solana.com",
        WALLET
    );

    // Build the instruction manually with all accounts including pricing_menu
    console.log("\nRegistering agent with pricing_menu account...");

    const tx = await client.agent.methods
        .registerAgent(
            "Sheclk AI Agent",
            "Autonomous AI agent powered by AceDataCloud - chat, sentiment analysis, and summarization services.",
            [{ id: "ai:chat", description: null, protocolId: "acedata", version: null }],
            [{ tierId: "free", pricePerCall: 0, rateLimit: 100, maxCallsPerSession: 0,
               burstLimit: null, tokenType: { sol: {} }, tokenMint: null, tokenDecimals: null,
               settlementMode: null, minEscrowDeposit: null, batchIntervalSec: null,
               volumeCurve: null, minPricePerCall: null, maxPricePerCall: null }],
            ["acedata"],
            null, null, null
        )
        .accounts({
            wallet: WALLET.publicKey,
            agent: agentPda,
            agentStats: statsPda,
            pricingMenu: pricingPda,
            globalRegistry: globalPda,
            systemProgram: new PublicKey("11111111111111111111111111111111"),
        })
        .rpc();

    console.log("\n✅ AGENT REGISTERED!");
    console.log("Transaction: https://solscan.io/tx/" + tx);
}

main().catch(e => {
    console.error("\n❌ Error:", e.message.slice(0, 500));
    if (e.logs) console.log("Logs:", e.logs.join("\n").slice(0, 2000));
});
