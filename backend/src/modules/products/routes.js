import express from 'express';
import multer from 'multer';
import path from 'path';
import Product from '../../models/Product.js';
import { verifyToken, requireAdmin } from '../../middleware/auth.js';

const router = express.Router();
const upload = multer({ dest: path.join(process.cwd(), 'uploads') });

function parsePriceString(s) {
  if (s == null) return null;
  if (typeof s === 'number') return s;
  const cleaned = String(s).replace(/[^0-9.]/g, '');
  return cleaned ? parseFloat(cleaned) : null;
}

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(1, parseInt(req.query.limit || '10'));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.q) {
      filter.name = { $regex: req.query.q, $options: 'i' };
    }
    const minP = req.query.minPrice != null ? parseFloat(req.query.minPrice) : null;
    const maxP = req.query.maxPrice != null ? parseFloat(req.query.maxPrice) : null;
    if (!isNaN(minP) || !isNaN(maxP)) {
      filter.priceNumber = {};
      if (!isNaN(minP)) filter.priceNumber.$gte = minP;
      if (!isNaN(maxP)) filter.priceNumber.$lte = maxP;
    }

    const sortBy = req.query.sortBy === 'price' ? 'priceNumber' : req.query.sortBy === 'name' ? 'name' : 'name';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortBy]: sortOrder };

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter)
    ]);
    const pages = Math.max(1, Math.ceil(total / limit));
    res.json({ items, total, page, pages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/id/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:name/comments', async (req, res) => {
  try {
    const { postedBy, text } = req.body;
    const product = await Product.findOne({ name: new RegExp(req.params.name, 'i') });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    product.comments.push({ postedBy, text });
    await product.save();
    res.json({ message: 'Comment added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const adminRouter = express.Router();

adminRouter.post('/', verifyToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.body.name || !req.body.price || !req.file) {
      return res.status(400).json({ error: 'Name, price, and image are required' });
    }
    const payload = {
      name: req.body.name,
      price: req.body.price,
      priceNumber: parsePriceString(req.body.price),
      imageUrl: `/uploads/${req.file.filename}`,
      content: req.body.content || ''
    };
    const p = new Product(payload);
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/:id', verifyToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.price) updateData.priceNumber = parsePriceString(req.body.price);
    if (req.file) updateData.imageUrl = `/uploads/${req.file.filename}`;
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { router as productRoutes, adminRouter as adminRoutes };
