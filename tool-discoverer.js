const { Connection, Keypair, PublicKey } = require("@solana/web3.js");
const { SapConnection } = require("./synapse-sap-sdk/dist/cjs/core/connection.js");
const bs58 = require("bs58");

const PRIVATE_KEY = "5wW3GmCW9na7mH6unEhYHkzaJ6dAL35AmpxavXD8TVPbQUMyJJyrgzFvBzjj4LsyaCrwa6gKq3aBUBnMQHgpW6ht";
const WALLET = Keypair.fromSecretKey(bs58.default.decode(PRIVATE_KEY));

class ToolDiscovery {
    constructor() {
        const { client } = SapConnection.fromKeypair(
            "https://api.mainnet-beta.solana.com",
            WALLET
        );
        this.client = client;
    }

    async discoverByCapability(capability) {
        console.log(`[DISCOVER] Searching agents by capability: ${capability}...`);
        try {
            const agents = await this.client.discovery.findAgentsByCapability(capability);
            console.log(`[DISCOVER] Found ${agents.length} agent(s) with capability "${capability}"`);
            agents.forEach(a => {
                const name = a.identity?.name || "Unknown";
                console.log(`  - ${name} (PDA: ${a.pda.toBase58().slice(0, 16)}...)`);
            });
            return agents;
        } catch (e) {
            console.error(`[DISCOVER] Error: ${e.message}`);
            return [];
        }
    }

    async discoverByProtocol(protocol) {
        console.log(`[DISCOVER] Searching agents by protocol: ${protocol}...`);
        try {
            const agents = await this.client.discovery.findAgentsByProtocol(protocol);
            console.log(`[DISCOVER] Found ${agents.length} agent(s) for protocol "${protocol}"`);
            agents.forEach(a => {
                const name = a.identity?.name || "Unknown";
                const caps = a.identity?.capabilities?.length || 0;
                console.log(`  - ${name} (${caps} capabilities)`);
            });
            return agents;
        } catch (e) {
            console.error(`[DISCOVER] Error: ${e.message}`);
            return [];
        }
    }

    async discoverToolsByCategory(category) {
        console.log(`[DISCOVER] Searching tools in category: ${category}...`);
        try {
            const tools = await this.client.discovery.findToolsByCategory(category);
            console.log(`[DISCOVER] Found ${tools.length} tool(s) in category "${category}"`);
            tools.forEach(t => {
                const name = t.descriptor?.name || "Unknown";
                const agent = t.descriptor?.agent?.toBase58()?.slice(0, 16) || "?";
                console.log(`  - ${name} (agent: ${agent}...)`);
            });
            return tools;
        } catch (e) {
            console.error(`[DISCOVER] Error: ${e.message}`);
            return [];
        }
    }

    async getNetworkOverview() {
        try {
            const overview = await this.client.discovery.getNetworkOverview();
            console.log(`[NETWORK] Agents: ${overview.totalAgents} (${overview.activeAgents} active)`);
            console.log(`[NETWORK] Tools: ${overview.totalTools}`);
            console.log(`[NETWORK] Protocols: ${overview.totalProtocols}`);
            console.log(`[NETWORK] Capabilities: ${overview.totalCapabilities}`);
            console.log(`[NETWORK] Vaults: ${overview.totalVaults}`);
            return overview;
        } catch (e) {
            console.error(`[NETWORK] Error: ${e.message}`);
            return null;
        }
    }

    async getOurAgentProfile() {
        try {
            const profile = await this.client.discovery.getAgentProfile(WALLET.publicKey);
            if (!profile) {
                console.log("[PROFILE] Agent not found");
                return null;
            }
            console.log(`[PROFILE] Name: ${profile.identity.name}`);
            console.log(`[PROFILE] Active: ${profile.computed.isActive}`);
            console.log(`[PROFILE] Total Calls: ${profile.computed.totalCalls}`);
            console.log(`[PROFILE] Reputation: ${profile.computed.reputationScore}`);
            console.log(`[PROFILE] Capabilities: ${profile.computed.capabilityCount}`);
            console.log(`[PROFILE] Protocols: ${profile.computed.protocols.join(", ")}`);
            console.log(`[PROFILE] Has x402: ${profile.computed.hasX402}`);
            return profile;
        } catch (e) {
            console.error(`[PROFILE] Error: ${e.message}`);
            return null;
        }
    }
}

// Export for use in daemon
module.exports = { ToolDiscovery };

// Run if called directly
if (require.main === module) {
    (async () => {
        const d = new ToolDiscovery();
        console.log("\n=== SAP Network Overview ===\n");
        await d.getNetworkOverview();
        console.log("\n=== Our Agent Profile ===\n");
        await d.getOurAgentProfile();
        console.log("\n=== Discover by Protocol: acedata ===\n");
        await d.discoverByProtocol("acedata");
        console.log("\n=== Discover by Capability: ai:chat ===\n");
        await d.discoverByCapability("ai:chat");
        console.log("\n=== Discover Tools by Category: data ===\n");
        await d.discoverToolsByCategory("data");
        console.log("\nDone.");
    })();
}
