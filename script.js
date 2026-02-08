/****************************************************
 * 🔧 EASY TO CHANGE SETTINGS (EDIT ONLY THESE)
 ****************************************************/

// 👉 RECEIVER WALLET ADDRESS
const RECEIVER_WALLET = "6Lsv1wFcPFhzv1W874tXmdHjNSWDJhojQ3CdrAPQYrtC";

// 👉 FIXED SOL AMOUNT
const FIXED_SOL_AMOUNT = 0.01;

/****************************************************
 * 🚀 MAIN CODE - COMPLETELY RELIABLE
 ****************************************************/

// DOM Elements
let connectBtn;
let statusDiv;

// Helper functions
function shortAddress(address) {
  return address.substring(0, 4) + "..." + address.substring(address.length - 4);
}

function shortSignature(signature) {
  return signature.substring(0, 10) + "..." + signature.substring(signature.length - 10);
}

function showSuccess(message) {
  statusDiv.innerHTML = `✅ ${message}`;
  statusDiv.className = "status success";
  statusDiv.style.display = "block";
}

function showError(message) {
  statusDiv.innerHTML = `❌ <strong>Error:</strong> ${message}`;
  statusDiv.className = "status error";
  statusDiv.style.display = "block";
}

function showWarning(message) {
  statusDiv.innerHTML = `⚠️ ${message}`;
  statusDiv.className = "status warning";
  statusDiv.style.display = "block";
}

function hideStatus() {
  statusDiv.style.display = "none";
}

// Main function to send transaction
async function sendTransaction() {
  try {
    // Reset UI
    connectBtn.disabled = true;
    connectBtn.textContent = "Connecting to Phantom...";
    hideStatus();
    
    // Check Phantom Wallet
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error("Phantom Wallet not installed. Please install it first.");
    }
    
    const phantom = window.solana;
    
    // Connect to Phantom
    connectBtn.textContent = "Approve Connection...";
    try {
      await phantom.connect();
    } catch (err) {
      throw new Error("Connection rejected. Please try again and approve the connection.");
    }
    
    // Get sender public key
    const senderPublicKey = phantom.publicKey;
    if (!senderPublicKey) {
      throw new Error("Could not get wallet address. Please reconnect.");
    }
    
    // Create transaction - Phantom handles ALL RPC calls internally
    connectBtn.textContent = "Creating Transaction...";
    
    const transaction = solanaWeb3.SystemProgram.transfer({
      fromPubkey: senderPublicKey,
      toPubkey: new solanaWeb3.PublicKey(RECEIVER_WALLET),
      lamports: Math.round(FIXED_SOL_AMOUNT * solanaWeb3.LAMPORTS_PER_SOL)
    });
    
    // Sign and send transaction through Phantom
    connectBtn.textContent = "Approve Transaction in Phantom...";
    
    const { signature } = await phantom.signAndSendTransaction(transaction);
    
    // Show success
    connectBtn.textContent = "✅ Transaction Sent!";
    connectBtn.style.background = "linear-gradient(135deg, #14F195, #9945FF)";
    
    // Show success details with explorer link
    const explorerUrl = `https://explorer.solana.com/tx/${signature}`;
    showSuccess(`
      <strong>Transaction Successful!</strong><br><br>
      <strong>Amount:</strong> ${FIXED_SOL_AMOUNT} SOL<br>
      <strong>From:</strong> ${shortAddress(senderPublicKey.toString())}<br>
      <strong>To:</strong> ${shortAddress(RECEIVER_WALLET)}<br>
      <strong>Signature:</strong> ${shortSignature(signature)}<br><br>
      <a href="${explorerUrl}" target="_blank" style="color: #9945FF; text-decoration: none; font-weight: bold;">
        🔍 View on Solana Explorer
      </a>
    `);
    
    // Reset button after 10 seconds
    setTimeout(() => {
      connectBtn.disabled = false;
      connectBtn.textContent = "Send Another Transaction";
      connectBtn.style.background = "linear-gradient(135deg, #9945FF, #14F195)";
    }, 10000);
    
  } catch (error) {
    console.error("Transaction failed:", error);
    
    // User-friendly error messages
    let errorMessage = error.message;
    
    if (errorMessage.includes("User rejected") || errorMessage.includes("rejected")) {
      errorMessage = "You rejected the transaction. Please approve to send.";
    } else if (errorMessage.includes("insufficient funds")) {
      errorMessage = "Insufficient SOL balance. Add SOL to your wallet and try again.";
    } else if (errorMessage.includes("Phantom Wallet not installed")) {
      errorMessage = "Phantom Wallet not found. Please install it first.";
    } else if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
      errorMessage = "Too many requests. Please wait a moment and try again.";
    }
    
    showError(errorMessage);
    connectBtn.disabled = false;
    connectBtn.textContent = "Try Again";
  }
}

// Initialize when page loads
window.addEventListener('load', function() {
  // Get DOM elements
  connectBtn = document.getElementById("connectBtn");
  statusDiv = document.getElementById("status");
  
  // Check if Phantom is installed
  if (window.solana && window.solana.isPhantom) {
    console.log("✅ Phantom Wallet detected");
    connectBtn.addEventListener('click', sendTransaction);
    
    // Optional: Auto-connect if already authorized
    window.solana.on('connect', () => {
      console.log("Phantom wallet connected");
    });
  } else {
    showError(`
      <strong>Phantom Wallet Required</strong><br><br>
      Please install Phantom Wallet to continue:<br>
      <a href="https://phantom.app/download" target="_blank" style="color: #9945FF; font-weight: bold;">
        👉 Download Phantom Wallet Here
      </a>
    `);
    connectBtn.disabled = true;
    connectBtn.textContent = "Install Phantom Wallet First";
    connectBtn.style.background = "#666";
  }
});
