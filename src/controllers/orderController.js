const OrderService = require('../services/orderService');

class OrderController {
  static getOrder(req, res) {
    const order = OrderService.findById(req.params.orderId);
    
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  }
}

module.exports = OrderController;