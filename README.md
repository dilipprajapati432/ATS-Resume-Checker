# ⚡ ResumeIQ — AI ATS Optimizer

**ResumeIQ** is a full-stack web application designed to help job seekers optimize their resumes for Applicant Tracking Systems (ATS). Using **Google Gemini 2.0** and **Groq (Llama 3)**, it provides detailed compatibility scores, keyword gap analysis, and actionable suggestions to improve interview chances.

---

## ✨ Features
- **🧠 6-Dimensional AI Scoring** — Analysis of Keywords, Formatting, Experience, Skills, Education, and Impact.
- **⚡ Hybrid AI Engine** — Ultra-fast insights powered by Gemini 2.0 and Groq/Llama-3.3.
- **📄 Full File Support** — Instant extraction from **PDF** and **TXT** files.
- **🎨 Premium UI** — Dark editorial design with interactive scoring charts and glassmorphism components.
- **🛡️ Privacy-First** — Transient, in-memory processing. Resumes are never stored.

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Framer Motion, Recharts
- **Backend**: Node.js, Express, Multer, PDF-Parse
- **AI Engine**: Google Gemini 2.0 Flash & Groq (Llama 3.3 70b)
- **Deployment**: Vercel (Frontend) & Render (Backend)

---

## 📁 Project Structure
```text
.
├── backend/            # Express.js API & AI Analysis Logic
│   ├── .env.example    # Template for environment variables
│   ├── server.js       # Core API & Multi-Model AI Engine
│   └── package.json
├── frontend/           # React.js SPA (Vite/CRA)
│   ├── public/         # Static assets
│   ├── src/
│   │   ├── components/ # Modular UI (Hero, AnalyzeForm, etc.)
│   │   ├── App.js      # Main Router & Layout
│   │   └── index.css   # 'Dark Editorial' Design System
│   ├── vercel.json     # Production routing config
│   └── package.json
├── package.json        # Root scripts for managing both layers
└── README.md
```

---

## 🚀 Local Setup

### 1. Clone & Install
```bash
# Clone the repository
git clone <your-repo-link>
cd <repo-name>

# Install all dependencies
npm run install:all
```

### 2. Configure Environment
Create `backend/.env` using the provided `.env.example`:
```env
GEMINI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
```

### 3. Run Development
```bash
npm run dev
```

---

## 👤 Author
**Dilip Prajapati**
- 💼 [LinkedIn](https://www.linkedin.com/in/dilip-kohar-014627293)
- 🌐 [Facebook](https://www.facebook.com/dilip.kohar.7)
- 📧 [Email](mailto:dilipkohar4320@gmail.com)

---

## 📄 License
This project is licensed under the MIT License.
