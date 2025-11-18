import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export default function RestaurantModal({ open, onClose, restaurant, onAdd }) {
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(false)
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    if (open && restaurant) {
      setLoading(true)
      fetch(`${baseUrl}/restaurants/${restaurant.id}/dishes`)
        .then(r => r.json())
        .then(data => setDishes(data))
        .finally(() => setLoading(false))
    }
  }, [open, restaurant])

  if (!open || !restaurant) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-xl font-semibold">{restaurant.name}</h3>
            <p className="text-sm text-gray-500">{restaurant.cuisine} • {restaurant.description}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4 grid grid-cols-1 gap-4">
          {loading && <p>Loading menu…</p>}
          {!loading && dishes.map(d => (
            <div key={d.id} className="flex gap-4 p-3 rounded-2xl border bg-white/60">
              <img src={d.image_url} alt={d.name} className="h-24 w-24 rounded-xl object-cover" />
              <div className="flex-1">
                <h4 className="font-semibold">{d.name}</h4>
                <p className="text-sm text-gray-600">{d.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold">${d.price.toFixed(2)}</span>
                  <button
                    onClick={() => onAdd({ dish_id: d.id, name: d.name, price: d.price, quantity: 1, restaurant_id: restaurant.id })}
                    className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
