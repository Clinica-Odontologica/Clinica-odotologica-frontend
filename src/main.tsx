import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/authContext.tsx'
import { setupAxiosInterceptors } from './utils/axiosInterceptor'

// Setup axios interceptors for auth token handling
setupAxiosInterceptors()

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
)
