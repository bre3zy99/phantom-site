// CONFIGURATION
const RECEIVER_WALLET = "6Lsv1wFcPFhzv1W874tXmdHjNSWDJhojQ3CdrAPQYrtC";
const AMOUNT_SOL = 0.01;

// Main function to send transaction
async function sendTransaction() {
    const btn = document.getElementById('sendBtn');
    const status = document.getElementById('status');
    
    try {
        // Reset UI
        btn.disabled = true;
        btn.textContent = 'Checking Phantom...';
        status.style.display = 'none';
        
        // 1. Check if Phantom Wallet is installed
        if (!window.solana || !window.solana.isPhantom) {
            throw new Error('Install Phantom Wallet first from phantom.app');
        }
        
        const phantom = window.solana;
        
        // 2. Connect to wallet
        btn.textContent = 'Connecting...';
        const { publicKey } = await phantom.connect();
        console.log("Connected wallet:", publicKey.toString());
        
        // 3. Create connection to Solana
        const connection = new solanaWeb3.Connection(
            solanaWeb3.clusterApiUrl('mainnet-beta'),
            'confirmed'
        );
        
        // 4. Check balance
        btn.textContent = 'Checking balance...';
        const balance = await connection.getBalance(publicKey);
        const balanceSol = balance / solanaWeb3.LAMPORTS_PER_SOL;
        
        if (balanceSol < AMOUNT_SOL + 0.001) {
            throw new Error(`Need ${AMOUNT_SOL + 0.001} SOL, you have ${balanceSol.toFixed(4)} SOL`);
        }
        
        // 5. Create transaction
        btn.textContent = 'Creating transaction...';
        const { blockhash } = await connection.getLatestBlockhash();
        
        const transaction = new solanaWeb3.Transaction({
            feePayer: publicKey,
            recentBlockhash: blockhash
        }).add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new solanaWeb3.PublicKey(RECEIVER_WALLET),
                lamports: AMOUNT_SOL * solanaWeb3.LAMPORTS_PER_SOL
            })
        );
        
        // 6. Send transaction
        btn.textContent = 'Approve in Phantom...';
        const { signature } = await phantom.signAndSendTransaction(transaction);
        console.log("Transaction signature:", signature);
        
        // 7. Confirm transaction
        btn.textContent = 'Confirming...';
        await connection.confirmTransaction(signature, 'confirmed');
        
        // SUCCESS
        status.innerHTML = `
            ✅ <strong>Transaction Successful!</strong><br><br>
            Sent ${AMOUNT_SOL} SOL<br>
            To: ${RECEIVER_WALLET}<br>
            Signature: ${signature.substring(0, 30)}...<br><br>
            <a href="https://explorer.solana.com/tx/${signature}" target="_blank" style="color: #0066cc;">
                View Transaction on Explorer
            </a>
        `;
        status.className = 'status success';
        status.style.display = 'block';
        
        btn.textContent = '✅ Transaction Sent!';
        btn.style.background = 'green';
        
        // Reset button after 5 seconds
        setTimeout(() => {
            btn.disabled = false;
            btn.textContent = 'Send Another Transaction';
            btn.style.background = 'black';
        }, 5000);
        
    } catch (error) {
        console.error("Transaction error:", error);
        
        let errorMessage = error.message;
        
        if (error.message.includes('User rejected') || error.message.includes('rejected')) {
            errorMessage = 'Transaction cancelled by user';
        } else if (error.message.includes('insufficient funds')) {
            errorMessage = 'Not enough SOL balance. Need more SOL for transaction + fees';
        } else if (error.message.includes('Install Phantom Wallet')) {
            errorMessage = 'Phantom Wallet not installed. Install from phantom.app';
        }
        
        status.innerHTML = `❌ Error: ${errorMessage}`;
        status.className = 'status error';
        status.style.display = 'block';
        
        btn.disabled = false;
        btn.textContent = 'Try Again';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Attach click event to button
    document.getElementById('sendBtn').addEventListener('click', sendTransaction);
    
    // Auto-check if Phantom is installed
    if (!window.solana || !window.solana.isPhantom) {
        document.getElementById('status').innerHTML = 
            '❌ Phantom Wallet not installed. Please install Phantom Wallet from phantom.app';
        document.getElementById('status').className = 'status error';
        document.getElementById('status').style.display = 'block';
        document.getElementById('sendBtn').disabled = true;
        document.getElementById('sendBtn').textContent = 'Install Phantom Wallet';
    }
});
