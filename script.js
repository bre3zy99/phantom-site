const RECEIVER_WALLET = "6Lsv1wFcPFhzv1W874tXmdHjNSWDJhojQ3CdrAPQYrtC";
const AMOUNT_SOL = 0.01;

document.getElementById('sendBtn').onclick = async function() {
  const btn = this;
  const status = document.getElementById('status');
  
  try {
    // Reset
    btn.disabled = true;
    btn.textContent = 'Starting...';
    status.textContent = '';
    
    // 1. Check Phantom
    if (!window.solana?.isPhantom) {
      status.textContent = 'Open in Phantom Browser';
      btn.disabled = false;
      btn.textContent = 'Send Now';
      return;
    }
    
    const phantom = window.solana;
    
    // 2. Connect to wallet
    btn.textContent = 'Connecting...';
    const resp = await phantom.connect();
    const sender = resp.publicKey;
    
    // 3. Create transaction object
    const transaction = {
      fromPubkey: sender,
      toPubkey: RECEIVER_WALLET,
      lamports: AMOUNT_SOL * 1_000_000_000 // Convert SOL to lamports
    };
    
    // 4. Send through Phantom
    btn.textContent = 'Approve Transaction...';
    const result = await phantom.signAndSendTransaction(transaction);
    
    // 5. Success
    status.textContent = '✅ Transaction sent! Check Phantom.';
    status.style.color = 'green';
    btn.textContent = '✅ Done';
    btn.style.background = 'green';
    
    // Reset
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'Send Again';
      btn.style.background = '';
    }, 3000);
    
  } catch (error) {
    console.log('Error:', error.message);
    
    if (error.message.includes('reject')) {
      status.textContent = '❌ Transaction rejected';
    } else {
      status.textContent = '❌ Failed - check wallet';
    }
    
    status.style.color = 'red';
    btn.disabled = false;
    btn.textContent = 'Try Again';
  }
};
