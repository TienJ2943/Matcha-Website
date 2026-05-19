import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, resolveAssetUrl } from '../api';
import { useAuth } from '../AuthContext';

const emptyForm = { name: '', price: '', content: '', image: null };

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadProducts() {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/products');
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') loadProducts();
    else setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!form.image) return;
    const objectUrl = URL.createObjectURL(form.image);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.image]);

  function startEdit(product) {
    setEditingId(product._id);
    setForm({
      name: product.name || '',
      price: product.price || '',
      content: product.content || '',
      image: null,
    });
    setPreview(product.imageUrl ? resolveAssetUrl(product.imageUrl) : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setPreview('');
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null;
    setForm({ ...form, image: file });
  }

  function buildProductFormData() {
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', form.price);
    formData.append('content', form.content);
    if (form.image) formData.append('image', form.image);
    return formData;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    try {
      const body = buildProductFormData();
      if (editingId) {
        await apiFetch(`/api/products/${editingId}`, {
          method: 'PUT',
          body,
        });
        setNotice('Product updated successfully.');
      } else {
        await apiFetch('/api/products', {
          method: 'POST',
          body,
        });
        setNotice('Product created successfully.');
      }
      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(productId) {
    const ok = confirm('Delete this product? It will also be removed from all carts.');
    if (!ok) return;

    try {
      await apiFetch(`/api/products/${productId}`, { method: 'DELETE' });
      setNotice('Product deleted successfully.');
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!user) {
    return (
      <section className="panel narrow">
        <h1>Admin Products</h1>
        <p>Please login as admin to manage products.</p>
        <Link className="button" to="/login">Login</Link>
      </section>
    );
  }

  if (user.role !== 'admin') {
    return (
      <section className="panel narrow">
        <h1>Admin Products</h1>
        <p>You need an admin account to access product management.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <h1>Admin Product CRUD</h1>
          <p>Create, read, update and delete products from the database.</p>
        </div>
      </div>

      <div className="panel narrow" style={{ marginBottom: '1.5rem' }}>
        <h2>{editingId ? 'Update Product' : 'Create Product'}</h2>
        {error && <p className="error-message">Error: {error}</p>}
        {notice && <p className="success-message">{notice}</p>}
        <form className="form" onSubmit={handleSubmit} encType="multipart/form-data">
          <input
            placeholder="Product name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <input
            placeholder="Price, e.g. $24.99"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: event.target.value })}
            required
          />
          <label className="file-upload-label">
            Product picture
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required={!editingId}
            />
          </label>
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Product preview" />
            </div>
          )}
          <textarea
            placeholder="Product description"
            value={form.content}
            onChange={(event) => setForm({ ...form, content: event.target.value })}
          />
          <div className="card-actions">
            <button className="button" type="submit">{editingId ? 'Save Changes' : 'Create Product'}</button>
            {editingId && <button className="button secondary" type="button" onClick={resetForm}>Cancel Edit</button>}
          </div>
        </form>
      </div>

      {loading ? <p>Loading products...</p> : (
        <div className="admin-cart-list">
          {products.map((product) => (
            <article className="panel" key={product._id}>
              {product.imageUrl && (
                <img className="admin-product-thumb" src={resolveAssetUrl(product.imageUrl)} alt={product.name} />
              )}
              <h2>{product.name}</h2>
              <p><strong>Price:</strong> {product.price}</p>
              <p>{product.content}</p>
              <div className="card-actions">
                <button className="button secondary" onClick={() => startEdit(product)}>Edit</button>
                <button className="button" onClick={() => handleDelete(product._id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
