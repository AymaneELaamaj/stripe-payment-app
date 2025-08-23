const { stripe, endpointSecret } = require('../config/stripe');
const OrderService = require('../services/orderService');

class WebhookController {
  static handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log('✅ Webhook received and verified!');
    } catch (err) {
      console.log(`❌ Webhook verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const payment = event.data.object;
        console.log('🎉 PAYMENT DEFINITELY SUCCEEDED!');
        console.log('💰 Payment ID:', payment.id);
        
        OrderService.updateOrderStatus(payment.id, 'paid');
        console.log('📦 Ready to ship product!');
        console.log('📧 Should send confirmation email now!');
        break;
        
      case 'payment_intent.payment_failed':
        const failed = event.data.object;
        console.log('💥 PAYMENT DEFINITELY FAILED!');
        
        OrderService.updateOrderStatus(failed.id, 'failed');
        break;
        
      default:
        console.log('📨 Unhandled event type:', event.type);
    }

    res.json({received: true});
  }
}

module.exports = WebhookController;