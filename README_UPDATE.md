# Matcha Website Requirements Update

This update keeps the original visual colour palette while adding the required e-commerce features:

- Registration and login with bcrypt password hashing and JWT authentication.
- Live product search.
- User profile page with saved cart summary.
- Admin shopping-cart view for all users.
- Product CRUD for admin users.
- Admin product image upload using a local image file instead of an image URL.
- MongoDB-backed shopping cart collection.

## Admin image upload

The admin product form now uses:

```jsx
<input type="file" accept="image/*" />
```

The backend receives the upload through `multer`, stores the file in:

```text
backend/uploads/
```

and saves the product image path in MongoDB, for example:

```text
/uploads/1716000000000-matcha-powder.png
```

The backend serves uploaded files from:

```text
http://localhost:5500/uploads/<filename>
```

## Local setup

### Backend

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env`:

```env
PORT=5500
MONGO_URI=mongodb://localhost:27017/luxury_shopping
JWT_SECRET=replace-this-with-a-long-random-secret
ADMIN_EMAIL=admin@matcha.test
ADMIN_PASSWORD=Admin123!
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5500
```

## Default admin account

```text
Email: admin@matcha.test
Password: Admin123!
```
