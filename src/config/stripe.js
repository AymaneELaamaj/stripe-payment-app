require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.WEBHOOK_SECRET;

module.exports = {
  stripe,
  endpointSecret
};