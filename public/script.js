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
  // Hide buy button, show payment form
  buyButton.style.display = 'none';
  paymentForm.style.display = 'block';
  
  // Call our backend to create payment intent
  const response = await fetch('/create-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  const { clientSecret } = await response.json();
  
  // Store client secret for later use
  window.clientSecret = clientSecret;
});

// Lines 27-45: What happens when user clicks "Pay $20"
submitButton.addEventListener('click', async () => {
  messagesDiv.innerHTML = 'Processing payment...';
  
  // Confirm payment with Stripe
  const { error, paymentIntent } = await stripe.confirmCardPayment(
    window.clientSecret,
    {
      payment_method: {
        card: cardElement
      }
    }
  );
  
  if (error) {
    // Payment failed
    messagesDiv.innerHTML = `Payment failed: ${error.message}`;
  } else if (paymentIntent.status === 'succeeded') {
    // Payment successful
    messagesDiv.innerHTML = 'Payment successful! Thank you!';
  }
});