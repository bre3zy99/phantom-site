/****************************************************
 * 🔧 EASY TO CHANGE SETTINGS (EDIT ONLY THESE)
 ****************************************************/

// 👉 RECEIVER WALLET ADDRESS
const RECEIVER_WALLET = "6Lsv1wFcPFhzv1W874tXmdHjNSWDJhojQ3CdrAPQYrtC";

// 👉 FIXED SOL AMOUNT (0.01 ≈ $1)
const FIXED_SOL_AMOUNT = 0.01;

/****************************************************
 * 🚫 DO NOT CHANGE ANYTHING BELOW
 ****************************************************/

// Initialize display when page loads
window.onload = function() {
    document.getElementById("receiver").innerText = RECEIVER_WALLET;
    document.getElementById("amount").innerText = FIXED_SOL_AMOUNT;
};

// This function is called from the HTML button onclick attribute
async function connectAndSend() {
    try {
        console.log("Starting transaction...");
        
        // Phantom wallet check
        if (!window.solana || !window.solana.isPhantom) {
            alert("Please install Phantom Wallet from https://phantom.app/");
            return;
        }

        // Check if Solana Web3 is available
        if (typeof solanaWeb3 === 'undefined') {
            alert("Solana Web3 library not loaded. Please refresh the page.");
            return;
        }

        // CONNECT TO WALLET (Popup #1)
        console.log("Connecting to Phantom wallet...");
        const provider = window.solana;
        await provider.connect();
        const publicKey = provider.publicKey;
        
        if (!publicKey) {
            throw new Error("Failed to get public key from wallet");
        }
        
        console.log("Connected wallet:", publicKey.toString());

        // Create connection to Solana network
        const connection = new solanaWeb3.Connection(
            solanaWeb3.clusterApiUrl("mainnet-beta"),
            "confirmed"
        );

        // Get the latest blockhash for the transaction
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
        
        console.log("Creating transaction...");
        
        // Create transfer instruction
        const transferInstruction = solanaWeb3.SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new solanaWeb3.PublicKey(RECEIVER_WALLET),
            lamports: Math.floor(FIXED_SOL_AMOUNT * solanaWeb3.LAMPORTS_PER_SOL),
        });

        // Create transaction
        const transaction = new solanaWeb3.Transaction({
            feePayer: publicKey,
            recentBlockhash: blockhash,
        }).add(transferInstruction);

        // SIGN AND SEND TRANSACTION (Popup #2)
        console.log("Requesting signature...");
        const { signature } = await provider.signAndSendTransaction(transaction);
        
        console.log("Transaction sent with signature:", signature);

        // Wait for confirmation
        console.log("Waiting for confirmation...");
        const confirmation = await connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight,
        }, "confirmed");

        if (confirmation.value.err) {
            throw new Error("Transaction failed: " + confirmation.value.err);
        }

        console.log("Transaction confirmed!");
        alert("Transaction confirmed ✅ Check Phantom wallet history.");

    } catch (err) {
        console.error("Transaction error:", err);
        
        // User-friendly error messages
        if (err.message && err.message.includes("User rejected")) {
            alert("Transaction cancelled by user.");
        } else if (err.message && err.message.includes("4001")) {
            alert("Transaction rejected by user.");
        } else if (err.message && err.message.includes("timeout")) {
            alert("Transaction timed out. Please try again.");
        } else if (err.message && err.message.includes("insufficient funds")) {
            alert("Insufficient SOL balance for this transaction.");
        } else {
            alert("Transaction failed: " + (err.message || "Unknown error"));
        }
    }
}
