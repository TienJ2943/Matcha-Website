import products from "../product-content";
import { Link } from "react-router-dom";

export default function ProductsPage() {
    return (
        <div>
            <h1>Products</h1>
            <div className="products-grid">
                {products.map(p => (
                    <div className="product-card" key={p.id}>
                        <img src={p.imageUrl} alt={p.name} style={{maxWidth:200, margin: "auto", display: "block",}} />
                        <h3>{p.name}</h3>
                        <p>{p.price}</p>
                        <Link to={`/products/${p.id}`}>View</Link>
                    </div>
                ))}
            </div>
        </div>
    );
}