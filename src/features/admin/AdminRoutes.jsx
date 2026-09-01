import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './ui/AdminLayout.jsx'
import AdminProductsPage from './ui/AdminProductsPage.jsx'
import AdminProductEditPage from './ui/AdminProductEditPage.jsx'
import AdminOrdersPage from './ui/AdminOrdersPage.jsx'
import AdminCategoriesPage from './ui/AdminCategoriesPage.jsx'

/**
 * Admin route subtree, lazy-loaded from App so none of this code ships in
 * the public bundle. Access is gated by <RequireAdmin> at the mount point;
 * real enforcement is in firestore.rules.
 */
export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductEditPage />} />
        <Route path="products/:productId/edit" element={<AdminProductEditPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
      </Route>
    </Routes>
  )
}
