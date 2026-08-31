import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { Hub } from './Hub'
import './index.css'

// Lightweight path-based routing without a router dependency:
//   /kyc[...]  -> the live KYC verification app (unchanged)
//   anything else (/) -> the hub landing page linking to every simulation.
// The 5 static prototypes are plain files under /labs/<slug>/ and are served
// directly by the web server, so they never reach React.
const path = window.location.pathname
const Root = path === '/kyc' || path.startsWith('/kyc/') ? App : Hub

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
