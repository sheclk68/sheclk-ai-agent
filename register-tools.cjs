const { SapConnection } = require("./synapse-sap-sdk/dist/cjs/core/connection.js");
const { Keypair } = require("@solana/web3.js");
const bs58 = require("bs58");
const PRIVATE_KEY = "5wW3GmCW9na7mH6unEhYHkzaJ6dAL35AmpxavXD8TVPbQUMyJJyrgzFvBzjj4LsyaCrwa6gKq3aBUBnMQHgpW6ht";
const WALLET = Keypair.fromSecretKey(bs58.default.decode(PRIVATE_KEY));

async function main() {
    console.log("Registering tools for Sheclk AI Agent...\n");
    const { client } = SapConnection.fromKeypair(
        "https://api.mainnet-beta.solana.com",
        WALLET
    );
    
    const tools = [
  {
    "name": "ai_chat",
    "protocol": "acedata",
    "description": "General AI chat using GPT-4o-mini for crypto market analysis and conversation",
    "inputSchema": "{\"type\": \"object\", \"properties\": {\"prompt\": {\"type\": \"string\"}}, \"required\": [\"prompt\"]}",
    "outputSchema": "{\"type\": \"object\", \"properties\": {\"response\": {\"type\": \"string\"}}, \"required\": [\"response\"]}",
    "category": 1,
    "minFee": 0,
    "maxFee": 1,
    "cooldown": 0,
    "isPublic": true
  },
  {
    "name": "ai_image",
    "protocol": "acedata",
    "description": "Generate images using DALL-E 3 for crypto visualization",
    "inputSchema": "{\"type\": \"object\", \"properties\": {\"prompt\": {\"type\": \"string\"}}, \"required\": [\"prompt\"]}",
    "outputSchema": "{\"type\": \"object\", \"properties\": {\"imageUrl\": {\"type\": \"string\"}}, \"required\": [\"imageUrl\"]}",
    "category": 5,
    "minFee": 0,
    "maxFee": 1,
    "cooldown": 0,
    "isPublic": true
  },
  {
    "name": "ai_embedding",
    "protocol": "acedata",
    "description": "Generate text embeddings using text-embedding-3-small",
    "inputSchema": "{\"type\": \"object\", \"properties\": {\"text\": {\"type\": \"string\"}}, \"required\": [\"text\"]}",
    "outputSchema": "{\"type\": \"object\", \"properties\": {\"embedding\": {\"type\": \"array\", \"items\": {\"type\": \"number\"}}}, \"required\": [\"embedding\"]}",
    "category": 1,
    "minFee": 0,
    "maxFee": 1,
    "cooldown": 0,
    "isPublic": true
  }
];
    
    for (const tool of tools) {
        console.log("Publishing tool: " + tool.name + "...");
        try {
            const sig = await client.tools.publishByName(
                tool.name, tool.protocol, tool.description,
                tool.inputSchema, tool.outputSchema,
                tool.category, tool.minFee, tool.maxFee,
                tool.cooldown, tool.isPublic
            );
            console.log("  OK " + tool.name + " -> https://solscan.io/tx/" + sig);
        } catch (e) {
            if (e.message && e.message.includes("already")) {
                console.log("  SKIP " + tool.name + " already registered");
            } else {
                console.log("  FAIL " + tool.name + ": " + (e.message || "").slice(0, 200));
            }
        }
    }
    console.log("\nDone.");
}
main().catch(e => console.error("Fatal:", e.message));
