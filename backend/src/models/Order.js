import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ productId: mongoose.Schema.Types.ObjectId, quantity: Number }],
  total: Number,
  customerName: String,
  customerEmail: String,
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
