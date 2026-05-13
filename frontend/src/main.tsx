import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import { ChatbotProvider } from './contexts/ChatbotContext';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ChatbotProvider>
        <App />
      </ChatbotProvider>
    </BrowserRouter>
  </StrictMode>,
)