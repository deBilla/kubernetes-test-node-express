import React, { useState, useEffect, useCallback } from "react";
import { TenantSelector } from "./components/TenantSelector";
import { api } from "./services/api";
import "./App.css";

type Page = "dashboard" | "products" | "customers" | "carts" | "orders" | "reviews";

const NAV_ITEMS: { key: Page; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "grid" },
  { key: "products", label: "Products", icon: "box" },
  { key: "customers", label: "Customers", icon: "users" },
  { key: "carts", label: "Carts", icon: "cart" },
  { key: "orders", label: "Orders", icon: "clipboard" },
  { key: "reviews", label: "Reviews", icon: "star" },
];

const ICONS: Record<string, string> = {
  grid: "\u25A6", box: "\u25A3", users: "\u263B", cart: "\u26C5", clipboard: "\u2637", star: "\u2605",
};

const App: React.FC = () => {
  const [tenantId, setTenantId] = useState("loading...");
  const [page, setPage] = useState<Page>("dashboard");
  const [data, setData] = useState<Record<string, any[]>>({
    products: [], customers: [], carts: [], orders: [], reviews: [],
  });
  const [status, setStatus] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<any>(null);

  // Workflow state
  const [selProduct, setSelProduct] = useState<any>(null);
  const [selCustomer, setSelCustomer] = useState<any>(null);
  const [selCart, setSelCart] = useState<any>(null);

  const showStatus = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(""), 3000);
  };

  const refresh = useCallback(async () => {
    try {
      const [p, c, ca, o, r] = await Promise.all([
        api.get("products", "/", tenantId),
        api.get("customers", "/", tenantId),
        api.get("carts", "/", tenantId),
        api.get("orders", "/", tenantId),
        api.get("reviews", "/", tenantId),
      ]);
      setData({
        products: Array.isArray(p) ? p : [],
        customers: Array.isArray(c) ? c : [],
        carts: Array.isArray(ca) ? ca : [],
        orders: Array.isArray(o) ? o : [],
        reviews: Array.isArray(r) ? r : [],
      });
    } catch { /* ignore */ }
  }, [tenantId]);

  useEffect(() => {
    fetch("/api/tenant").then(r => r.json()).then(d => setTenantId(d.tenantId)).catch(() => setTenantId("default"));
  }, []);

  useEffect(() => {
    if (tenantId === "loading...") return;
    refresh();
    setSelProduct(null);
    setSelCustomer(null);
    setSelCart(null);
    setSelectedDetail(null);
  }, [refresh, tenantId]);

  const renderDashboard = () => (
    <div className="dashboard-page">
      <div className="stats-grid">
        {[
          { label: "Products", count: data.products.length, color: "#3b82f6", page: "products" as Page },
          { label: "Customers", count: data.customers.length, color: "#10b981", page: "customers" as Page },
          { label: "Carts", count: data.carts.length, color: "#f59e0b", page: "carts" as Page },
          { label: "Orders", count: data.orders.length, color: "#8b5cf6", page: "orders" as Page },
          { label: "Reviews", count: data.reviews.length, color: "#ef4444", page: "reviews" as Page },
        ].map(s => (
          <div key={s.label} className="stat-card" onClick={() => setPage(s.page)} style={{ borderLeftColor: s.color }}>
            <div className="stat-count">{s.count}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Quick Workflow</h2>
      <div className="workflow-context">
        <span className={selProduct ? "tag active" : "tag"}>Product: {selProduct?.name || "none"}</span>
        <span className={selCustomer ? "tag active" : "tag"}>Customer: {selCustomer?.name || "none"}</span>
        <span className={selCart ? "tag active" : "tag"}>Cart: {selCart ? `...${selCart._id.slice(-6)}` : "none"}</span>
      </div>

      <div className="workflow-grid">
        <WorkflowStep num={1} title="Create Product">
          <QuickForm fields={[
            { name: "name", placeholder: "Name" },
            { name: "price", placeholder: "Price", type: "number" },
            { name: "stock", placeholder: "Stock", type: "number" },
          ]} onSubmit={async (v) => {
            const p = await api.post("products", "/", tenantId, { name: v.name, price: Number(v.price), stock: Number(v.stock) });
            setSelProduct(p); showStatus(`Product "${p.name}" created`); refresh();
          }} />
          <MiniList items={data.products} label={(p: any) => p.name} sub={(p: any) => `$${p.price} | Stock: ${p.stock}`}
            selected={selProduct?._id} onSelect={(p: any) => setSelProduct(p)} />
        </WorkflowStep>

        <WorkflowStep num={2} title="Create Customer">
          <QuickForm fields={[{ name: "name", placeholder: "Customer Name" }]} onSubmit={async (v) => {
            const c = await api.post("customers", "/", tenantId, { name: v.name });
            setSelCustomer(c); showStatus(`Customer "${c.name}" created`); refresh();
          }} />
          <MiniList items={data.customers} label={(c: any) => c.name} sub={(c: any) => `ID: ...${c._id.slice(-6)}`}
            selected={selCustomer?._id} onSelect={(c: any) => setSelCustomer(c)} />
        </WorkflowStep>

        <WorkflowStep num={3} title="Shopping Cart">
          <div className="workflow-actions">
            <button className="btn btn-primary" onClick={async () => {
              const cart = await api.post("carts", "/", tenantId, { uuid: `cart-${Date.now()}`, items: [] });
              setSelCart(cart); showStatus("Cart created"); refresh();
            }}>New Cart</button>
            <button className="btn btn-accent" disabled={!selCart || !selProduct} onClick={async () => {
              await api.put("carts", `/addItem/${selCart._id}`, tenantId, {
                name: selProduct.name, price: selProduct.price, quantity: 1, productId: selProduct._id,
              });
              showStatus(`Added ${selProduct.name} to cart`); refresh();
            }}>Add Selected Product to Cart</button>
          </div>
          <MiniList items={data.carts} label={(c: any) => `Cart ...${c._id.slice(-6)}`}
            sub={(c: any) => `Items: ${c.items?.length || 0}`}
            selected={selCart?._id} onSelect={(c: any) => setSelCart(c)} />
        </WorkflowStep>

        <WorkflowStep num={4} title="Place Order">
          <div className="workflow-actions">
            <button className="btn btn-accent" disabled={!selCustomer || !selCart} onClick={async () => {
              // Fetch latest cart to get items
              const latestCarts = await api.get("carts", `/${selCart._id}`, tenantId);
              const cartItems = latestCarts?.items || [];
              const total = cartItems.reduce((sum: number, i: any) => sum + (i.price * (i.quantity || 1)), 0);
              await api.post("orders", "/", tenantId, {
                customerId: selCustomer._id,
                cart: cartItems,
                total,
              });
              showStatus(`Order placed: $${total.toFixed(2)}`); refresh();
            }}>Place Order from Cart</button>
            <span className="muted">
              {selCustomer?.name || "select customer"} | Cart: {selCart ? `...${selCart._id.slice(-6)}` : "select cart"}
            </span>
          </div>
          <MiniList items={data.orders} label={(o: any) => `Order ...${o._id.slice(-6)}`}
            sub={(o: any) => `Total: $${o.total} | Items: ${o.cart?.length || 0}`}
            selected={undefined} onSelect={() => {}} />
        </WorkflowStep>

        <WorkflowStep num={5} title="Leave Review">
          <QuickForm fields={[
            { name: "rating", placeholder: "Rating (1-5)", type: "number" },
            { name: "comment", placeholder: "Comment" },
          ]} btnLabel="Submit Review" disabled={!selProduct || !selCustomer} onSubmit={async (v) => {
            await api.post("reviews", "/", tenantId, {
              productId: selProduct._id, customerId: selCustomer._id,
              rating: Number(v.rating), comment: v.comment,
            });
            showStatus("Review submitted!"); refresh();
          }} />
        </WorkflowStep>
      </div>
    </div>
  );

  const renderListPage = (key: string, columns: { key: string; label: string }[], createFields: { name: string; placeholder: string; type?: string }[]) => (
    <div className="list-page">
      <div className="list-header">
        <h2>{key.charAt(0).toUpperCase() + key.slice(1)}</h2>
        <span className="record-count">{data[key]?.length || 0} records</span>
      </div>

      <div className="create-section">
        <h4>Create New</h4>
        <QuickForm fields={createFields} onSubmit={async (v) => {
          const body: any = {};
          createFields.forEach(f => {
            body[f.name] = f.type === "number" ? Number(v[f.name]) : v[f.name];
          });
          await api.post(key, "/", tenantId, body);
          showStatus(`${key.slice(0, -1)} created`); refresh();
        }} />
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              {columns.map(c => <th key={c.key}>{c.label}</th>)}
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {(data[key] || []).map((item: any, i: number) => (
              <tr key={item._id} onClick={() => setSelectedDetail(item)} className={selectedDetail?._id === item._id ? "row-selected" : ""}>
                <td className="row-num">{i + 1}</td>
                {columns.map(c => (
                  <td key={c.key}>
                    {typeof item[c.key] === "object" ? JSON.stringify(item[c.key]) : String(item[c.key] ?? "-")}
                  </td>
                ))}
                <td className="id-cell">...{item._id?.slice(-8)}</td>
              </tr>
            ))}
            {(data[key] || []).length === 0 && (
              <tr><td colSpan={columns.length + 2} className="empty-row">No records found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedDetail && (
        <div className="detail-panel">
          <div className="detail-header">
            <h4>Record Detail</h4>
            <button className="btn-close" onClick={() => setSelectedDetail(null)}>X</button>
          </div>
          <div className="detail-body">
            {Object.entries(selectedDetail).map(([k, v]) => (
              <div key={k} className="detail-row">
                <span className="detail-key">{k}</span>
                <span className="detail-value">{typeof v === "object" ? JSON.stringify(v, null, 2) : String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const pageContent = () => {
    switch (page) {
      case "dashboard": return renderDashboard();
      case "products": return renderListPage("products",
        [{ key: "name", label: "Name" }, { key: "price", label: "Price" }, { key: "stock", label: "Stock" }],
        [{ name: "name", placeholder: "Product Name" }, { name: "price", placeholder: "Price", type: "number" }, { name: "stock", placeholder: "Stock", type: "number" }]);
      case "customers": return renderListPage("customers",
        [{ key: "name", label: "Name" }],
        [{ name: "name", placeholder: "Customer Name" }]);
      case "carts": return renderListPage("carts",
        [{ key: "uuid", label: "UUID" }, { key: "items", label: "Items" }],
        [{ name: "uuid", placeholder: "Cart UUID" }]);
      case "orders": return renderListPage("orders",
        [{ key: "customerId", label: "Customer ID" }, { key: "total", label: "Total" }, { key: "items", label: "Items" }],
        [{ name: "customerId", placeholder: "Customer ID" }, { name: "total", placeholder: "Total", type: "number" }]);
      case "reviews": return renderListPage("reviews",
        [{ key: "productId", label: "Product ID" }, { key: "rating", label: "Rating" }, { key: "comment", label: "Comment" }],
        [{ name: "productId", placeholder: "Product ID" }, { name: "customerId", placeholder: "Customer ID" }, { name: "rating", placeholder: "Rating", type: "number" }, { name: "comment", placeholder: "Comment" }]);
    }
  };

  return (
    <div className="erp">
      <aside className="sidebar">
        <div className="sidebar-brand">ERP</div>
        {NAV_ITEMS.map(n => (
          <button key={n.key} className={`nav-item ${page === n.key ? "active" : ""}`} onClick={() => { setPage(n.key); setSelectedDetail(null); }}>
            <span className="nav-icon">{ICONS[n.icon]}</span>
            {n.label}
          </button>
        ))}
      </aside>
      <main className="main-content">
        <div className="top-bar">
          <div className="breadcrumb">{NAV_ITEMS.find(n => n.key === page)?.label}</div>
          <TenantSelector tenantId={tenantId} />
          {status && <div className="toast">{status}</div>}
        </div>
        <div className="page-content">
          {pageContent()}
        </div>
      </main>
    </div>
  );
};

// --- Sub-components ---

const WorkflowStep: React.FC<{ num: number; title: string; children: React.ReactNode }> = ({ num, title, children }) => (
  <div className="wf-step">
    <div className="wf-step-header"><span className="step-num">{num}</span><h4>{title}</h4></div>
    {children}
  </div>
);

const QuickForm: React.FC<{
  fields: { name: string; placeholder: string; type?: string }[];
  onSubmit: (values: Record<string, string>) => void;
  btnLabel?: string;
  disabled?: boolean;
}> = ({ fields, onSubmit, btnLabel, disabled }) => {
  const [vals, setVals] = useState<Record<string, string>>({});
  return (
    <form className="qf" onSubmit={(e) => { e.preventDefault(); onSubmit(vals); setVals({}); }}>
      {fields.map(f => (
        <input key={f.name} type={f.type || "text"} placeholder={f.placeholder}
          value={vals[f.name] || ""} onChange={e => setVals({ ...vals, [f.name]: e.target.value })} required />
      ))}
      <button type="submit" disabled={disabled}>{btnLabel || "Create"}</button>
    </form>
  );
};

const MiniList: React.FC<{
  items: any[]; label: (i: any) => string; sub: (i: any) => string;
  selected?: string; onSelect: (i: any) => void;
}> = ({ items, label, sub, selected, onSelect }) => (
  <div className="mini-list">
    {items.slice(0, 5).map((it: any) => (
      <div key={it._id} className={`ml-row ${selected === it._id ? "ml-selected" : ""}`} onClick={() => onSelect(it)}>
        <strong>{label(it)}</strong><span className="muted">{sub(it)}</span>
      </div>
    ))}
    {items.length === 0 && <p className="muted" style={{ padding: 6 }}>Empty</p>}
    {items.length > 5 && <p className="muted" style={{ padding: 6 }}>+{items.length - 5} more</p>}
  </div>
);

export default App;
