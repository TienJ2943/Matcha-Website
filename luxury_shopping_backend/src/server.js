import express from 'express';
import cors from 'cors';
import productInfo from './product-content.js';

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON bodies

/*app.get('/hello', function(req, res) {
  res.send('Welcome to the Luxury Shopping Backend from a GET request!');
});

app.get('/hello/:name', function(req, res) {
  res.send('Welcome ' + req.params.name + ' to the Luxury Shopping Backend from a GET request with a parameter!');
});

app.post('/hello', function(req, res) {
  res.send('Welcome ' + req.body.name + ' to the Luxury Shopping Backend from a POST request!');
});*/

app.post('/api/products/:name', function(req, res) {
  const product = productInfo.find(p => p.name.toLowerCase().includes(req.params.name.toLowerCase()));
  if (!product) {
    return res.status(404).send('Product not found');
  }
  res.send('Product: ' + product.name + ', Price: ' + product.price + ', Content: ' + product.content);
});

app.post('/api/products/:name/comments', function(req, res) {
  const name = req.params.name;
  const {postedBy, text} = req.body;
  const product = productInfo.find(p => p.name.toLowerCase().includes(name.toLowerCase()));
  if (!product) {
    return res.status(404).send('Product not found');
  }
  product.comments.push({ postedBy, text });
  res.send('Comment added successfully');
});

app.listen(8000, '0.0.0.0', function() {
    console.log('Server is running on port 8000');
});