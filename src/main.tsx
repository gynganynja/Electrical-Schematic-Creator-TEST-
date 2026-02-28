import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Suppress React Flow's cosmetic "Couldn't create edge" dev warning (#008).
// These fire when stored edges reference handles on nodes that aren't yet mounted,
// or when wires are drawn from passive (target-type) handles. The simulation
// solver handles all topology correctly regardless of this warning.
const _warn = console.warn.bind(console);
console.warn = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Couldn\'t create edge')) return;
    _warn(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
