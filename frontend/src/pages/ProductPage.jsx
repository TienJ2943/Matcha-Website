import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch, resolveAssetUrl } from '../api';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [commentForm, setCommentForm] = useState({ postedBy: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  async function loadProduct() {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch(`/api/products/${id}`);
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProduct();
  }, [id]);

  async function handleAddToCart() {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await addToCart(product);
      setNotice(`${product.name} added to cart.`);
      setTimeout(() => setNotice(''), 1800);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await apiFetch(`/api/products/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify(commentForm),
      });
      setCommentForm({ postedBy: '', text: '' });
      await loadProduct();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading product...</p>;
  if (error && !product) return <p className="error-message">Error: {error}</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <section className="detail-layout">
      <div className="detail-card">
        {product.imageUrl && <img src={resolveAssetUrl(product.imageUrl)} alt={product.name} />}
        <div>
          <h1>{product.name}</h1>
          <p className="price">{product.price}</p>
          <p>{product.content}</p>
          <button className="button" onClick={handleAddToCart}>Add to Cart</button>
          {notice && <p className="success-message">{notice}</p>}
          {error && <p className="error-message">Error: {error}</p>}
        </div>
      </div>

      <div className="panel">
        <h2>Comments</h2>
        {product.comments?.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          <ul className="comment-list">
            {product.comments.map((comment, index) => (
              <li key={comment._id || index}>
                <strong>{comment.postedBy}:</strong> {comment.text}
              </li>
            ))}
          </ul>
        )}

        <form className="form" onSubmit={handleCommentSubmit}>
          <h3>Add a Comment</h3>
          <input
            value={commentForm.postedBy}
            onChange={(event) => setCommentForm({ ...commentForm, postedBy: event.target.value })}
            placeholder="Your name"
            required
          />
          <textarea
            value={commentForm.text}
            onChange={(event) => setCommentForm({ ...commentForm, text: event.target.value })}
            placeholder="Your comment"
            required
          />
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Comment'}
          </button>
        </form>
      </div>
    </section>
  );
}
