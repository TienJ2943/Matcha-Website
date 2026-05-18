import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/luxury_shopping';
const dataRoot = path.resolve(process.cwd(), '..');

function normalizeJsonValue(value) {
  if (Array.isArray(value)) return value.map(normalizeJsonValue);
  if (value && typeof value === 'object') {
    if ('$oid' in value && Object.keys(value).length === 1) {
      return mongoose.Types.ObjectId(value.$oid);
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
  const content = fs.readFileSync(filePath, 'utf-8');
  return content
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => normalizeJsonValue(JSON.parse(line)));
}

function parsePriceString(value) {
  if (value == null) return null;
  if (typeof value === 'number') return value;
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  return cleaned ? parseFloat(cleaned) : null;
}

async function seedProducts() {
  const filePath = path.join(dataRoot, 'products.json');
  if (!fs.existsSync(filePath)) {
    console.log('No products.json file found at', filePath);
    return;
  }

  const products = loadLineDelimitedJson(filePath).map((product) => ({
    ...product,
    priceNumber: parsePriceString(product.price),
  }));

  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products from products.json`);
}

async function seedOrders() {
  const filePath = path.join(dataRoot, 'orders.json');
  if (!fs.existsSync(filePath)) {
    console.log('No orders.json file found at', filePath);
    return;
  }

  const orders = loadLineDelimitedJson(filePath);
  await Order.deleteMany({});
  await Order.insertMany(orders);
  console.log(`Seeded ${orders.length} orders from orders.json`);
}

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log('Connected to MongoDB');
  await seedProducts();
  await seedOrders();
  console.log('JSON migration complete.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Failed to migrate JSON data:', err);
  process.exit(1);
});
