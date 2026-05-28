const { SapConnection } = require("./synapse-sap-sdk/dist/cjs/core/connection.js");
const { Keypair, Connection, PublicKey } = require("@solana/web3.js");
const bs58 = require("bs58");

const WALLET = Keypair.fromSecretKey(bs58.default.decode("5wW3GmCW9na7mH6unEhYHkzaJ6dAL35AmpxavXD8TVPbQUMyJJyrgzFvBzjj4LsyaCrwa6gKq3aBUBnMQHgpW6ht"));

async function main() {
    // Try public mainnet
    const pub = SapConnection.fromKeypair("https://api.mainnet-beta.solana.com", WALLET);
    try {
        const registry = await pub.client.agent.fetchGlobalRegistry();
        console.log("Public RPC - Global registry:", JSON.stringify(registry, null, 2));
    } catch(e) {
        console.log("Public RPC - fetchGlobalRegistry failed:", e.message.slice(0, 300));
    }

    // Check account directly
    const conn = new Connection("https://api.mainnet-beta.solana.com");
    const accInfo = await conn.getAccountInfo(new PublicKey("9odFrYBBZq6UQC6aGyzMPNXWJQn55kMtfigzhLg6S6L5"));
    if (accInfo) {
        console.log("\\nAccount owner:", accInfo.owner.toBase58());
        console.log("Data length:", accInfo.data.length);
        console.log("Hex (first 64):", Buffer.from(accInfo.data).toString("hex").slice(0, 64));
    } else {
        console.log("Account does NOT exist");
    }
}

main().catch(e => console.error("Error:", e.message));
