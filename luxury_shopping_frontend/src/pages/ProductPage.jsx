import { useParams } from "react-router-dom";
import products from "../product-content";

export default function ProductPage() {
    const { id } = useParams();

    const product = products.find(p => String(p.id) === String(id));

    if (!product) return <p>Product not found.</p>;

    return (
        <div>
            <h1>{product.name}</h1>
            <img src={product.imageUrl} alt={product.name} style={{maxWidth:300}} />
            <p>{product.price}</p>
            <p>{product.content}</p>
            <h2>Comments</h2>
            {product.comments.length === 0 ? (
                <p>No comments yet.</p>
            ) : (
                <ul>
                    {product.comments.map((comment, index) => (
                        <li key={index}>{comment}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}