import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./App.css";
import TaglineSection from "./TaglineSection";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
});

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    id: "", name: "", description: "", price: "", quantity: "",
  });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [activeNav, setActiveNav] = useState("dashboard");

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/");
      setProducts(res.data);
      setError("");
    } catch {
      setError("Failed to fetch products");
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;
    const q = filter.trim().toLowerCase();
    if (q) {
      filtered = products.filter((p) =>
        String(p.id).includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    return [...filtered].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (["id", "price", "quantity"].includes(sortField)) {
        aVal = Number(aVal); bVal = Number(bVal);
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [products, filter, sortField, sortDirection]);

  const totalValue = useMemo(
    () => products.reduce((sum, p) => sum + Number(p.price || 0) * Number(p.quantity || 0), 0),
    [products]
  );
  const totalQty = useMemo(
    () => products.reduce((sum, p) => sum + Number(p.quantity || 0), 0),
    [products]
  );

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ id: "", name: "", description: "", price: "", quantity: "" });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(""); setError("");
    try {
      const payload = {
        ...form,
        id: Number(form.id),
        price: Number(form.price),
        quantity: Number(form.quantity),
      };
      if (editId) {
        await api.put(`/products/${editId}`, payload);
        setMessage("Product updated successfully");
      } else {
        await api.post("/products/", payload);
        setMessage("Product created successfully");
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.detail || "Operation failed");
    }
    setLoading(false);
  };

  const handleEdit = (product) => {
    setForm({
      id: product.id, name: product.name, description: product.description,
      price: product.price, quantity: product.quantity,
    });
    setEditId(product.id); setMessage(""); setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setLoading(true); setMessage(""); setError("");
    try {
      await api.delete(`/products/${id}`);
      setMessage("Product deleted successfully");
      fetchProducts();
    } catch { setError("Delete failed"); }
    setLoading(false);
  };

  const currency = (n) =>
    typeof n === "number" ? n.toFixed(2) : Number(n || 0).toFixed(2);

  return (
    <div className="app-bg">
      {/* ============ SIDEBAR ============ */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-badge">📦</div>
          <div>
            <h1>Smart Stock</h1>
            <div className="brand-sub">Manager</div>
          </div>
        </div>

        <nav className="nav">
          <button
            className={`nav-item ${activeNav === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveNav("dashboard")}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-item ${activeNav === "products" ? "active" : ""}`}
            onClick={() => setActiveNav("products")}
          >
            📦 Products
          </button>
          <button
            className={`nav-item ${activeNav === "add" ? "active" : ""}`}
            onClick={() => setActiveNav("add")}
          >
            ➕ Add Product
          </button>
        </nav>

        <div className="sidebar-footer">
          Powered by
          <strong>Vinay</strong>
        </div>
      </aside>

      {/* ============ MAIN ============ */}
      <main className="main">
        <div className="topbar fade-in">
          <div>
            <h2 className="page-title">Dashboard</h2>
            <p className="page-subtitle">Track your inventory at a glance</p>
          </div>
          <div className="top-actions">
            <div className="search">
              <input
                type="text"
                placeholder="🔍 Search products..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <button className="btn btn-light" onClick={fetchProducts} disabled={loading}>
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid fade-in">
          <div className="stat">
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{products.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Total Quantity</div>
            <div className="stat-value accent">{totalQty}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Inventory Value</div>
            <div className="stat-value success">${currency(totalValue)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Showing</div>
            <div className="stat-value">{filteredProducts.length}</div>
          </div>
        </div>

        <div className="content-grid fade-in">
          {/* Form + Tagline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="card">
              <h2>{editId ? "✏️ Edit Product" : "➕ Add Product"}</h2>
              <form onSubmit={handleSubmit} className="product-form">
                <input
                  type="number" name="id" placeholder="Product ID"
                  value={form.id} onChange={handleChange}
                  required disabled={!!editId}
                />
                <input
                  type="text" name="name" placeholder="Product name"
                  value={form.name} onChange={handleChange} required
                />
                <input
                  type="text" name="description" placeholder="Description"
                  value={form.description} onChange={handleChange} required
                />
                <input
                  type="number" name="price" placeholder="Price ($)"
                  value={form.price} onChange={handleChange}
                  required step="0.01"
                />
                <input
                  type="number" name="quantity" placeholder="Quantity"
                  value={form.quantity} onChange={handleChange} required
                />
                <div className="form-actions">
                  <button className="btn" type="submit" disabled={loading}>
                    {editId ? "Update Product" : "Add Product"}
                  </button>
                  {editId && (
                    <button
                      className="btn btn-secondary" type="button"
                      onClick={() => { resetForm(); setMessage(""); setError(""); }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              {message && <div className="success-msg">✓ {message}</div>}
              {error && <div className="error-msg">✕ {error}</div>}
            </div>

            <TaglineSection />
          </div>

          {/* Table */}
          <div className="card">
            <h2>📦 All Products</h2>
            {loading ? (
              <div className="loader">
                <div className="spinner" />
                <span>Loading products...</span>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th className={`sortable ${sortField === "id" ? `sort-${sortDirection}` : ""}`} onClick={() => handleSort("id")}>ID</th>
                      <th className={`sortable ${sortField === "name" ? `sort-${sortDirection}` : ""}`} onClick={() => handleSort("name")}>Name</th>
                      <th>Description</th>
                      <th className={`sortable ${sortField === "price" ? `sort-${sortDirection}` : ""}`} onClick={() => handleSort("price")}>Price</th>
                      <th className={`sortable ${sortField === "quantity" ? `sort-${sortDirection}` : ""}`} onClick={() => handleSort("quantity")}>Qty</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td className="name-cell">{p.name}</td>
                        <td className="desc-cell" title={p.description}>{p.description}</td>
                        <td className="price-cell">${currency(p.price)}</td>
                        <td><span className="qty-badge">{p.quantity}</span></td>
                        <td>
                          <div className="row-actions">
                            <button className="btn btn-edit" onClick={() => handleEdit(p)}>Edit</button>
                            <button className="btn btn-delete" onClick={() => handleDelete(p.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="empty">
                          <div className="empty-icon">📭</div>
                          <div className="empty-title">No products found</div>
                          <div className="empty-hint">Try a different search or add a new product</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;