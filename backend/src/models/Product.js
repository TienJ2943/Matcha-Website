import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: String,
  priceNumber: Number,
  imageUrl: String,
  content: String,
  comments: [{ postedBy: String, text: String }]
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
