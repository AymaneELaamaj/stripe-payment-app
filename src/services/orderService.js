import prisma from '../lib/prisma.js';

class OrderService {
  static async createOrder(paymentIntentId, amount, customerEmail) {
    try {
      // Generate order ID
      const orderId = 'ord_' + Date.now();
      
      // Create order in database
      const order = await prisma.order.create({
        data: {
          id: orderId,
          paymentIntentId: paymentIntentId,
          amount: amount,
          customerEmail: customerEmail,
          status: 'pending'
        }
      });
      
      console.log('📝 Order created in database:', order.id, 'for:', customerEmail);
      return order;
      
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  }

  static async findByPaymentIntentId(paymentIntentId) {
    try {
      const order = await prisma.order.findUnique({
        where: { paymentIntentId: paymentIntentId }
      });
      return order;
    } catch (error) {
      console.error('❌ Error finding order by paymentIntentId:', error);
      return null;
    }
  }

  static async findById(orderId) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });
      return order;
    } catch (error) {
      console.error('❌ Error finding order by ID:', error);
      return null;
    }
  }

  static async updateOrderStatus(paymentIntentId, status) {
    try {
      // Find the order first
      const existingOrder = await prisma.order.findUnique({
        where: { paymentIntentId: paymentIntentId }
      });

      if (!existingOrder) {
        console.error('❌ Order not found for paymentIntentId:', paymentIntentId);
        return null;
      }

      // Update the order
      const updateData = { status: status };
      
      if (status === 'paid') {
        updateData.paidAt = new Date();
      } else if (status === 'failed') {
        updateData.failedAt = new Date();
      }

      const order = await prisma.order.update({
        where: { paymentIntentId: paymentIntentId },
        data: updateData
      });

      console.log(`✅ ORDER UPDATED: Order ${order.id} is now ${status.toUpperCase()}`);
      return order;
      
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      return null;
    }
  }
}

export default OrderService;