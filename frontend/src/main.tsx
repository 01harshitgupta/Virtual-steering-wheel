import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Redirect React console logs to Electron main process logs
if ((window as any).DriveSense) {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = (...args) => {
    originalLog(...args);
    (window as any).DriveSense.log("log", ...args);
  };
  console.warn = (...args) => {
    originalWarn(...args);
    (window as any).DriveSense.log("warn", ...args);
  };
  console.error = (...args) => {
    originalError(...args);
    (window as any).DriveSense.log("error", ...args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
