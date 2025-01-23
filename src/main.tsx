// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import App from './App';
// import { GoogleOAuthProvider } from '@react-oauth/google';
// import './index.css';

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <GoogleOAuthProvider clientId='497074437558-o2rdspogtcgrtr0ajq70roscb0fr9pt2.apps.googleusercontent.com'>
//       <App />
//     </GoogleOAuthProvider>
//   </StrictMode>
// );
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)