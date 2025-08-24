import sgMail from '@sendgrid/mail';

// Configure SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  static async sendOrderConfirmation(customerEmail, order) {
    try {
      // ✅ Fix: Convert string date to Date object
      
      // ✅ Add debug logging
      // console.log('🔧 Order data received:');
      // console.log('🔧 Order ID:', order.id);
      // console.log('🔧 Created At (raw):', order.createdAt);
      // console.log('🔧 Created At (type):', typeof order.createdAt);
      // console.log('🔧 Converted date:', orderDate);

      const msg = {
        to: customerEmail,
        from: 'aymanee341@gmail.com', 
        replyTo: 'aymanee341@gmail.com',
        subject: `Order Confirmation #${order.id}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #4CAF50;">Order Confirmed! 🎉</h2>
            
            <p>Hi there!</p>
            <p>Thanks for your purchase. Here are your order details:</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Amount:</strong> $${(order.amount / 100).toFixed(2)}</p>
              <p><strong>Status:</strong> ${order.status}</p>
              <p><strong>Date:</strong> ${order.createdAt}</p>
            </div>
            
            <h3>What's Next?</h3>
            <p>• We'll process your order within 24 hours</p>
            <p>• You'll receive a shipping confirmation email</p>
            <p>• Questions? Reply to this email</p>
            
            <p>Thanks for your business!</p>
            <p><strong>Your Store Team</strong></p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">
              Order placed on ${order.createdAt} at ${order.createdAt}
            </p>
          </div>
        `
      };

      const result = await sgMail.send(msg);
      console.log('📧 ✅ Email sent successfully to:', customerEmail);
      return { success: true, messageId: result[0].headers['x-message-id'] };
      
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      console.error('❌ Full error:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendPaymentFailedEmail(customerEmail, order) {
    try {
      // ✅ Fix: Same date conversion for failed email

      const msg = {
        to: customerEmail,
        from: 'aymanee341@gmail.com',
        replyTo: 'aymanee341@gmail.com',
        subject: `Payment Failed - Order #${order.id}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #f44336;">Payment Could Not Be Processed ❌</h2>
            
            <p>Hi there,</p>
            <p>We had trouble processing your payment for order #${order.id}.</p>
            
            <div style="background: #fff3e0; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800;">
              <p><strong>Don't worry!</strong> No money was charged to your account.</p>
            </div>
            
            <h3>What to do next:</h3>
            <p>• Check your card details and try again</p>
            <p>• Try a different payment method</p>
            <p>• Contact your bank if the issue persists</p>
            
            <p><a href="http://localhost:3000" style="background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Try Again</a></p>
            
            <p>Need help? Reply to this email!</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">
              Order attempted on ${order.createdAt} at ${order.createdAt}
            </p>
          </div>
        `
      };

      await sgMail.send(msg);
      console.log('📧 Payment failed email sent to:', customerEmail);
      return { success: true };
      
    } catch (error) {
      console.error('❌ Failed payment email error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export default EmailService;