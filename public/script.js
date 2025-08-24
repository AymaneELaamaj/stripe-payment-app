// Line 1: Initialize Stripe with your publishable key
const stripe = Stripe('pk_test_51Rz46mKvlfLAINJVNnjS5Xh9drj6xZ7oa7ak4qWV4qvJAXONb4xCetsETG1cC6idXngYITlhrHCZFQbeImaqZXMs00qDn9W0rM');

// Line 3: Create Stripe Elements (this makes the card input form)
const elements = stripe.elements();
const cardElement = elements.create('card');

// Line 6: Mount the card element to the page
cardElement.mount('#card-element');

// Line 8: Get references to HTML elements
const buyButton = document.getElementById('buy-button');
const paymentForm = document.getElementById('payment-form');
const submitButton = document.getElementById('submit-payment');
const messagesDiv = document.getElementById('messages');

// Lines 13-21: What happens when user clicks "Buy Now"
buyButton.addEventListener('click', async () => {
  const customerEmail = document.getElementById('customer-email').value;
  
  if (!customerEmail) {
    alert('Please enter your email address');
    return;
  }

  buyButton.style.display = 'none';
  paymentForm.style.display = 'block';
  const response = await fetch('/create-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerEmail: customerEmail })    // ← Send email to server

  });
  if (!response.ok) {                                         // <-- handle 400s
  const { error } = await response.json().catch(() => ({ error: 'Bad Request' }));
  alert('Create payment failed: ' + error);
  buyButton.style.display = 'block';
  paymentForm.style.display = 'none';
  return;
}

  
  const { clientSecret, orderId } = await response.json(); // Get BOTH values
  
  if (!clientSecret) {
  alert('No clientSecret returned from server');
  return;
}

  window.clientSecret = clientSecret;
  window.orderId = orderId; // Store order ID for status checking
});

submitButton.addEventListener('click', async () => {
  messagesDiv.innerHTML = 'Processing payment...';
  
  // Store the order ID we got when creating payment
  const orderId = window.orderId; // We'll need to store this
  
  const { error, paymentIntent } = await stripe.confirmCardPayment(
    window.clientSecret,
    { payment_method: { card: cardElement } }
  );
  
  // SIMULATE NETWORK PROBLEMS (30% chance)
  if (Math.random() > 0.1) {
    messagesDiv.innerHTML = `
      <div style="color: orange; font-weight: bold;">
        ⚠️ NETWORK ERROR! ⚠️<br>
        Checking payment status...<br>
        <div id="status-check">Please wait...</div>
      </div>
    `;
      console.log(orderId)
    
    // Check with OUR SERVER what really happened
    checkPaymentStatus(orderId);
    return;
  }
  
  if (error) {
    messagesDiv.innerHTML = `<div style="color: red;">Payment failed: ${error.message}</div>`;
  } else if (paymentIntent.status === 'succeeded') {
    messagesDiv.innerHTML = `<div style="color: green;">✅ Payment successful! Thank you!</div>`;
  }
});

// NEW FUNCTION: Check real payment status with our server
async function checkPaymentStatus(orderId) {
  const statusDiv = document.getElementById('status-check');
  
  // Poll our server every 2 seconds for up to 30 seconds
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds total
  
  const checkInterval = setInterval(async () => {
    try {
      const response = await fetch(`/order/${orderId}`);
      const order = await response.json();
      console.log('status poll HTTP:', response.status);
      console.log('polled order:', order);              // <— see real payload

      if (order.status === 'paid') {
        // SUCCESS! Payment actually worked
        clearInterval(checkInterval);
        messagesDiv.innerHTML = `
          <div style="color: green; font-weight: bold;">
            ✅ PAYMENT SUCCESSFUL! ✅<br>
            Despite the network error, your payment went through!<br>
            Order ID: ${order.id}<br>
            <small>You will receive a confirmation email shortly.</small>
          </div>
        `;
      } else if (order.status === 'failed') {
        // Payment actually failed
        clearInterval(checkInterval);
        messagesDiv.innerHTML = `
          <div style="color: red;">
            ❌ Payment Failed<br>
            Please try again with a different payment method.
          </div>
        `;
      } else {
        // Still pending, keep checking
        statusDiv.innerHTML = `Still checking... (${attempts + 1}/${maxAttempts})`;
        attempts++;
        
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          statusDiv.innerHTML = 'Please contact support if you were charged.';
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  }, 2000); // Check every 2 seconds
}