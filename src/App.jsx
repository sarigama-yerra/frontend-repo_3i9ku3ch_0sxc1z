import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import RestaurantCard from './components/RestaurantCard'
import RestaurantModal from './components/RestaurantModal'

function App() {
  const [restaurants, setRestaurants] = useState([])
  const [filtered, setFiltered] = useState([])
  const [openRestaurant, setOpenRestaurant] = useState(null)
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const loadData = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${baseUrl}/restaurants`)
      if (r.status === 404) {
        // Try to seed and then refetch
        await fetch(`${baseUrl}/seed`, { method: 'POST' })
      }
    } catch {}

    const res = await fetch(`${baseUrl}/restaurants`)
    if (res.ok) {
      const data = await res.json()
      setRestaurants(data)
      setFiltered(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const onSearch = (q) => {
    const query = q.toLowerCase().trim()
    if (!query) { setFiltered(restaurants); return }
    setFiltered(restaurants.filter(r =>
      r.name.toLowerCase().includes(query) ||
      (r.cuisine || '').toLowerCase().includes(query) ||
      (r.description || '').toLowerCase().includes(query)
    ))
  }

  const addToCart = (item) => {
    setCart(prev => {
      const idx = prev.findIndex(p => p.dish_id === item.dish_id)
      if (idx > -1) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 }
        return copy
      }
      return [...prev, item]
    })
  }

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const delivery_fee = subtotal < 35 && subtotal > 0 ? 3.99 : 0
    const total = subtotal + delivery_fee
    return { subtotal, delivery_fee, total }
  }, [cart])

  const checkout = async () => {
    if (cart.length === 0 || !openRestaurant) return
    const body = {
      restaurant_id: openRestaurant.id,
      items: cart,
      customer_name: 'Guest',
      customer_email: 'guest@example.com',
      customer_address: '123 Anywhere St',
    }
    const res = await fetch(`${baseUrl}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    alert(`Order placed! Total $${data.total} (id ${data.order_id})`)
    setCart([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(800px_400px_at_20%_-10%,rgba(255,0,128,0.08),transparent),radial-gradient(600px_300px_at_90%_10%,rgba(255,166,0,0.08),transparent)]" />

      <Header cartCount={cart.reduce((s,i)=>s+i.quantity,0)} onSearch={onSearch} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="mb-8">
          <div className="rounded-3xl bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400 text-white p-8 overflow-hidden relative">
            <div className="absolute -right-10 -top-10 h-40 w-40 bg-white/10 rounded-full blur-xl" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Crave it. Tap it. Enjoy it.</h1>
            <p className="mt-2 text-white/90 max-w-xl">Discover local gems and cult favorites. Fresh meals racing to your door in minutes.</p>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Popular near you</h2>
            <p className="text-sm text-gray-500">{filtered.length} restaurants</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-60 rounded-2xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(r => (
                <RestaurantCard key={r.id} restaurant={r} onOpen={setOpenRestaurant} />
              ))}
            </div>
          )}
        </section>

        {cart.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-xl">
            <div className="rounded-2xl bg-gray-900 text-white p-4 shadow-2xl flex items-center justify-between">
              <div>
                <div className="text-sm text-white/70">{cart.reduce((s,i)=>s+i.quantity,0)} items</div>
                <div className="font-semibold">Subtotal ${totals.subtotal.toFixed(2)} {totals.delivery_fee>0 && <span className="text-white/60">+ $3.99 delivery</span>}</div>
              </div>
              <button onClick={checkout} className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 transition">Checkout ${totals.total.toFixed(2)}</button>
            </div>
          </div>
        )}
      </main>

      <RestaurantModal
        open={!!openRestaurant}
        onClose={() => setOpenRestaurant(null)}
        restaurant={openRestaurant}
        onAdd={addToCart}
      />
    </div>
  )
}

export default App
