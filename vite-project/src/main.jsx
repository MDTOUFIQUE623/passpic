import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import AppContextProvider from './context/AppContext.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const clerkAppearance = {
  elements: {
    userButtonBox: {
      width: '48px',
      height: '48px'
    },
    userButtonTrigger: {
      width: '48px',
      height: '48px'
    },
    userButtonAvatarBox: {
      width: '48px',
      height: '48px'
    },
    avatarBox: {
      width: '48px',
      height: '48px'
    }
  }
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      appearance={clerkAppearance}
    >
      <AppContextProvider>  
        <App />
        <ToastContainer 
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </AppContextProvider>
    </ClerkProvider>
  </BrowserRouter>,
)

