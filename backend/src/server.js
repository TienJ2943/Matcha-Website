import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productInfo from './product-content.js';
import { fileURLToPath } from 'url';

import Product from './models/Product.js';
import Order from './models/Order.js';
import User from './models/User.js';

import userModule from './modules/users/index.js';
import productModule from './modules/products/index.js';
import orderModule from './modules/orders/index.js';
import { verifyToken, requireAdmin } from './middleware/auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON bodies

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/luxury_shopping';

// Connect to MongoDB
mongoose.connect(MONGO_URL).then(async () => {
  console.log('Connected to MongoDB');
  await seedProducts();
  await seedOrders();
  await seedAdminUser();
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

function normalizeJsonValue(value) {
  if (Array.isArray(value)) return value.map(normalizeJsonValue);
  if (value && typeof value === 'object') {
    if ('$oid' in value && Object.keys(value).length === 1) {
      return new mongoose.Types.ObjectId(value.$oid);
    }
    if ('$date' in value && Object.keys(value).length === 1) {
      return new Date(value.$date);
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, normalizeJsonValue(child)])
    );
  }
  return value;
}

function loadLineDelimitedJson(filePath) {
  const contents = fs.readFileSync(filePath, 'utf-8');
  return contents
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => normalizeJsonValue(JSON.parse(line)));
}

function parsePrice(s) {
  if (s == null) return null;
  if (typeof s === 'number') return s;
  const cleaned = String(s).replace(/[^0-9.]/g, '');
  return cleaned ? parseFloat(cleaned) : null;
}

// Seed products from the source file and replace any old product data
async function seedProducts() {
  try {
    const dataPath = path.resolve(process.cwd(), '..', 'products.json');
    const sourceProducts = fs.existsSync(dataPath) ? loadLineDelimitedJson(dataPath) : productInfo;
    if (!sourceProducts || sourceProducts.length === 0) {
      console.log('No products to seed');
      return;
    }

    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log('Products already exist, skipping product seeding');
      return;
    }

    const mapped = sourceProducts.map(p => ({ ...p, priceNumber: parsePrice(p.price) }));
    await Product.insertMany(mapped);
    console.log(`Seeded ${mapped.length} products`);
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

async function seedOrders() {
  try {
    const dataPath = path.resolve(process.cwd(), '..', 'orders.json');
    if (!fs.existsSync(dataPath)) {
      console.log('No orders.json found, skipping order seeding');
      return;
    }

    const existingCount = await Order.countDocuments();
    if (existingCount > 0) {
      console.log('Orders already exist, skipping order seeding');
      return;
    }

    const orders = loadLineDelimitedJson(dataPath);
    if (!orders || orders.length === 0) {
      console.log('No orders to seed');
      return;
    }

    await Order.insertMany(orders);
    console.log(`Seeded ${orders.length} orders`);
  } catch (err) {
    console.error('Order seeding error:', err);
  }
}

// Seed a default admin user if not present
async function seedAdminUser() {
  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminpass';
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      admin = new User({ name: 'Admin', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
      await admin.save();
      console.log('Seeded admin user:', ADMIN_EMAIL);
    }
  } catch (err) {
    console.error('Admin seeding error:', err);
  }
}

/*app.get('/hello', function(req, res) {
  res.send('Welcome to the Luxury Shopping Backend from a GET request!');
});

app.get('/hello/:name', function(req, res) {
  res.send('Welcome ' + req.params.name + ' to the Luxury Shopping Backend from a GET request with a parameter!');
});

app.post('/hello', function(req, res) {
  res.send('Welcome ' + req.body.name + ' to the Luxury Shopping Backend from a POST request!');
});*/

// Routes for products
// Mount product routes
app.use('/api/products', productModule.productRoutes);
app.use('/api/admin/products', productModule.adminRoutes);

// Auth routes
app.use('/api/auth', userModule.authRoutes);

// Admin routes
app.use('/api/admin', userModule.adminRoutes);

// Orders routes
app.use('/api/orders', orderModule.orderRoutes);

// Serve frontend production build (SPA) when available
const frontendDist = path.join(process.cwd(), '..', 'frontend', 'dist');
console.log('frontendDist path ->', frontendDist, 'exists?', fs.existsSync(frontendDist));
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // SPA fallback: serve index.html for non-API GET routes without a file extension
  app.use((req, res, next) => {
    console.log('SPA fallback middleware check for', req.method, req.path);
    const hasExt = !!path.extname(req.path);
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads') && !hasExt) {
      console.log('Serving index.html for', req.path);
      return res.sendFile(path.join(frontendDist, 'index.html'));
    }
    next();
  });
  // Debug: list registered routes/middleware
  console.log('Registered middleware/routes:');
  app._router && app._router.stack && app._router.stack.forEach((layer, i) => {
    if (layer.route && layer.route.path) {
      console.log(i, 'route', Object.keys(layer.route.methods).join(','), layer.route.path);
    } else if (layer.name) {
      console.log(i, 'layer', layer.name, layer.regexp && layer.regexp.source);
    }
  });
}

const PORT = process.env.PORT || 5500;
app.listen(PORT, '0.0.0.0', function() {
  console.log(`Server is running on port ${PORT}`);
});