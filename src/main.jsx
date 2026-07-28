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
    <GoogleOAuthProvider clientId="384425170137-0f41pqjho5qd78geb30nn4q3c5s7vqpj.apps.googleusercontent.com">
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