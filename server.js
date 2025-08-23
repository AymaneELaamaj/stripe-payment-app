// LINE 1: Import Express library
const express = require('express');
// ROLE: Gets the Express web framework so we can build a web server

// LINE 2: Create the web server application
const app = express();
// ROLE: Creates your actual web server instance that will handle requests

// LINE 3: Load environment variables from .env file
require('dotenv').config();
// ROLE: Reads your .env file and makes variables like STRIPE_SECRET_KEY available

// LINE 4: Import and initialize Stripe with your secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// ROLE: Creates connection to Stripe API using your secret key from .env file

// LINE 5: Get webhook secret from environment variables
const endpointSecret = process.env.WEBHOOK_SECRET;
// ROLE: Stores your webhook secret for verifying messages actually come from Stripe

// LINE 6: Tell Express to serve static files from 'public' folder
app.use(express.static('public'));
// ROLE: When someone visits your site, they get HTML/CSS/JS files from public folder

// LINE 7: Special handling for webhook route (MUST come before express.json())
app.use('/stripe-webhook', express.raw({type: 'application/json'}));
// ROLE: Tells Express "for /stripe-webhook route, keep data as raw bytes, don't convert to JSON"

// LINE 8: Parse JSON for all other routes
app.use(express.json());
// ROLE: Automatically converts incoming JSON data to JavaScript objects for non-webhook routes

// LINE 9: Create array to store orders in memory
let orders = [];
// ROLE: Simple storage for orders (in real app, this would be a database)

// LINES 10-30: Route to create payment
app.post('/create-payment', async (req, res) => {
  try {
    // LINE 12: Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000,        // $20.00 in cents
      currency: 'usd',     // US dollars
    });
    // ROLE: Asks Stripe to prepare to receive $20 payment, gets back payment intent object

    // LINES 17-23: Create order record in our system
    const order = {
      id: 'ord_' + Date.now(),                    // Unique order ID using timestamp
      paymentIntentId: paymentIntent.id,          // Links our order to Stripe's payment
      amount: 2000,                               // Amount in cents
      status: 'pending',                          // Payment not confirmed yet
      createdAt: new Date()                       // When order was created
    };
    // ROLE: Creates our own order record that tracks the business transaction

    // LINE 24: Add order to our storage
    orders.push(order);
    // ROLE: Saves the order in our array (like adding to database)

    // LINE 25: Log for debugging
    console.log('📝 Order created:', order.id, 'Status: PENDING');
    // ROLE: Shows us what's happening for debugging

    // LINES 27-31: Send response back to frontend
    res.send({ 
      clientSecret: paymentIntent.client_secret,  // Frontend needs this to show payment form
      orderId: order.id                           // Frontend needs this to track order
    });
    // ROLE: Gives frontend the "ticket" to complete payment + our order ID

  } catch (error) {
    // LINE 32: Handle errors
    res.status(400).send({ error: error.message });
    // ROLE: If anything goes wrong, tell frontend about the error
  }
});

// LINES 34-65: Webhook handler - receives events from Stripe
app.post('/stripe-webhook', (req, res) => {
  // LINE 35: Get signature from Stripe headers
  const sig = req.headers['stripe-signature'];
  // ROLE: Gets the security signature Stripe sends to prove message is authentic

  let event;
  try {
    // LINE 39: Verify webhook actually came from Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    // ROLE: Checks signature to make sure this isn't a fake message from hacker
    
    console.log('✅ Webhook received and verified!');
  } catch (err) {
    // LINE 42: Security check failed
    console.log(`❌ Webhook verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
    // ROLE: Rejects fake/invalid webhook attempts
  }

  // LINES 46-64: Process different types of events
  switch (event.type) {
    case 'payment_intent.succeeded':
      // LINES 47-58: Payment definitely succeeded
      const payment = event.data.object;
      console.log('🎉 PAYMENT DEFINITELY SUCCEEDED!');
      console.log('💰 Payment ID:', payment.id);
      console.log('💵 Amount received:', payment.amount, 'cents');
      
      // LINE 52: Find our order that matches this payment
      const order = orders.find(o => o.paymentIntentId === payment.id);
      // ROLE: Links Stripe's payment to our business order
      
      if (order) {
        // LINES 54-57: Update our order status
        order.status = 'paid';
        order.paidAt = new Date();
        console.log('✅ ORDER UPDATED: Order', order.id, 'is now PAID');
        console.log('📦 Ready to ship product!');
        // ROLE: Marks order as paid in our system so we know to fulfill it
      }
      break;
      
    case 'payment_intent.payment_failed':
      // LINES 59-67: Payment definitely failed
      const failed = event.data.object;
      console.log('💥 PAYMENT DEFINITELY FAILED!');
      
      const failedOrder = orders.find(o => o.paymentIntentId === failed.id);
      if (failedOrder) {
        failedOrder.status = 'failed';
        console.log('❌ ORDER UPDATED: Order', failedOrder.id, 'FAILED');
        // ROLE: Marks order as failed so we don't ship anything
      }
      break;
  }

  // LINE 68: Tell Stripe we processed the webhook
  res.json({received: true});
  // ROLE: Confirms to Stripe that we got and handled their message
});

// LINES 70-77: Route to check order status
app.get('/order/:orderId', (req, res) => {
  // LINE 71: Find order by ID from URL
  const order = orders.find(o => o.id === req.params.orderId);
  // ROLE: Searches our orders for the specific ID requested
  
  if (order) {
    res.json(order);        // Send order data if found
  } else {
    res.status(404).json({ error: 'Order not found' });  // Send error if not found
  }
  // ROLE: Lets frontend check current status of any order
});

// LINES 78-80: Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
// ROLE: Makes your server start listening for visitors on port 3000