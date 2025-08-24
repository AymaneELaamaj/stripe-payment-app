import { stripe } from '../config/stripe.js';
import OrderService from '../services/orderService.js';

class PaymentController {
  static async createPayment(req, res) {
    try {
      const { customerEmail } = req.body;
      if (!customerEmail) {
        return res.status(400).send({ error: 'Customer email is required' });}

      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 2000,
        currency: 'usd',
        receipt_email: customerEmail,                         // ← Tell Stripe the email

      });
      
      // Create order in our system
      const order = await OrderService.createOrder(paymentIntent.id, 2000, customerEmail);
      
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

export default PaymentController;