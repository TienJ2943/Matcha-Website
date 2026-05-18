import {
  createBrowserRouter, 
  RouterProvider
} from 'react-router-dom'


import './App.css'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ProductsPage from './pages/ProductsPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import AdminPage from './pages/AdminPage'
import AuthPage from './pages/AuthPage'
import Layout from './Layout'
import NotFoundPage from './pages/NotFoundPage'
import { CartProvider } from './CartContext'
import { AuthProvider } from './AuthContext'

const routes = [{
  path: "/",
  element: <Layout />,
  errorElement: <NotFoundPage />,
  children: [
    {
      path: "/",
      element: <HomePage />
    },
    {
      path: "/about",
      element: <AboutPage />
    },
    {
      path: "/products",
      element: <ProductsPage />
    },
    {
      path: "/products/:id",
      element: <ProductPage />
    },
    {
      path: "/cart",
      element: <CartPage />
    },
    { path: "/admin", element: <AdminPage /> },
    { path: "/auth", element: <AuthPage /> }
  ]
}];



const router = createBrowserRouter(routes);

function App() {
  
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router}/>
      </CartProvider>
    </AuthProvider>
  );
}

export default App
