const bs58 = require("bs58");
const { Keypair, Connection, PublicKey, VersionedTransaction } = require("@solana/web3.js");
const https = require("https");

const pk = "5wW3GmCW9na7mH6unEhYHkzaJ6dAL35AmpxavXD8TVPbQUMyJJyrgzFvBzjj4LsyaCrwa6gKq3aBUBnMQHgpW6ht";
const wallet = Keypair.fromSecretKey(bs58.default.decode(pk));

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = { hostname: u.hostname, port: 443, path: u.pathname + u.search, method: "GET", headers: { "Content-Type": "application/json" } };
    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => { try { resolve(JSON.parse(d)); } catch(e) { resolve(d); } });
    });
    req.on("error", reject);
    req.end();
  });
}

async function main() {
  console.log("Wallet:", wallet.publicKey.toBase58());

  const SOL_MINT = "So11111111111111111111111111111111111111112";
  const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  const amount = "1000000"; // 0.001 SOL

  const quoteUrl = "https://api.jup.ag/swap/v1/quote?inputMint=" + SOL_MINT + "&outputMint=" + USDC_MINT + "&amount=" + amount + "&slippageBps=50";
  console.log("Fetching quote...");
  const quote = await httpGet(quoteUrl);
  console.log("Route:", JSON.stringify(quote).substring(0, 500));
}
main().catch(e => console.error("Error:", e.message));
