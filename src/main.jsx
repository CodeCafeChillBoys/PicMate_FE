import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

// Chỉ bọc GoogleOAuthProvider khi đã cấu hình Client ID; nếu chưa, app vẫn chạy bình thường (nút Google sẽ ẩn).
const tree = googleClientId
  ? <GoogleOAuthProvider clientId={googleClientId}><App /></GoogleOAuthProvider>
  : <App />

createRoot(document.getElementById('root')).render(
  tree,
)
