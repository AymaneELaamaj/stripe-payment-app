const { stripe } = require('../config/stripe');
const OrderService = require('../services/orderService');

class PaymentController {
  static async createPayment(req, res) {
    try {
      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 2000,
        currency: 'usd',
      });

      // Create order in our system
      const order = OrderService.createOrder(paymentIntent.id, 2000);

      // Send response
      res.send({ 
        clientSecret: paymentIntent.client_secret,
        orderId: order.id 
      });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
}

module.exports = PaymentController;