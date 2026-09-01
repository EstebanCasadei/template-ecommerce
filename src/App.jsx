import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './features/cart/application/CartContext.jsx'
import { AuthProvider } from './features/auth/application/AuthProvider.jsx'
import NavBar from './shared/ui/NavBar.jsx'
import Loader from './shared/ui/Loader.jsx'
import { RequireAuth, RequireAdmin } from './shared/ui/RequireAuth.jsx'
import ItemListContainer from './features/catalog/ui/ItemListContainer.jsx'
import ItemDetailContainer from './features/catalog/ui/ItemDetailContainer.jsx'
import SearchResultsContainer from './features/catalog/ui/SearchResultsContainer.jsx'
import CartPage from './shared/pages/CartPage.jsx'
import CheckoutPage from './shared/pages/CheckoutPage.jsx'
import OrderConfirmationPage from './shared/pages/OrderConfirmationPage.jsx'
import LoginPage from './shared/pages/LoginPage.jsx'
import RegisterPage from './shared/pages/RegisterPage.jsx'
import MyOrdersPage from './shared/pages/MyOrdersPage.jsx'
import NotFoundPage from './shared/pages/NotFoundPage.jsx'

// Lazy-loaded so the admin dashboard never ships in the public bundle.
const AdminRoutes = lazy(() => import('./features/admin/AdminRoutes.jsx'))

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavBar />
        <main className="p-4">
          <Routes>
            <Route path="/" element={<ItemListContainer />} />
            <Route path="/category/:categoryId" element={<ItemListContainer />} />
            <Route path="/item/:itemId" element={<ItemDetailContainer />} />
            <Route path="/search" element={<SearchResultsContainer />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/my-orders"
              element={
                <RequireAuth>
                  <MyOrdersPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/*"
              element={
                <RequireAdmin>
                  <Suspense fallback={<Loader />}>
                    <AdminRoutes />
                  </Suspense>
                </RequireAdmin>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
