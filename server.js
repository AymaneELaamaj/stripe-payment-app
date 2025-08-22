// Import the express library
const express = require('express');

//  Import the stripe library  
const stripe = require('stripe')(process.env.sk_test_YOUR_KEY_HERE);

//  Import dotenv to use environment variables
require('dotenv').config();

//  Create an express application instance
const app = express();

//  Tell express to serve files from 'public' folder
// This means when user visits /, they get public/index.html
app.use(express.static('public'));

//  Tell express to automatically parse JSON from requests
// This lets us access req.body in our routes
app.use(express.json());

//  Create a route that handles POST requests to /create-payment
app.post('/create-payment', async (req, res) => {
  try {
    //  Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000,        // $20.00 (amount in cents)
      currency: 'usd',     // US Dollars
    });
    
    //  Send back the client secret (frontend needs this)
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    //  If something goes wrong, send error message
    res.status(400).send({ error: error.message });
  }
});

// Lines 17-19: Start the server on port 3000
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});