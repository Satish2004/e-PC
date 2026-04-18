# e-PC (Digital Panchayat System) - Frontend

This is the React / Vite frontend for the **e-PC** (Digital Panchayat System), a cutting-edge web application designed to empower rural areas by digitizing village administration, complaints, polling, and schemes.

## ✨ Features
- **Responsive & Cinematic UI:** High-end motion design and glassmorphism elements targeting modern visual standards.
- **Citizen Dashboard:** Centralized panel for submitting geo-tagged complaints with images, voting on live community polls, and browsing AI-explained local schemes.
- **Analytics Tab:** In-depth interactive visual charts (using Recharts) mapping complaint resolutions and system usage.
- **Admin Dashboard:** Specific panel for Panchayat officers to manage polling, resolve complaints, notify residents, and add government schemes.
- **Multilingual AI Chatbot:** An intelligent interactive assistant helping citizens find forms, answers, and solutions.
- **GIS Integration:** Real-time leaflet map integration showing precisely where community issues are located.

## 🚀 Tech Stack
- **Framework:** React.js powered by Vite
- **Styling:** CSS / Tailwind CSS
- **Animations:** Framer Motion, GSAP, Lenis (Smooth Scrolling)
- **Map System:** React Leaflet (`react-leaflet`)
- **Data Visualization:** Recharts
- **State Management:** Zustand (`useAuthStore`)
- **Icons:** Lucide React

## 📦 Setup & Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

*Ensure that the `backend` server is running concurrently at `http://localhost:5000` for API requests to resolve correctly.*

## 📂 Project Structure Highlights
- `/src/pages`: Main view routes (`Home.jsx`, `Dashboard.jsx`, `Login.jsx`, `Admin.jsx`).
- `/src/components`: Reusable elements (`Navbar.jsx`, `PageTransition.jsx`, `Preloader.jsx`, `Chatbot.jsx`).
- `/src/store`: Application state files (`useAuthStore.js` for JWT authentication).
- `/index.css`: Global styles, cursor overrides, and scrollbar modifications.

## 🔗 Connected Backend
The frontend heavily relies on the backend AI models (Gemini 2.5 Flash Lite). When data is fetched or posted (like submitting a new complaint or opening the chatbot), axial logic automatically attaches a `Bearer token` from local storage to authenticate the transaction securely.
