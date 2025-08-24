import OrderService from '../services/orderService.js';

class OrderController {
  static async getOrder(req, res) {
    const order = await OrderService.findById(req.params.orderId);
    
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  }
}

export default OrderController;