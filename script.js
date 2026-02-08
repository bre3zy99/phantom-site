/****************************************************
 * 🔧 EASY TO CHANGE SETTINGS (EDIT ONLY THESE)
 ****************************************************/

// 👉 CHANGE RECEIVER WALLET ADDRESS HERE
const RECEIVER_WALLET =
  "6Lsv1wFcPFhzv1W874tXmdHjNSWDJhojQ3CdrAPQYrtC";

// 👉 CHANGE FIXED SOL AMOUNT HERE
const FIXED_SOL_AMOUNT = 0.01;

/****************************************************
 * 🚫 DO NOT CHANGE ANYTHING BELOW
 ****************************************************/

document.getElementById("receiver").innerText = RECEIVER_WALLET;
document.getElementById("amount").innerText = FIXED_SOL_AMOUNT;

async function connectAndSend() {
  // Check Phantom
  if (!window.solana || !window.solana.isPhantom) {
    alert("Please install Phantom Wallet");
    return;
  }

  // Connect wallet
  const response = await window.solana.connect();
  const userWallet = response.publicKey;

  // Create connection
  const connection = new solanaWeb3.Connection(
    solanaWeb3.clusterApiUrl("mainnet-beta")
  );

  // Create transaction
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

  // Phantom popup (user approves here)
  const signedTx = await window.solana.signTransaction(transaction);
  await connection.sendRawTransaction(signedTx.serialize());

  alert("Transaction sent. Check Phantom.");
}
