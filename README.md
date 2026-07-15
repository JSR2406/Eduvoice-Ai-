# EduVoice AI – AI Voice Content Creator for Teachers

EduVoice AI is a complete, production-ready Full Stack application that helps teachers convert educational text into natural-sounding speech.

## Features
- **Dual-TTS System**: High-quality ElevenLabs TTS with an automatic free fallback to Microsoft Edge TTS.
- **Gemini AI Integration**: Summarize chapters, translate text to Indian languages, rewrite content by grade, and generate homework or announcements.
- **Full-featured Dashboard**: Track audio history, manage favorites, and monitor storage.
- **Template System**: Built-in templates for morning assembly, homework, etc., plus custom templates.
- **Secure Authentication & Database**: Built on Supabase with Row Level Security (RLS) and persistent sessions.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS (v4), React Router, Supabase Auth.
- **Backend**: FastAPI, Python, ElevenLabs API, Google Gemini AI, Edge-TTS.
- **Database & Storage**: Supabase PostgreSQL.

## Getting Started

### 1. Database Setup
1. Create a new [Supabase](https://supabase.com/) project.
2. Go to the SQL Editor and run the contents of `backend/app/database/schema.sql`.

### 2. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Set up environment variables in `backend/.env`:
   - `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` from your Supabase project (API settings).
   - `ELEVENLABS_API_KEY` (Optional, defaults to Edge TTS fallback if empty or quota exceeded).
   - `GEMINI_API_KEY` from Google AI Studio.
4. Start the backend:
   ```bash
   uvicorn main:app --reload
   ```

### 3. Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the frontend folder:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```

## Production Deployment
- **Frontend**: Deploy `frontend/` to Vercel. Ensure environment variables are set.
- **Backend**: Deploy `backend/` to Render or Heroku. Set environment variables.

*Built for the education community. 🎓*
