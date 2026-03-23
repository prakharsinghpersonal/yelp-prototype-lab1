import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ownerSignup } from '../services/authService'

export default function OwnerSignupPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', restaurant_name: '', restaurant_location: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await ownerSignup(formData)
      // Successful signup returns a JWT token, meaning they are logged in.
      // We could set it in localStorage here if ownerSignup returned it, 
      // but just to be safe, we will redirect them to owner login so they can log in normally.
      // Wait, ownerSignup DOES return the token in our backend! 
      // But our service func is just api.post without setting localStorage.
      // So let's redirect to login.
      navigate('/owner/login', { state: { message: 'Owner account created successfully! Please log in.' } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 border-b pb-4">
            Partner with Yelp
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create an owner account to manage your restaurant
          </p>
        </div>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-100">{error}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text" required placeholder="Full Name"
              className="input"
              value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="email" required placeholder="Business Email Address"
              className="input"
              value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="password" required placeholder="Password"
              className="input"
              value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <input
              type="tel" placeholder="Phone Number (Optional)"
              className="input"
              value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <hr />
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Restaurant Details</p>
            <input
              type="text" placeholder="Restaurant Name (Optional)"
              className="input"
              value={formData.restaurant_name} onChange={(e) => setFormData({ ...formData, restaurant_name: e.target.value })}
            />
            <input
              type="text" placeholder="Restaurant Location (Optional)"
              className="input"
              value={formData.restaurant_location} onChange={(e) => setFormData({ ...formData, restaurant_location: e.target.value })}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-lg font-bold bg-[#d62828] hover:bg-[#b02020]">
            {loading ? 'Creating account...' : 'Create Owner Account'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an owner account?{' '}
            <Link to="/owner/login" className="font-medium text-yelp-red hover:text-red-700 hover:underline">
              Log in here
            </Link>
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Looking for regular user signup? <Link to="/signup" className="underline">Click here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
