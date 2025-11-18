import { Star, Bike } from 'lucide-react'

export default function RestaurantCard({ restaurant, onOpen }) {
  return (
    <button
      onClick={() => onOpen(restaurant)}
      className="group text-left bg-white/80 hover:bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm hover:shadow-md transition w-full"
    >
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={restaurant.image_url}
          alt={restaurant.name}
          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-lg">{restaurant.name}</h3>
          <div className="flex items-center gap-1 text-amber-500 text-sm">
            <Star size={16} className="fill-amber-400" />
            <span className="font-medium">{restaurant.rating?.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 line-clamp-1">{restaurant.cuisine} • {restaurant.description}</p>
        <div className="mt-3 flex items-center gap-3 text-gray-500 text-xs">
          <div className="flex items-center gap-1"><Bike size={14}/> {restaurant.delivery_time_min} min</div>
          <div className="h-1 w-1 rounded-full bg-gray-300"/>
          <div>Delivery ${restaurant.delivery_time_min < 30 ? '3.99' : '0'}</div>
        </div>
      </div>
    </button>
  )
}
