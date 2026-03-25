/**
 * RestaurantMap — shows a pin on an OpenStreetMap tile using react-leaflet.
 * Geocoding done via Nominatim (free, no API key needed).
 * Falls back to a city-level view if exact address geocoding fails.
 */
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix default marker icon broken by Webpack/Vite bundling
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  const data = await res.json()
  if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  return null
}

export default function RestaurantMap({ restaurant }) {
  const [position, setPosition] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurant) return

    // Use stored coords if available
    if (restaurant.latitude && restaurant.longitude) {
      setPosition({ lat: restaurant.latitude, lng: restaurant.longitude })
      setLoading(false)
      return
    }

    // Try full address first, fall back to city
    const fullAddress = [restaurant.address, restaurant.city, 'USA'].filter(Boolean).join(', ')
    const cityOnly = [restaurant.city, 'USA'].filter(Boolean).join(', ')

    geocode(fullAddress)
      .then((coords) => coords || geocode(cityOnly))
      .then((coords) => setPosition(coords))
      .catch(() => setPosition(null))
      .finally(() => setLoading(false))
  }, [restaurant])

  if (loading) {
    return (
      <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-sm">
        Loading map...
      </div>
    )
  }

  if (!position) {
    return (
      <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-sm">
        📍 Location unavailable
      </div>
    )
  }

  return (
    <div className="h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 z-0">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        <Marker position={[position.lat, position.lng]}>
          <Popup>{restaurant.name}<br />{restaurant.address}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
