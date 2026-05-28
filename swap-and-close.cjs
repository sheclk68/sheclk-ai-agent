const { Keypair, Connection, PublicKey, VersionedTransaction, Transaction } = require("@solana/web3.js");
const bs58 = require("bs58");
const https = require("https");

const PRIVATE_KEY = "5wW3GmCW9na7mH6unEhYHkzaJ6dAL35AmpxavXD8TVPbQUMyJJyrgzFvBzjj4LsyaCrwa6gKq3aBUBnMQHgpW6ht";
const WALLET = Keypair.fromSecretKey(bs58.default.decode(PRIVATE_KEY));
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SOL_MINT = "So11111111111111111111111111111111111111112";
const JUP_API = "https://api.jup.ag/swap/v1";

function fetchJson(url, data) {
    return new Promise((resolve, reject) => {
        const u = new URL(url);
        const opts = {
            hostname: u.hostname, port: 443,
            path: u.pathname + u.search,
            method: data ? "POST" : "GET",
            headers: { "Content-Type": "application/json" },
        };
        const req = https.request(opts, (res) => {
            let body = "";
            res.on("data", (c) => body += c);
            res.on("end", () => { try { resolve(JSON.parse(body)); } catch { resolve(body); } });
        });
        req.on("error", reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function main() {
    const conn = new Connection("https://api.mainnet-beta.solana.com");
    let solBal = await conn.getBalance(WALLET.publicKey);
    console.log("Initial SOL:", solBal / 1e9);

    // Get swap quote
    console.log("\nGetting swap quote...");
    const quote = await fetchJson(
        `${JUP_API}/quote?inputMint=${USDC_MINT}&outputMint=${SOL_MINT}&amount=1545989&slippageBps=200&dynamicSlippage=true`,
    );
    const outAmount = parseInt(quote.outAmount);
    console.log("Expected SOL out:", outAmount / 1e9);

    // Build swap tx
    console.log("\nBuilding swap tx...");
    const swapRes = await fetchJson(`${JUP_API}/swap`, {
        quoteResponse: quote,
        userPublicKey: WALLET.publicKey.toBase58(),
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 1000,
    });

    const tx = VersionedTransaction.deserialize(Buffer.from(swapRes.swapTransaction, "base64"));
    tx.sign([WALLET]);

    console.log("Sending swap...");
    const sig = await conn.sendTransaction(tx, { maxRetries: 3 });
    console.log("Swap tx:", sig);
    const result = await conn.confirmTransaction(sig, "confirmed");
    if (result.value.err) {
        console.log("Swap failed:", JSON.stringify(result.value.err));
        return;
    }
    console.log("✅ Swap done!");

    solBal = await conn.getBalance(WALLET.publicKey);
    console.log("SOL after swap:", solBal / 1e9);

    // Close empty token accounts to reclaim rent
    console.log("\nClosing empty token accounts...");
    const tokenAccounts = await conn.getTokenAccountsByOwner(
        WALLET.publicKey,
        { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
    );

    for (const { pubkey, account } of tokenAccounts.value) {
        const data = Buffer.from(account.data);
        const amount = data.readBigUint64LE(64);
        console.log(`  Token ${pubkey.toBase58()}: amount=${amount} lamports=${account.lamports}`);
        if (amount === BigInt(0)) {
            const closeIx = {
                keys: [
                    { pubkey, isSigner: false, isWritable: true },
                    { pubkey: WALLET.publicKey, isSigner: false, isWritable: true },
                    { pubkey: WALLET.publicKey, isSigner: true, isWritable: false },
                ],
                programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
                data: Buffer.from([17]), // CloseAccount
            };
            const tx2 = new Transaction().add(closeIx);
            tx2.feePayer = WALLET.publicKey;
            tx2.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;
            tx2.sign(WALLET);
            const sig2 = await conn.sendTransaction(tx2);
            await conn.confirmTransaction(sig2);
            console.log("  ✅ Closed, reclaimed", account.lamports / 1e9, "SOL");
        }
    }

    solBal = await conn.getBalance(WALLET.publicKey);
    console.log("\n💰 Final SOL:", solBal / 1e9);
}

main().catch(e => console.error("Error:", (e.response?.data ? JSON.stringify(e.response.data).substring(0,300) : e.message.substring(0,300))));
