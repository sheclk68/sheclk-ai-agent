const { SapConnection } = require("./synapse-sap-sdk/dist/cjs/core/connection.js");
const { Keypair, Connection, PublicKey, LAMPORTS_PER_SOL, Transaction } = require("@solana/web3.js");
const bs58 = require("bs58");

const PRIVATE_KEY = "5wW3GmCW9na7mH6unEhYHkzaJ6dAL35AmpxavXD8TVPbQUMyJJyrgzFvBzjj4LsyaCrwa6gKq3aBUBnMQHgpW6ht";
const WALLET = Keypair.fromSecretKey(bs58.default.decode(PRIVATE_KEY));

async function main() {
    const { client, connection } = SapConnection.fromKeypair(
        "https://api.mainnet-beta.solana.com",
        WALLET
    );

    // Build the instruction without sending it
    const [agentPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("sap_agent", "utf8"), WALLET.publicKey.toBuffer()],
        new PublicKey("SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ")
    );
    const [statsPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("sap_stats", "utf8"), agentPda.toBuffer()],
        new PublicKey("SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ")
    );
    const [globalPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("sap_global", "utf8")],
        new PublicKey("SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ")
    );

    // Get the global registry data one more time to confirm
    const registry = await client.agent.fetchGlobalRegistry();
    console.log("Global registry:", JSON.stringify(registry, null, 2));

    // Check the owner of global_registry
    const accInfo = await connection.getAccountInfo(globalPda);
    console.log("\\nglobal_registry owner:", accInfo.owner.toBase58());
    console.log("Expected owner: SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ");

    // Check the program ID from the client
    console.log("\\nClient program ID:", client.program.programId.toBase58());

    // Try using builder with pricing
    console.log("\\nTrying builder with pricing...");
    try {
        const result = await client.builder
            .agent("Sheclk AI Agent")
            .description("Autonomous AI agent powered by AceDataCloud")
            .addCapability("ai:chat", { protocol: "acedata" })
            .addPricingTier({
                tierId: "free",
                pricePerCall: 0,
                rateLimit: 100,
                tokenType: "sol",
                settlementMode: "instant",
            })
            .addProtocol("acedata")
            .register();
        console.log("SUCCESS! Tx:", result.txSignature);
    } catch(e) {
        console.log("Error:", e.message.slice(0, 500));
        if (e.logs) console.log("Logs:", e.logs.join("\\n").slice(0, 1500));
    }
}

main().catch(e => console.error("Fatal:", e.message));
