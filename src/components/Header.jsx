import { useState } from 'react'
import { Search, ShoppingBag, UtensilsCrossed } from 'lucide-react'

export default function Header({ cartCount, onSearch }) {
  const [q, setQ] = useState('')

  const submit = (e) => {
    e.preventDefault()
    onSearch(q)
  }

  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-black/5">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2 text-rose-600 font-bold text-xl">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 text-white flex items-center justify-center shadow">
            <UtensilsCrossed size={20} />
          </div>
          <span>SwiftBite</span>
        </div>

        <form onSubmit={submit} className="hidden md:flex items-center gap-2 ml-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search restaurants or dishes"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-100/80 focus:bg-white focus:ring-2 focus:ring-rose-400 outline-none transition"
            />
          </div>
          <button className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition">
            Search
          </button>
        </form>

        <div className="ml-auto md:ml-4">
          <div className="relative inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 text-white">
            <ShoppingBag size={18} />
            <span className="text-sm">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
