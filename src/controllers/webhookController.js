import { stripe, endpointSecret } from '../config/stripe.js';
import OrderService from '../services/orderService.js';
import EmailService from '../services/emailService.js';

import prisma from '../lib/prisma.js';


class WebhookController {
  static async handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log('✅ Webhook received and verified!');
    } catch (err) {
      console.log(`❌ Webhook verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    try{
      await prisma.webhookEvent.create({
        data: {
          eventId: event.id,
          type: event.type,
          payload: event,
          processed: false
        }
      });
      console.log('✅ Webhook event logged to database');

    }catch(err){
      console.log('❌ Failed to log webhook event ', err.message);
      return res.status(200).send('duplicate');
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const payment = event.data.object;
        console.log('🎉 PAYMENT DEFINITELY SUCCEEDED!');
        console.log('💰 Payment ID:', payment.id);
        
        const order = await OrderService.updateOrderStatus(payment.id, 'paid');
        
          if (order) {
          // Send confirmation email!                       // ← NEW: Send email!
          const emailResult = await EmailService.sendOrderConfirmation(
            order.customerEmail, 
            order
          );
          
          if (emailResult.success) {
            console.log('✅ Confirmation email sent successfully!');
          } else {
            console.log('❌ Email failed, but order is still valid');
          }
        }
        
        console.log('📦 Ready to ship product!');
        console.log('📧 Should send confirmation email now!');
        break;
        
      case 'payment_intent.payment_failed':
        const failed = event.data.object;
        console.log('💥 PAYMENT DEFINITELY FAILED!');
        
        const failedOrder = await OrderService.updateOrderStatus(failed.id, 'failed');
        if (failedOrder) {
          // Send failure email                            // ← NEW: Send failure email!
          await EmailService.sendPaymentFailedEmail(
            failedOrder.customerEmail, 
            failedOrder
          );
          console.log('📧 Payment failed email sent');
        }
        break;
        
      default:
        console.log('📨 Unhandled event type:', event.type);
    }
     await prisma.webhookEvent.update({
        where: { eventId: event.id },
        data: { processed: true }
      });

      return res.json({received: true});
  }
}

export default WebhookController;