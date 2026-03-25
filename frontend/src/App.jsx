import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AiChatWidget from './components/AiChatWidget'
import { AuthProvider } from './contexts/AuthContext'

import ExplorePage from './pages/ExplorePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import RestaurantDetailsPage from './pages/RestaurantDetailsPage'
import ProfilePage from './pages/ProfilePage'
import AddRestaurantPage from './pages/AddRestaurantPage'
import FavoritesPage from './pages/FavoritesPage'
import HistoryPage from './pages/HistoryPage'
import ChatPage from './pages/ChatPage'

// Owner pages
import OwnerLoginPage from './pages/owner/OwnerLoginPage'
import OwnerSignupPage from './pages/owner/OwnerSignupPage'
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage'
import OwnerRestaurantPage from './pages/owner/OwnerRestaurantPage'
import OwnerReviewsPage from './pages/owner/OwnerReviewsPage'
import OwnerAddRestaurantPage from './pages/owner/OwnerAddRestaurantPage'
import ClaimRestaurantPage from './pages/owner/ClaimRestaurantPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<ExplorePage />} />
          <Route path="/restaurants/:id" element={<RestaurantDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/owner/login" element={<OwnerLoginPage />} />
          <Route path="/owner/signup" element={<OwnerSignupPage />} />

          {/* Protected — user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/add-restaurant" element={<AddRestaurantPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Route>

          {/* Protected — owner */}
          <Route element={<ProtectedRoute />}>
            <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
            <Route path="/owner/restaurant" element={<OwnerRestaurantPage />} />
            <Route path="/owner/reviews" element={<OwnerReviewsPage />} />
            <Route path="/owner/add-restaurant" element={<OwnerAddRestaurantPage />} />
            <Route path="/owner/claim" element={<ClaimRestaurantPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AiChatWidget />
      </AuthProvider>
    </BrowserRouter>
  )
}
