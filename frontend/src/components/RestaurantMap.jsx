import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix default marker icon broken by Vite bundling — guard against strict-mode throws
try {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
} catch (_) { /* ignore */ }

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  const data = await res.json()
  if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  return null
}

const Placeholder = ({ children }) => (
  <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm">
    {children}
  </div>
)

export default function RestaurantMap({ restaurant }) {
  const [position, setPosition] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurant) { setLoading(false); return }

    if (restaurant.latitude && restaurant.longitude) {
      setPosition({ lat: restaurant.latitude, lng: restaurant.longitude })
      setLoading(false)
      return
    }

    const fullAddress = [restaurant.address, restaurant.city, 'USA'].filter(Boolean).join(', ')
    const cityOnly   = [restaurant.city, 'USA'].filter(Boolean).join(', ')

    geocode(fullAddress)
      .then((coords) => coords || geocode(cityOnly))
      .then((coords) => setPosition(coords))
      .catch(() => setPosition(null))
      .finally(() => setLoading(false))
  }, [restaurant])

  if (loading)    return <Placeholder>Loading map...</Placeholder>
  if (!position)  return <Placeholder>📍 Location unavailable</Placeholder>

  return (
    <div className="h-48 rounded-lg overflow-hidden border border-gray-200 z-0">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[position.lat, position.lng]}>
          <Popup>{restaurant.name}{restaurant.address ? <><br />{restaurant.address}</> : null}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
