<p align="center">
  <img src="assets/logo.png" alt="Soroban Hub Logo" width="250" />
</p>

# Soroban Hub: Decentralized Community Platform

A fully decentralized community engagement application built on the Stellar network using Soroban smart contracts. This platform features a breathtaking **Web3 Glassmorphism** aesthetic, high-performance interactions, and seamless wallet connectivity.

## 🎥 Preview & Demo

**Dynamic Landing Page**  
![Landing Page Screenshot](assets/landing.png)

**Interactive Dashboard**  
![Community Dashboard Screenshot](assets/dashboard.png)

**Video Walkthrough**  
![Application Demo Video](assets/demo.webp)

---

## 🌟 System Architecture (End-To-End)

![System Architecture Diagram](my-stellar-app/src/assets/diagram-export-3-4-2026-2_47_15-am.png)

This application is built with a decoupled architecture connecting a premium, state-of-the-art React frontend to a secure Stellar Soroban backend.

### 1. The Frontend Layer (React + Vite)
- **Vite & React 19:** Serves as the foundation. Vite provides ultra-fast Hot Module Replacement (HMR) and a highly optimized production build. React handles the component structure.
- **Conditional SPA Routing:** For performance and simplicity, the application bypasses heavy routing libraries (like `react-router-dom`) in favor of direct React state rendering (`inApp`). This provides instantaneous, un-flashy transitions between the landing page and the core application.
- **GSAP (GreenSock):** The `LandingPage.jsx` leverages GSAP's timeline (`gsap.timeline`) mechanics. It orchestrates complex 3D-feeling micro-animations, yoyo-ing organic floating shapes, and precisely staggered text-reveal mechanics.
- **Lucide-React Iconography:** Replaces default browser emojis with high-fidelity, scalable SVG vectors that inherit CSS variables dynamically.

### 2. Styling System & Glassmorphism
- **Vanilla CSS Engine:** Uses raw CSS with extensive CSS variables (`--bg-surface`, `--accent-blue`) mapped across `index.css` and `App.css`, allowing for globally consistent theming. 
- **Glassmorphism Metrics:** Defines elements with `.glass` classes, utilizing `backdrop-filter: blur(16px)` stacked over semi-transparent white RGBA backgrounds.

### 3. Blockchain Integration Bridge (`lib/stellar.js`)
- **Freighter API:** The `@stellar/freighter-api` handles browser extension handshakes safely detecting the user, requesting arbitrary signing permissions, and bridging session keys.
- **Stellar SDK:** Handles direct Remote Procedure Calls (RPC) interfacing to submit and parse Soroban transactions/methods (e.g., getting post counts, transacting smart contract mutations).
- **Error Interception Layer:** Uses custom JS try-catch interceptors to filter verbose blockchain crashes (like `HostError: Error(Contract, #3)`) into elegant, non-crashing graphic UI alerts.

---

## 🛠 Features Dashboard

- **Create Post:** Mint a new post onto the Stellar blockchain. Supports metadata such as Category, Tags, Author, and custom defined Post IDs.
- **Interact:** Comment or like any arbitrary post. 
- **Moderation:** Directly flag malicious posts or trigger remove-post mutations directly from the contract.
- **Live Feed Tracking:** Real-time data polling for post counts and individual post inspections.

---

## 🚀 Setup & Installation Guide

Follow these sequential steps precisely to run the platform locally or verify changes.

### Pre-requisites
1. Node.js (v18 or higher)
2. NPM (v9 or higher)
3. The **Freighter Wallet Extension** installed in your browser and connected to the Stellar Testnet/Futurenet.

### 1. Clone & Install
Ensure you are in the application directory (`my-stellar-app`), then install standard NPM dependencies:
```bash
git clone https://github.com/pratyush06-aec/community-platform.git
cd community-platform/my-stellar-app
npm install 
```

### 2. Running Locally (Development Mode)
To spin up the Vite development server (usually available on `localhost:5173`):
```bash
npm run dev
```

### 3. Building for Production
When extending deployment pipelines, run the builder. Vite will compress all JS, resolve the GSAP bundles, and optimize SVGs into a single deployable structure located in `/dist`:
```bash
npm run build
```

---

## 📂 Project Structure Walkthrough

```text
my-stellar-app/
├── public/                 # Static, uncompiled web assets
├── src/
│   ├── components/
│   │   ├── LandingPage.jsx # Hero introduction component + GSAP timelines
│   │   └── CommunityApp.jsx# Core Application, Navigation Tabs, and Integration logic
│   ├── App.jsx             # Root layout and conditional rendering orchestrator
│   ├── index.css           # Boilerplate resets & Typography imports (Inter, Outfit)
│   ├── App.css             # Main Component styling, animations, and Glassmorphism hooks
│   └── main.jsx            # React root DOM injector
├── lib/
│   └── stellar.js          # The internal API bridge to your Soroban Smart Contracts
├── package.json            # Strict dependencies locked to current working configurations
└── vite.config.js          # Build tooling parameters
```

---

<p align="center">
  <b>If you liked the project, don't forget to give it a ⭐</b>
</p>
