/****************************************************
 * 🔧 EASY TO CHANGE SETTINGS (EDIT ONLY THESE)
 ****************************************************/

// 👉 CHANGE RECEIVER WALLET ADDRESS HERE
const RECEIVER_WALLET =
  "6Lsv1wFcPFhzv1W874tXmdHjNSWDJhojQ3CdrAPQYrtC";

// 👉 CHANGE FIXED SOL AMOUNT HERE (0.01 ≈ $1)
const FIXED_SOL_AMOUNT = 0.01;

/****************************************************
 * 🚫 DO NOT CHANGE ANYTHING BELOW
 ****************************************************/

// Show details on page
document.getElementById("receiver").innerText = RECEIVER_WALLET;
document.getElementById("amount").innerText = FIXED_SOL_AMOUNT;

async function connectAndSend() {
  try {
    // Check Phantom
    if (!window.solana || !window.solana.isPhantom) {
      alert("Please install Phantom Wallet");
      return;
    }

    // Connect wallet (POPUP #1)
    const response = await window.solana.connect();
    const userWallet = response.publicKey;

    // Create Solana connection
    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl("mainnet-beta"),
      "confirmed"
    );

    // Build transaction
    const transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: userWallet,
        toPubkey: new solanaWeb3.PublicKey(RECEIVER_WALLET),
        lamports:
          FIXED_SOL_AMOUNT * solanaWeb3.LAMPORTS_PER_SOL,
      })
    );

    transaction.feePayer = userWallet;
    transaction.recentBlockhash =
      (await connection.getLatestBlockhash()).blockhash;

    // Sign transaction (POPUP #2 — SEND SOL)
    const signedTx = await window.solana.signTransaction(transaction);

    // Send transaction
    const signature = await connection.sendRawTransaction(
      signedTx.serialize()
    );

    // 🔴 THIS WAS MISSING BEFORE — REQUIRED
    await connection.confirmTransaction(signature, "confirmed");

    alert("Transaction confirmed ✅ Check Phantom history.");

  } catch (err) {
    console.error(err);
    alert("Transaction failed or was rejected.");
  }
}
