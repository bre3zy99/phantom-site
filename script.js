// ========================================
// CONFIGURATION
// ========================================
const RECEIVER_WALLET = "6Lsv1wFcPFhzv1W874tXmdHjNSWDJhojQ3CdrAPQYrtC";
const FIXED_SOL_AMOUNT = 0.01;
// ========================================

// Wait for page to load
window.addEventListener('load', function() {
    const sendBtn = document.getElementById('sendBtn');
    const statusDiv = document.getElementById('status');
    const balanceDiv = document.getElementById('balance');
    
    // Check for Phantom Wallet
    if (window.solana && window.solana.isPhantom) {
        // Phantom is installed
        console.log("✅ Phantom Wallet detected");
        
        sendBtn.addEventListener('click', async function() {
            try {
                // Clear previous status
                statusDiv.style.display = 'none';
                statusDiv.innerHTML = '';
                sendBtn.disabled = true;
                sendBtn.textContent = 'Connecting...';
                
                // Connect to Phantom wallet
                const phantom = window.solana;
                const response = await phantom.connect({ onlyIfTrusted: false });
                const senderPublicKey = response.publicKey;
                
                console.log("Connected:", senderPublicKey.toString());
                sendBtn.textContent = 'Checking balance...';
                
                // Create connection
                const connection = new solanaWeb3.Connection(
                    solanaWeb3.clusterApiUrl('mainnet-beta'),
                    'confirmed'
                );
                
                // Get account balance
                const balance = await connection.getBalance(senderPublicKey);
                const balanceInSol = balance / solanaWeb3.LAMPORTS_PER_SOL;
                
                // Update balance display
                balanceDiv.textContent = balanceInSol.toFixed(6);
                
                // Check if user has enough balance
                const amountInLamports = FIXED_SOL_AMOUNT * solanaWeb3.LAMPORTS_PER_SOL;
                const requiredTotal = amountInLamports + 5000; // Add 5000 lamports for fees
                
                if (balance < requiredTotal) {
                    statusDiv.innerHTML = `
                        <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px;">
                            <strong>❌ Insufficient Balance</strong><br><br>
                            You need at least ${(requiredTotal/solanaWeb3.LAMPORTS_PER_SOL).toFixed(6)} SOL<br>
                            Your balance: ${balanceInSol.toFixed(6)} SOL<br><br>
                            Please add more SOL to your wallet.
                        </div>
                    `;
                    statusDiv.style.display = 'block';
                    sendBtn.disabled = false;
                    sendBtn.textContent = 'Try Again';
                    return;
                }
                
                sendBtn.textContent = 'Creating transaction...';
                
                // Get recent blockhash
                const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
                
                // Create transaction
                const transaction = new solanaWeb3.Transaction({
                    recentBlockhash: blockhash,
                    feePayer: senderPublicKey
                });
                
                // Add transfer instruction
                const transferInstruction = solanaWeb3.SystemProgram.transfer({
                    fromPubkey: senderPublicKey,
                    toPubkey: new solanaWeb3.PublicKey(RECEIVER_WALLET),
                    lamports: amountInLamports
                });
                
                transaction.add(transferInstruction);
                
                // Sign and send transaction
                sendBtn.textContent = 'Approve in Phantom...';
                
                const { signature } = await phantom.signAndSendTransaction(transaction);
                
                // Wait for confirmation
                sendBtn.textContent = 'Confirming...';
                
                const confirmation = await connection.confirmTransaction({
                    signature,
                    blockhash,
                    lastValidBlockHeight
                }, 'confirmed');
                
                if (confirmation.value.err) {
                    throw new Error('Transaction failed: ' + confirmation.value.err);
                }
                
                // Success
                sendBtn.textContent = '✅ Success!';
                sendBtn.style.background = 'green';
                
                statusDiv.innerHTML = `
                    <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 8px;">
                        <strong>✅ Transaction Confirmed!</strong><br><br>
                        <strong>Amount:</strong> ${FIXED_SOL_AMOUNT} SOL<br>
                        <strong>From:</strong> ${senderPublicKey.toString().substring(0, 10)}...<br>
                        <strong>To:</strong> ${RECEIVER_WALLET.substring(0, 10)}...<br>
                        <strong>Signature:</strong> ${signature.substring(0, 30)}...<br><br>
                        <a href="https://explorer.solana.com/tx/${signature}" target="_blank" style="color: #0066cc;">
                            View Transaction
                        </a>
                    </div>
                `;
                statusDiv.style.display = 'block';
                
                // Reset button after 5 seconds
                setTimeout(() => {
                    sendBtn.disabled = false;
                    sendBtn.textContent = 'Send Another Transaction';
                    sendBtn.style.background = 'black';
                }, 5000);
                
            } catch (error) {
                console.error('Error:', error);
                
                // Handle specific errors
                let errorMessage = 'Transaction failed';
                
                if (error.message && error.message.includes('User rejected')) {
                    errorMessage = 'Transaction was cancelled by user';
                } else if (error.message && error.message.includes('4001')) {
                    errorMessage = 'Connection was rejected';
                } else if (error.message && error.message.includes('insufficient funds')) {
                    errorMessage = 'Not enough SOL for transaction + fees';
                } else if (error.message && error.message.includes('Transaction failed')) {
                    errorMessage = error.message;
                }
                
                statusDiv.innerHTML = `
                    <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px;">
                        <strong>❌ ${errorMessage}</strong>
                    </div>
                `;
                statusDiv.style.display = 'block';
                
                sendBtn.disabled = false;
                sendBtn.textContent = 'Try Again';
            }
        });
        
        // Check balance on page load
        setTimeout(async () => {
            try {
                const phantom = window.solana;
                if (phantom.isConnected) {
                    const response = await phantom.connect({ onlyIfTrusted: true });
                    const senderPublicKey = response.publicKey;
                    
                    const connection = new solanaWeb3.Connection(
                        solanaWeb3.clusterApiUrl('mainnet-beta'),
                        'confirmed'
                    );
                    
                    const balance = await connection.getBalance(senderPublicKey);
                    const balanceInSol = balance / solanaWeb3.LAMPORTS_PER_SOL;
                    balanceDiv.textContent = balanceInSol.toFixed(6);
                }
            } catch (err) {
                // Silent fail - user not connected yet
                balanceDiv.textContent = 'Connect to see balance';
            }
        }, 1000);
        
    } else {
        // Phantom not installed
        sendBtn.disabled = true;
        sendBtn.textContent = 'Install Phantom Wallet';
        sendBtn.style.background = '#666';
        
        statusDiv.innerHTML = `
            <div style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; text-align: center;">
                <strong>⚠️ Phantom Wallet Required</strong><br>
                Install Phantom from: <a href="https://phantom.app/" target="_blank">phantom.app</a>
            </div>
        `;
        statusDiv.style.display = 'block';
    }
});
