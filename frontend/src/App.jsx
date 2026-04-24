import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ChatProvider } from './contexts/ChatContext'

import ExplorePage from './pages/ExplorePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import RestaurantDetailsPage from './pages/RestaurantDetailsPage'
import ProfilePage from './pages/ProfilePage'
import AddRestaurantPage from './pages/AddRestaurantPage'
import FavoritesPage from './pages/FavoritesPage'
import HistoryPage from './pages/HistoryPage'
import ChatPage from './pages/ChatPage'
import AiChatWidget from './components/AiChatWidget'

import OwnerDashboardPage from './pages/OwnerDashboardPage'
import OwnerReviewsPage from './pages/OwnerReviewsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ChatProvider>
            <Navbar />
            <Routes>
          {/* Public */}
          <Route path="/" element={<ExplorePage />} />
          <Route path="/restaurants/:id" element={<RestaurantDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/owner/login" element={<Navigate to="/login?role=owner" replace />} />
          <Route path="/owner/signup" element={<Navigate to="/signup?role=owner" replace />} />

          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['owner']} redirectTo="/login?role=owner" />}>
            <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
            <Route path="/owner/restaurants/new" element={<AddRestaurantPage />} />
            <Route path="/owner/restaurants/:restaurantId/edit" element={<AddRestaurantPage />} />
            <Route path="/owner/reviews" element={<OwnerReviewsPage />} />
            <Route path="/owner/profile" element={<ProfilePage />} />
          </Route>
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <AiChatWidget />
          </ChatProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
