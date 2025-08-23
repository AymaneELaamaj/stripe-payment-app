const Order = require('../models/Order');

// In-memory storage (will become database later)
let orders = [];

class OrderService {
  static createOrder(paymentIntentId, amount) {
    const order = new Order(paymentIntentId, amount);
    orders.push(order);
    console.log('📝 Order created:', order.id, 'Status: PENDING');
    return order;
  }

  static findByPaymentIntentId(paymentIntentId) {
    return orders.find(o => o.paymentIntentId === paymentIntentId);
  }

  static findById(orderId) {
    return orders.find(o => o.id === orderId);
  }

  static updateOrderStatus(paymentIntentId, status) {
    const order = this.findByPaymentIntentId(paymentIntentId);
    if (order) {
      if (status === 'paid') {
        order.markAsPaid();
      } else if (status === 'failed') {
        order.markAsFailed();
      }
      console.log(`✅ ORDER UPDATED: Order ${order.id} is now ${status.toUpperCase()}`);
      return order;
    }
    return null;
  }
}

module.exports = OrderService;