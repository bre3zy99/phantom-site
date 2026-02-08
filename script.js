// Configuration
const RECEIVER_WALLET = "6Lsv1wFcPFhzv1W874tXmdHjNSWDJhojQ3CdrAPQYrtC";
const AMOUNT_SOL = 0.01;

// Wait for page to load
window.addEventListener('DOMContentLoaded', function() {
    const sendBtn = document.getElementById('sendBtn');
    const statusDiv = document.getElementById('status');
    
    // Set up click handler
    sendBtn.addEventListener('click', async function() {
        try {
            // Disable button and clear status
            sendBtn.disabled = true;
            sendBtn.textContent = 'Connecting...';
            statusDiv.style.display = 'none';
            statusDiv.className = '';
            statusDiv.innerHTML = '';
            
            // Check if Phantom is available
            if (!window.solana || !window.solana.isPhantom) {
                throw new Error('Phantom Wallet not found');
            }
            
            const phantom = window.solana;
            
            // Connect to wallet
            sendBtn.textContent = 'Connecting wallet...';
            const { publicKey } = await phantom.connect();
            console.log('Connected wallet:', publicKey.toString());
            
            // Create simple transaction
            sendBtn.textContent = 'Creating transaction...';
            
            // This is the simple transaction format that works in Phantom browser
            const transaction = {
                fromPubkey: publicKey,
                toPubkey: new window.SolanaWeb3.PublicKey(RECEIVER_WALLET),
                lamports: Math.floor(AMOUNT_SOL * 1000000000)
            };
            
            // Sign and send transaction
            sendBtn.textContent = 'Approve in wallet...';
            
            // Use Phantom's signAndSendTransaction
            const { signature } = await phantom.signAndSendTransaction(transaction);
            
            // Success
            sendBtn.textContent = '✅ Transaction Sent!';
            sendBtn.style.background = 'linear-gradient(135deg, #14F195, #9945FF)';
            
            // Show success message
            statusDiv.innerHTML = `
                <strong>✅ Transaction Successful!</strong><br><br>
                Sent: 0.01 SOL<br>
                To: ${RECEIVER_WALLET.substring(0, 15)}...<br>
                Signature: ${signature.substring(0, 20)}...
            `;
            statusDiv.className = 'success';
            statusDiv.style.display = 'block';
            
            // Reset button after 5 seconds
            setTimeout(() => {
                sendBtn.disabled = false;
                sendBtn.textContent = 'Send Another 0.01 SOL';
                sendBtn.style.background = 'linear-gradient(135deg, #9945FF, #14F195)';
            }, 5000);
            
        } catch (error) {
            console.error('Transaction error:', error);
            
            // Show error
            let errorMessage = 'Transaction failed';
            
            if (error.message.includes('User rejected') || error.message.includes('rejected')) {
                errorMessage = 'Transaction cancelled by user';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'Not enough SOL in wallet';
            } else if (error.message.includes('Phantom Wallet not found')) {
                errorMessage = 'Please open in Phantom Wallet browser';
            }
            
            statusDiv.innerHTML = `<strong>❌ ${errorMessage}</strong>`;
            statusDiv.className = 'error';
            statusDiv.style.display = 'block';
            
            sendBtn.disabled = false;
            sendBtn.textContent = 'Try Again';
        }
    });
    
    // Check if we're in Phantom browser
    if (window.solana && window.solana.isPhantom) {
        console.log('Running in Phantom browser');
    } else {
        // Not in Phantom browser
        sendBtn.disabled = true;
        sendBtn.textContent = 'Open in Phantom Browser';
        sendBtn.style.background = '#666';
        
        statusDiv.innerHTML = `
            <strong>⚠️ Open in Phantom Browser</strong><br><br>
            This page must be opened in Phantom Wallet's built-in browser.
        `;
        statusDiv.className = 'error';
        statusDiv.style.display = 'block';
    }
});
