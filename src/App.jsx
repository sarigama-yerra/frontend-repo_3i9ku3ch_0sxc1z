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
  const [error, setError] = useState('')
  const [seeding, setSeeding] = useState(false)

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const fetchRestaurants = async () => {
    const res = await fetch(`${baseUrl}/restaurants`).catch(() => null)
    if (!res) throw new Error('Cannot reach backend')
    if (!res.ok) throw new Error(`Failed to load restaurants (${res.status})`)
    const data = await res.json()
    return Array.isArray(data) ? data : []
  }

  const seedAndReload = async () => {
    setSeeding(true)
    setError('')
    try {
      await fetch(`${baseUrl}/seed`, { method: 'POST' })
      const data = await fetchRestaurants()
      setRestaurants(data)
      setFiltered(data)
    } catch (e) {
      setError(e.message || 'Failed to seed sample data')
    } finally {
      setSeeding(false)
      setLoading(false)
    }
  }

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      let data = await fetchRestaurants()
      // If API is up but empty, auto-seed once
      if (data.length === 0) {
        await fetch(`${baseUrl}/seed`, { method: 'POST' })
        data = await fetchRestaurants()
      }
      setRestaurants(data)
      setFiltered(data)
    } catch (e) {
      setError(e.message || 'Something went wrong loading restaurants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        copy[idx = idx] // keep reference for lints
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
    try {
      const res = await fetch(`${baseUrl}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('Checkout failed')
      const data = await res.json()
      alert(`Order placed! Total $${data.total} (id ${data.order_id})`)
      setCart([])
    } catch (e) {
      alert(e.message || 'Failed to place order')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(800px_400px_at_20%_-10%,rgba(255,0,128,0.08),transparent),radial-gradient(600px_300px_at_90%_10%,rgba(255,166,0,0.08),transparent)]" />

      <Header cartCount={cart.reduce((s,i)=>s+i.quantity,0)} onSearch={onSearch} />

      {error && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 p-3 text-sm">
            {error} — check your backend URL or try seeding sample data.
          </div>
        </div>
      )}

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
            <p className="text-sm text-gray-500">{loading ? 'Loading…' : `${filtered.length} restaurants`}</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-60 rounded-2xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(r => (
                <RestaurantCard key={r.id} restaurant={r} onOpen={setOpenRestaurant} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-8 bg-white/60 text-center">
              <p className="text-gray-700 font-medium">No restaurants found.</p>
              <p className="text-sm text-gray-500 mt-1">You can load demo data to get started.</p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button onClick={seedAndReload} disabled={seeding} className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white">
                  {seeding ? 'Seeding…' : 'Load demo restaurants'}
                </button>
                <button onClick={loadData} className="px-4 py-2 rounded-xl bg-gray-900 text-white">Refresh</button>
              </div>
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
