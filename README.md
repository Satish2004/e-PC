# e-PC – Smart Digital Panchayat System

e-PC is a next-generation digital platform designed to bridge the gap between rural citizens and panchayat governance. By leveraging Artificial Intelligence, it streamlines complaint management, simplifies government scheme understanding, and fosters transparency in village decision-making.

## 🚀 Key Features

- **AI-Powered Chatbot**: A multilingual assistant (English/Hindi) that helps citizens understand panchayat services and schemes.
- **Smart Complaint System**: citizens can file complaints which are automatically categorized and prioritized using AI.
- **Government Schemes Directory**: Simplified summaries of state and central government schemes, making them easy for every citizen to understand.
- **Interactive Village Polls**: Participate in village decision-making through digital polls.
- **User Dashboard**: Real-time notifications and status tracking for filed complaints.
- **Secure Authentication**: Robust JWT-based authentication for citizens and administrators.

## 🛠 Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS, Framer Motion (for animations)
- **State Management**: Zustand
- **Graphics & Maps**: Three.js/Fiber (3D elements), Leaflet (for maps)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **AI Integration**: Google Gemini AI (Generative Language API)
- **File Handling**: Cloudinary, Multer
- **Scheduling**: Node-cron (for background tasks)

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (Local or Atlas)
- **Gemini API Key** (from Google AI Studio)

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/vijaychandra1910/SVAPN.git
cd e-panchayat
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

## 🚀 Running the Application

### Start Backend
```bash
cd backend
npm run dev
```

### Start Frontend
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173` (Frontend) and `http://localhost:5000` (Backend).

## 📄 License

This project is licensed under the ISC License.

---
**GramAI+** – Empowering Villages through Digital Intelligence.
