const { SapConnection } = require("./synapse-sap-sdk/dist/cjs/core/connection.js");
const { Keypair, Connection, PublicKey, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const bs58 = require("bs58");

const PRIVATE_KEY = "5wW3GmCW9na7mH6unEhYHkzaJ6dAL35AmpxavXD8TVPbQUMyJJyrgzFvBzjj4LsyaCrwa6gKq3aBUBnMQHgpW6ht";
const WALLET = Keypair.fromSecretKey(bs58.default.decode(PRIVATE_KEY));

async function main() {
    const conn = new Connection("https://api.mainnet-beta.solana.com");
    const bal = await conn.getBalance(WALLET.publicKey);
    console.log("Wallet:", WALLET.publicKey.toBase58());
    console.log("Balance:", bal / LAMPORTS_PER_SOL, "SOL");

    // Derive PDAs
    const { PublicKey: PK } = require("@solana/web3.js");
    const [agentPda] = PK.findProgramAddressSync([Buffer.from("sap_agent", "utf8"), WALLET.publicKey.toBuffer()], new PK("SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ"));
    const [statsPda] = PK.findProgramAddressSync([Buffer.from("sap_stats", "utf8"), agentPda.toBuffer()], new PK("SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ"));
    const [globalPda] = PK.findProgramAddressSync([Buffer.from("sap_global", "utf8")], new PK("SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ"));

    console.log("Agent PDA:", agentPda.toBase58());
    console.log("Stats PDA:", statsPda.toBase58());
    console.log("Global PDA:", globalPda.toBase58());

    // Check if agent already exists
    const agentAcc = await conn.getAccountInfo(agentPda);
    console.log("Agent account exists:", !!agentAcc);
    if (agentAcc) {
        console.log("Agent already registered!");
        return;
    }

    // Try using AgentModule directly
    console.log("\\nAttempting registration via client.agent.register...");
    const { client } = SapConnection.fromKeypair("https://api.mainnet-beta.solana.com", WALLET);

    try {
        const sig = await client.agent.register({
            name: "Sheclk AI Agent",
            description: "Autonomous AI agent powered by AceDataCloud",
            capabilities: [],
            pricing: [],
            protocols: [],
        });
        console.log("SUCCESS! Tx:", sig);
    } catch(e) {
        console.log("Error:", e.message.slice(0, 500));
        if (e.logs) console.log("Logs:", e.logs.join("\\n").slice(0, 1000));
    }
}

main().catch(e => console.error("Fatal:", e.message));
