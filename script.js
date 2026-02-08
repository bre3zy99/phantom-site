// ============================================
// CONFIGURATION - EDIT THESE TWO VALUES ONLY
// ============================================
const RECEIVER_WALLET = "6Lsv1wFcPFhzv1W874tXmdHjNSWDJhojQ3CdrAPQYrtC";
const FIXED_SOL_AMOUNT = 0.01;
// ============================================

// Global variables
let connectBtn, statusDiv;

// Initialize when page loads
window.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  connectBtn = document.getElementById('connectBtn');
  statusDiv = document.getElementById('status');
  
  // Display receiver and amount
  document.getElementById('receiver').textContent = RECEIVER_WALLET;
  document.getElementById('amount').textContent = FIXED_SOL_AMOUNT;
  
  // Check for Phantom wallet
  checkPhantom();
});

// Check if Phantom is installed
function checkPhantom() {
  if (window.solana && window.solana.isPhantom) {
    // Phantom is installed
    connectBtn.disabled = false;
    connectBtn.textContent = `Connect & Send ${FIXED_SOL_AMOUNT} SOL`;
    connectBtn.addEventListener('click', sendTransaction);
    
    // Check if already connected
    if (window.solana.isConnected) {
      connectBtn.textContent = `Send ${FIXED_SOL_AMOUNT} SOL`;
    }
  } else {
    // Phantom not installed
    showError('Phantom wallet not found. Please install Phantom to continue.');
    connectBtn.disabled = true;
    connectBtn.textContent = 'Install Phantom Wallet';
    connectBtn.onclick = function() {
      window.open('https://phantom.app/', '_blank');
    };
  }
}

// Main transaction function
async function sendTransaction() {
  try {
    // Disable button during process
    connectBtn.disabled = true;
    connectBtn.textContent = 'Connecting...';
    hideStatus();
    
    // Get Phantom provider
    const provider = window.solana;
    
    // Connect to wallet (First popup)
    connectBtn.textContent = 'Approve Connection...';
    await provider.connect();
    
    // Get public key
    const senderPublicKey = provider.publicKey;
    
    // Create transaction
    connectBtn.textContent = 'Creating Transaction...';
    
    // This is the exact transaction format that works
    const transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: new solanaWeb3.PublicKey(RECEIVER_WALLET),
        lamports: FIXED_SOL_AMOUNT * solanaWeb3.LAMPORTS_PER_SOL
      })
    );
    
    // Get recent blockhash (Phantom will handle this internally)
    connectBtn.textContent = 'Preparing...';
    
    // Sign and send transaction (Second popup)
    connectBtn.textContent = 'Approve Transaction...';
    const { signature } = await provider.signAndSendTransaction(transaction);
    
    // Transaction sent successfully
    connectBtn.textContent = '✅ Transaction Sent!';
    connectBtn.style.background = 'linear-gradient(135deg, #14F195, #9945FF)';
    
    // Show success message
    const explorerUrl = `https://explorer.solana.com/tx/${signature}`;
    showSuccess(`
      <strong>Success!</strong><br><br>
      <strong>Amount:</strong> ${FIXED_SOL_AMOUNT} SOL<br>
      <strong>To:</strong> ${RECEIVER_WALLET.substring(0, 10)}...<br><br>
      <a href="${explorerUrl}" target="_blank" style="color: #9945FF; font-weight: bold;">
        View Transaction
      </a>
    `);
    
    // Re-enable button after delay
    setTimeout(() => {
      connectBtn.disabled = false;
      connectBtn.textContent = `Send Another ${FIXED_SOL_AMOUNT} SOL`;
      connectBtn.style.background = 'linear-gradient(135deg, #9945FF, #14F195)';
    }, 5000);
    
  } catch (error) {
    // Handle errors
    console.error('Transaction error:', error);
    
    let errorMsg = 'Transaction failed';
    
    if (error.message.includes('User rejected')) {
      errorMsg = 'Transaction cancelled by user';
    } else if (error.message.includes('insufficient funds')) {
      errorMsg = 'Not enough SOL in wallet';
    } else if (error.message.includes('4001')) {
      errorMsg = 'Connection rejected';
    }
    
    showError(errorMsg);
    connectBtn.disabled = false;
    connectBtn.textContent = `Try Again (${FIXED_SOL_AMOUNT} SOL)`;
  }
}

// Helper functions
function showSuccess(message) {
  statusDiv.innerHTML = message;
  statusDiv.className = 'status success';
  statusDiv.style.display = 'block';
}

function showError(message) {
  statusDiv.innerHTML = `❌ ${message}`;
  statusDiv.className = 'status error';
  statusDiv.style.display = 'block';
}

function hideStatus() {
  statusDiv.style.display = 'none';
}
