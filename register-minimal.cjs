const { SapConnection } = require("./synapse-sap-sdk/dist/cjs/core/connection.js");
const { Keypair, PublicKey } = require("@solana/web3.js");
const bs58 = require("bs58");

const PRIVATE_KEY = "5wW3GmCW9na7mH6unEhYHkzaJ6dAL35AmpxavXD8TVPbQUMyJJyrgzFvBzjj4LsyaCrwa6gKq3aBUBnMQHgpW6ht";
const WALLET = Keypair.fromSecretKey(bs58.default.decode(PRIVATE_KEY));
const PROGRAM_ID = new PublicKey("SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ");

async function main() {
    const conn = new (require("@solana/web3.js").Connection)("https://api.mainnet-beta.solana.com");

    // Derive ALL PDAs manually
    const [agentPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("sap_agent", "utf8"), WALLET.publicKey.toBuffer()], PROGRAM_ID
    );
    const [statsPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("sap_stats", "utf8"), agentPda.toBuffer()], PROGRAM_ID
    );
    const [pricingPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("sap_pricing", "utf8"), agentPda.toBuffer()], PROGRAM_ID
    );
    const [globalPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("sap_global", "utf8")], PROGRAM_ID
    );

    console.log("Agent:", agentPda.toBase58());
    console.log("Stats:", statsPda.toBase58());
    console.log("Pricing:", pricingPda.toBase58());
    console.log("Global:", globalPda.toBase58());

    // Check agent existence
    const agentAcc = await conn.getAccountInfo(agentPda);
    console.log("Agent exists:", !!agentAcc);

    // Check global registry more carefully
    const globalAcc = await conn.getAccountInfo(globalPda);
    console.log("Global exists:", !!globalAcc);
    console.log("Global owner:", globalAcc?.owner.toBase58());
    console.log("Global data length:", globalAcc?.data.length);

    // Debug: Show first 16 bytes hex
    const first16 = Buffer.from(globalAcc.data.slice(0, 16)).toString("hex");
    console.log("Global first 16 bytes:", first16);

    // Get the program
    const { client } = SapConnection.fromKeypair("https://api.mainnet-beta.solana.com", WALLET);

    // Try building the raw instruction manually  
    // Check what Anchor methods are available
    const methods = client.program.methods;
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(methods)).filter(n => n.startsWith("register"));
    console.log("\\nAvailable register methods:", methodNames);

    // Read account as program account
    try {
        const globalDecoded = await conn.getAccountInfo(globalPda);
        const decoded = client.program.account.globalRegistry.coder.accounts.decode("globalRegistry", globalDecoded.data);
        console.log("\\nDecoded via coder:", JSON.stringify(decoded, null, 2));
    } catch(e) {
        console.log("\\nDecode error:", e.message.slice(0, 200));
    }

    // Try ALL instructions to see what the program actually supports
    console.log("\\n=== Checking on-chain account types ===");
    try {
        const ai = await conn.getAccountInfo(agentPda);
        console.log("Agent PDA account:", ai ? "exists" : "does not exist");
    } catch(e) {
        console.log("Agent PDA error:", e.message.slice(0, 200));
    }
}

main().catch(e => console.error("Fatal:", e.message));
