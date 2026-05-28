const { Keypair, Connection, PublicKey, VersionedTransaction } = require("@solana/web3.js");
const bs58 = require("bs58");
const fetch = require("axios");

const PRIVATE_KEY = "5wW3GmCW9na7mH6unEhYHkzaJ6dAL35AmpxavXD8TVPbQUMyJJyrgzFvBzjj4LsyaCrwa6gKq3aBUBnMQHgpW6ht";
const WALLET = Keypair.fromSecretKey(bs58.default.decode(PRIVATE_KEY));
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SOL_MINT = "So11111111111111111111111111111111111111112";
const JUPITER_API = "https://quote-api.jup.ag/v6";

async function main() {
    const conn = new Connection("https://api.mainnet-beta.solana.com");
    const bal = await conn.getBalance(WALLET.publicKey);
    console.log("Wallet:", WALLET.publicKey.toBase58());
    console.log("SOL balance:", bal / 1e9);

    // Swap 0.05 USDC for SOL (50000 = 0.05 USDC with 6 decimals)
    const amount = 50000; // 0.05 USDC

    console.log("\nGetting Jupiter quote...");
    const quoteRes = await fetch.get(`${JUPITER_API}/quote`, {
        params: {
            inputMint: USDC_MINT,
            outputMint: SOL_MINT,
            amount: amount,
            slippageBps: 100, // 1%
        }
    });
    const quote = quoteRes.data;
    console.log("Quote:", quote.outAmount / 1e9, "SOL (", quote.outAmount, "lamports)");

    console.log("\nGetting swap transaction...");
    const swapRes = await fetch.post(`${JUPITER_API}/swap`, {
        quoteResponse: quote,
        userPublicKey: WALLET.publicKey.toBase58(),
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
    });
    const swapData = swapRes.data;

    // Deserialize and sign
    const tx = VersionedTransaction.deserialize(Buffer.from(swapData.swapTransaction, "base64"));
    tx.sign([WALLET]);

    console.log("Sending swap transaction...");
    const sig = await conn.sendTransaction(tx, { maxRetries: 3 });
    console.log("Swap sent! Signature:", sig);

    // Wait for confirmation
    const result = await conn.confirmTransaction(sig, "confirmed");
    if (result.value.err) {
        console.log("Swap failed:", result.value.err);
    } else {
        console.log("✅ Swap successful!");
        const newBal = await conn.getBalance(WALLET.publicKey);
        console.log("New SOL balance:", newBal / 1e9);
    }
}

main().catch(e => console.error("Error:", e.response?.data || e.message));
