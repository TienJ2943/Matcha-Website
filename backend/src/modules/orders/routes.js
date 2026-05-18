import express from 'express';
import Order from '../../models/Order.js';
import { verifyToken, requireAdmin } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(1, parseInt(req.query.limit || '10'));
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Order.find().skip(skip).limit(limit).populate('items.productId'),
      Order.countDocuments()
    ]);
    const pages = Math.max(1, Math.ceil(total / limit));
    res.json({ items, total, page, pages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, total } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart items are required' });
    }

    const order = new Order({
      userId: req.user._id,
      items,
      total,
      customerName: req.user.name || '',
      customerEmail: req.user.email || ''
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.productId');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { items, total, customerName, customerEmail } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { items, total, customerName, customerEmail }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
