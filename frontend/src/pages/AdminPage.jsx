import { useState, useEffect } from 'react';
import './Admin.css';

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('adminpass');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedUserOrders, setSelectedUserOrders] = useState([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', content: '' });
  const [newProductImage, setNewProductImage] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [sortBy, setSortBy] = useState(localStorage.getItem('admin_sortBy') || 'name');
  const [sortOrder, setSortOrder] = useState(localStorage.getItem('admin_sortOrder') || 'asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchOrders();
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, pageSize, sortBy, sortOrder]);

  useEffect(() => {
    localStorage.setItem('admin_sortBy', sortBy);
    localStorage.setItem('admin_sortOrder', sortOrder);
  }, [sortBy, sortOrder]);

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortOrder((currentOrder) => (currentOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const login = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      localStorage.setItem('admin_token', data.token);
    } else {
      alert(data.error || 'Login failed');
    }
  };

  async function fetchUsers() {
    const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setUsers(data || []);
  }

  async function fetchOrders() {
    const res = await fetch(`/api/orders?page=1&limit=10`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setOrders(data.items || []);
  };

  async function fetchUserOrders(userId, email) {
    const res = await fetch(`/api/admin/users/${userId}/orders`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) {
      setSelectedUserOrders(data || []);
      setSelectedUserEmail(email || '');
    } else {
      alert(data.error || 'Could not load orders');
    }
  };

  const clearSelectedUserOrders = () => {
    setSelectedUserOrders([]);
    setSelectedUserEmail('');
  };

  async function fetchProducts(pageOverride) {
    const currentPage = pageOverride || page;
    const params = new URLSearchParams({
      page: currentPage,
      limit: pageSize,
      sortBy,
      sortOrder
    });
    if (searchQuery) params.set('q', searchQuery);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    if (res.ok) {
      setProducts(data.items || []);
      setTotalPages(data.pages || 1);
      setTotalProducts(data.total || 0);
    } else {
      setProducts([]);
      setTotalPages(1);
      setTotalProducts(0);
    }
  };

  const createProduct = async (e) => {
    e.preventDefault();
    if (!newProductImage) {
      alert('Please choose a product image');
      return;
    }
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('price', newProduct.price);
    formData.append('content', newProduct.content);
    formData.append('image', newProductImage);

    const res = await fetch('/api/admin/products', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
    const data = await res.json();
    if (res.ok) {
      setNewProduct({ name: '', price: '', content: '' });
      setNewProductImage(null);
      fetchProducts();
    } else {
      alert(data.error || 'Create failed');
    }
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setEditValues({ name: p.name || '', price: p.price || '', content: p.content || '' });
    setEditImageFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = async (id) => {
    if (!confirm('Save changes to this product?')) return;
    const formData = new FormData();
    formData.append('name', editValues.name);
    formData.append('price', editValues.price);
    formData.append('content', editValues.content);
    if (editImageFile) formData.append('image', editImageFile);

    const res = await fetch(`/api/admin/products/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: formData });
    const data = await res.json();
    if (res.ok) {
      cancelEdit();
      fetchProducts();
    } else {
      alert(data.error || 'Update failed');
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete product?')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) fetchProducts(); else alert(data.error || 'Delete failed');
  };

  return (
    <div className="admin-page">
      <h2>Admin Panel</h2>
      {!token ? (
        <form onSubmit={login} className="admin-login">
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button>Login</button>
        </form>
      ) : (
        <div>
          <button onClick={() => { setToken(''); localStorage.removeItem('admin_token'); }}>Logout</button>

          <section>
            <h3>Users</h3>
            <button onClick={fetchUsers}>Refresh Users</button>
            <button onClick={clearSelectedUserOrders} style={{ marginLeft: 8 }}>Clear selected orders</button>
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Orders</th></tr></thead>
              <tbody>{users.map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td><button onClick={() => fetchUserOrders(u._id, u.email)}>View orders</button></td>
                </tr>
              ))}</tbody>
            </table>
            {selectedUserEmail && (
              <div style={{ marginTop: 16 }}>
                <h4>Orders for {selectedUserEmail}</h4>
                {selectedUserOrders.length > 0 ? (
                  <table>
                    <thead><tr><th>ID</th><th>Customer</th><th>Email</th><th>Total</th></tr></thead>
                    <tbody>{selectedUserOrders.map(o => (
                      <tr key={o._id}>
                        <td>{o._id}</td>
                        <td>{o.customerName}</td>
                        <td>{o.customerEmail}</td>
                        <td>{o.total}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                ) : (
                  <p>No orders found for this user.</p>
                )}
              </div>
            )}
          </section>

          <section>
            <h3>Orders</h3>
            <button onClick={fetchOrders}>Refresh Orders</button>
            <table>
              <thead><tr><th>ID</th><th>Customer</th><th>Email</th><th>Total</th></tr></thead>
              <tbody>{orders.map(o => <tr key={o._id}><td>{o._id}</td><td>{o.customerName}</td><td>{o.customerEmail}</td><td>{o.total}</td></tr>)}</tbody>
            </table>
          </section>

          <section>
            <h3>Products</h3>
            <button onClick={fetchProducts}>Refresh Products</button>
            <form onSubmit={createProduct} className="create-product">
              <input placeholder="Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              <input placeholder="Price" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
              <label className="file-input-label">
                Image
                <input type="file" accept="image/*" onChange={e => setNewProductImage(e.target.files?.[0] || null)} />
              </label>
              <input placeholder="Content" value={newProduct.content} onChange={e => setNewProduct({...newProduct, content: e.target.value})} />
              <button>Create</button>
            </form>

            <div className="products-controls">
              <label>Search: <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Name contains..." /></label>
              <label>Min price: <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" /></label>
              <label>Max price: <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="100" /></label>
              <button type="button" onClick={() => { setPage(1); fetchProducts(1); }}>Apply filters</button>
              <label>Page size: <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={10}>10</option>
              </select></label>
              <label>Sort by: <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select></label>
              <label>Order: <select value={sortOrder} onChange={e => { setSortOrder(e.target.value); setPage(1); }}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select></label>
            </div>
            <table>
              <thead>
                <tr>
                  <th className={`sortable ${sortBy === 'name' ? 'active-sort' : ''}`} onClick={() => toggleSort('name')}>
                    Name {sortBy === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className={`sortable ${sortBy === 'price' ? 'active-sort' : ''}`} onClick={() => toggleSort('price')}>
                    Price {sortBy === 'price' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{
                (() => {
                  return products.map(p => (
                    <tr key={p._id}>
                      <td>
                        {editingId === p._id ? (
                          <input value={editValues.name} onChange={e => setEditValues({...editValues, name: e.target.value})} />
                        ) : p.name}
                      </td>
                      <td>
                        {editingId === p._id ? (
                          <input value={editValues.price} onChange={e => setEditValues({...editValues, price: e.target.value})} />
                        ) : p.price}
                      </td>
                      <td>
                        {editingId === p._id ? (
                          <label className="file-input-label">
                            Change image
                            <input type="file" accept="image/*" onChange={e => setEditImageFile(e.target.files?.[0] || null)} />
                          </label>
                        ) : (
                          <img src={p.imageUrl} alt={p.name} style={{ maxWidth: 100, maxHeight: 80 }} />
                        )}
                      </td>
                      <td>
                        {editingId === p._id ? (
                          <>
                            <button onClick={() => saveEdit(p._id)}>Save</button>
                            <button onClick={cancelEdit}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(p)}>Edit</button>
                            <button onClick={() => deleteProduct(p._id)}>Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ));
                })()
              }</tbody>
            </table>
            <p className="product-count">Total products: {totalProducts}</p>
            <div className="pagination">
              <button disabled={page<=1} onClick={() => { setPage(p => Math.max(1, p-1)); }}>&lt; Prev</button>
              <span> Page {page} of {totalPages} </span>
              <button disabled={page>=totalPages} onClick={() => { setPage(p => Math.min(totalPages, p+1)); }}>Next &gt;</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
