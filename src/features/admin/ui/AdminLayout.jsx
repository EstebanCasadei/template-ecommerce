import { NavLink, Outlet } from 'react-router-dom'

const linkClass = ({ isActive }) =>
  `rounded px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-200'
  }`

export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-5xl py-6">
      <h1 className="mb-4 text-2xl font-bold">Admin dashboard</h1>
      <nav className="mb-6 flex gap-2 border-b pb-3">
        <NavLink to="/admin/products" className={linkClass}>
          Products
        </NavLink>
        <NavLink to="/admin/orders" className={linkClass}>
          Orders
        </NavLink>
        <NavLink to="/admin/categories" className={linkClass}>
          Categories
        </NavLink>
      </nav>
      <Outlet />
    </div>
  )
}
