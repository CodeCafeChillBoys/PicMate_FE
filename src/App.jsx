import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import PhotographerProfile from './pages/PhotographerProfile';
import BookingPage from './pages/BookingPage';
import AuthPage from './pages/AuthPage';
import PresetShop from './pages/PresetShop';
import CustomerDashboard from './pages/dashboard/CustomerDashboard';
import PhotographerDashboard from './pages/dashboard/PhotographerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import InstantPage from './pages/InstantPage';
import DirectAccessRoute from './components/auth/DirectAccessRoute';
import './App.css';

function App() {
  return (
    <Router>
      <AppDataProvider>
        <AuthProvider>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/photographer/:id" element={<PhotographerProfile />} />
              <Route path="/booking/:id" element={<BookingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/presets" element={<PresetShop />} />
              <Route path="/instant" element={<InstantPage />} />
              <Route path="/dashboard" element={
                <DirectAccessRoute role="customer">
                  <CustomerDashboard />
                </DirectAccessRoute>
              } />
              <Route path="/dashboard/photographer" element={
                <DirectAccessRoute role="photographer">
                  <PhotographerDashboard />
                </DirectAccessRoute>
              } />
              <Route path="/admin" element={
                <DirectAccessRoute role="admin">
                  <AdminDashboard />
                </DirectAccessRoute>
              } />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </AppDataProvider>
    </Router>
  );
}

export default App;
