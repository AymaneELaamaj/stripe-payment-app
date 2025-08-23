class Order {
    
  constructor(paymentIntentId, amount) {
    this.id = 'ord_' + Date.now();
    this.paymentIntentId = paymentIntentId;
    this.amount = amount;
    this.status = 'pending';
    this.createdAt = new Date();
  }

  markAsPaid() {
    this.status = 'paid';
    this.paidAt = new Date();
  }

  markAsFailed() {
    this.status = 'failed';
    this.failedAt = new Date();
  }
}

module.exports = Order;