# e-PC (Digital Panchayat System) - Backend

This is the Node.js / Express backend for the **e-PC** (Digital Panchayat System). It handles authentication, complaints management, AI interactions via Gemini, real-time notifications, digital polling, and government schemes administration.

## 🚀 Tech Stack
- **Framework:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **AI Integration:** Google Generative AI (Gemini 2.5 Flash Lite)
- **File Upload & Storage:** Multer, Cloudinary
- **Authentication:** JSON Web Tokens (JWT)
- **Email Service:** Nodemailer (SMTP)

## 📦 Setup & Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the `backend` folder and configure the following variables:
   ```env
   # Database & Server
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string

   # Authentication
   JWT_SECRET=your_jwt_secret

   # Email Configuration (Nodemailer)
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_email@example.com
   SMTP_PASS=your_email_app_password

   # Cloudinary (Image Uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Google Generative AI
   GEMINI_API_KEY=your_gemini_api_key
   ```
3. Start the server:
   ```bash
   npm start
   # or for development:
   npm run dev
   ```

---

## 🔗 API Documentation & Endpoints

All endpoints are prefixed with `http://localhost:5000/api`

### 1. Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register a new user/citizen |
| POST | `/auth/login` | Public | Login and receive a JWT token |

### 2. Complaints Management (`/api/complaints`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/complaints` | Protected | Get complaints (Citizens see theirs, Admins see all) |
| POST | `/complaints` | Protected | Submit a new complaint (supports image uploads via `multipart/form-data`) |
| PUT | `/complaints/:id` | Protected/Admin | Update a complaint's status (Pending, In Progress, Resolved) |

### 3. Digital Polling (`/api/polls`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/polls` | Protected | Fetch all active polls |
| POST | `/polls` | Protected/Admin | Create a new poll |
| POST | `/polls/:id/vote` | Protected | Vote for an option on a specific poll |

### 4. Government Schemes (`/api/schemes`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/schemes` | Protected | Get a list of all active schemes |
| POST | `/schemes` | Protected/Admin | Add a new scheme (automatically generates an AI summary) |

### 5. Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/notifications` | Protected | Get all notifications for the logged-in user |
| PUT | `/notifications/:id/read` | Protected | Mark a specific notification as read by ID |

### 6. AI Assistant Chat (`/api/ai`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/ai/chat` | Protected | Send an interactive prompt to the AI e-PC Chatbot |

---

## 🤖 AI Automations embedded
- **Complaint Analysis:** AI analyzes every user complaint to restructure it into a formal tone, detect the precise category, and gauge the urgency level.
- **Scheme Simplification:** When an admin adds a new government scheme with a highly technical description, AI generates a "Simplified Hindi" version for laymen citizens.
- **Dedicated Chatbot:** The `/ai/chat` endpoint provides interactive assistance regarding rules, regulations, and local issues.
