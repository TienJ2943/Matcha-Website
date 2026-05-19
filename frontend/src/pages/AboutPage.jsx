export default function AboutPage() {
  return (
    <section className="panel">
      <h1>About This Project</h1>
      <p>
        This website is a full-stack e-commerce shopping cart project built with React,
        Express, MongoDB and JWT authentication.
      </p>
      <p>
        It behaves like a single-page application: React Router changes the visible page
        without requesting a new HTML page from the server.
      </p>
      <p>
        The project demonstrates registration, login, password hashing, protected API routes,
        live product search, cart create/read/update/delete operations, order creation, and an
        admin view for all users' shopping carts.
      </p>
    </section>
  );
}
