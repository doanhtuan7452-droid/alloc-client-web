import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { UserProvider } from "./contexts/UserContext";
import { TaskAIProvider } from "./contexts/TaskAIContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SignalRProvider } from "./contexts/SignalRContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <LanguageProvider>
        <UserProvider>
          <TaskAIProvider>
            <NotificationProvider>
              <SignalRProvider>
                <App />
              </SignalRProvider>
            </NotificationProvider>
          </TaskAIProvider>
        </UserProvider>
      </LanguageProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)