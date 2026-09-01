import Item from './Item.jsx'

export default function ItemList({ products }) {
  if (products.length === 0) {
    return <p className="py-8 text-center text-gray-600">No products found.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <Item key={product.id} product={product} />
      ))}
    </div>
  )
}
