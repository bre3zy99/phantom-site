/****************************************************
 * 🔧 EASY TO CHANGE SETTINGS (EDIT ONLY THESE)
 ****************************************************/

// 👉 RECEIVER WALLET ADDRESS
const RECEIVER_WALLET =
  "6Lsv1wFcPFhzv1W874tXmdHjNSWDJhojQ3CdrAPQYrtC";

// 👉 FIXED SOL AMOUNT (0.01 ≈ $1)
const FIXED_SOL_AMOUNT = 0.01;

/****************************************************
 * 🚫 DO NOT CHANGE ANYTHING BELOW
 ****************************************************/

document.getElementById("receiver").innerText = RECEIVER_WALLET;
document.getElementById("amount").innerText = FIXED_SOL_AMOUNT;

async function connectAndSend() {
  try {
    // Phantom check
    if (!window.solana || !window.solana.isPhantom) {
      alert("Please install Phantom Wallet");
      return;
    }

    // CONNECT POPUP (1)
    const { publicKey } = await window.solana.connect();

    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl("mainnet-beta"),
      "confirmed"
    );

    // Create transaction
    const transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new solanaWeb3.PublicKey(RECEIVER_WALLET),
        lamports:
          FIXED_SOL_AMOUNT * solanaWeb3.LAMPORTS_PER_SOL,
      })
    );

    transaction.feePayer = publicKey;

    const latestBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockhash.blockhash;

    // 🚨 THIS LINE IS THE KEY (SEND POPUP #2)
    const { signature } =
      await window.solana.signAndSendTransaction(transaction);

    // Confirm transaction
    await connection.confirmTransaction(
      {
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      },
      "confirmed"
    );

    alert("Transaction confirmed ✅ Check Phantom history.");

  } catch (err) {
    console.error(err);
    alert("Transaction cancelled or failed.");
  }
}
