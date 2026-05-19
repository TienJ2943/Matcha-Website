import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="panel narrow">
      <h1>Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link className="button" to="/">Back Home</Link>
    </section>
  );
}
