import 'dotenv/config';
import express from 'express';
import PaymentController from './src/controllers/paymentController.js';
import WebhookController from'./src/controllers/webhookController.js';
import OrderController from './src/controllers/orderController.js';

const app = express();

// 1) Static files (frontend)
app.use(express.static('public'));

// 2) Stripe webhook MUST be raw + BEFORE express.json
app.post(
  '/stripe-webhook',
  express.raw({ type: 'application/json' }),
  WebhookController.handleStripeWebhook
);

// 3) JSON for all normal API routes
app.use(express.json());

// 4) API routes
app.post('/create-payment', PaymentController.createPayment);
app.get('/order/:orderId', OrderController.getOrder);

// (optional) health + basic errors
app.get('/health', (_req, res) => res.send('ok'));
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// 5) Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
