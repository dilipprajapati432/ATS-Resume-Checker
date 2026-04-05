require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ 
  origin: allowedOrigin,
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = 'llama-3.3-70b-versatile';

/**
 * Normalizes AI output to ensure the frontend never receives 'undefined' or static '75'
 */
function normalizeAnalysis(data, resumeTextLength, jdLength) {
  console.log(`🔍 Received AI Data for Resume(${resumeTextLength}) & JD(${jdLength})`);
  
  // 1. Dynamic Score Extraction (Check multiple possible keys)
  const scoreKeys = ['overall_score', 'score', 'ATS_Score', 'total_score', 'Score'];
  let foundScore = null;
  for (const key of scoreKeys) {
    if (data[key] !== undefined) {
      foundScore = parseInt(data[key]);
      break;
    }
  }

  // 2. Strict Fallback: Use 0 if truly missing, so we can detect failure
  const finalScore = (foundScore !== null && !isNaN(foundScore)) ? foundScore : 0;
  console.log(`🎯 Final Computed Score: ${finalScore}`);

  const defaults = {
    overall_score: finalScore,
    verdict: data.verdict || (finalScore > 80 ? 'Strong' : (finalScore > 50 ? 'Good' : 'Fair')),
    verdict_color: data.verdict_color || (finalScore > 80 ? 'green' : (finalScore > 50 ? 'yellow' : 'orange')),
    summary: data.summary || (jdLength < 50 ? "⚠️ Job description is very short. For better accuracy, please paste the full responsibilities and requirements." : "Comprehensive analysis complete."),
    scores: {
      keyword_match: { score: 0, label: "Keyword Match", icon: "🔑" },
      format_ats: { score: 0, label: "ATS Format", icon: "📄" },
      experience_match: { score: 0, label: "Experience Fit", icon: "💼" },
      skills_alignment: { score: 0, label: "Skills Alignment", icon: "⚡" },
      education_match: { score: 0, label: "Education Match", icon: "🎓" },
      quantification: { score: 0, label: "Impact & Metrics", icon: "📊" }
    },
    keywords: { found: [], missing: [], bonus: [] },
    issues: [],
    suggestions: [],
    strengths: [],
    job_title_match: data.job_title_match || 'Detected',
    experience_years_required: data.experience_years_required || 'N/A',
    candidate_experience_years: data.candidate_experience_years || 'N/A'
  };

  // Map sub-scores
  if (data.scores) {
    Object.keys(defaults.scores).forEach(key => {
      const s = data.scores[key];
      if (s !== undefined && s !== null) {
        defaults.scores[key].score = parseInt(s.score ?? s) ?? 70;
      }
    });
  }

  // Final Data Assembly
  const normalized = {
    ...defaults,
    ...data,
    overall_score: finalScore,
    scores: defaults.scores,
    keywords: {
      found: Array.isArray(data?.keywords?.found) ? data.keywords.found : [],
      missing: Array.isArray(data?.keywords?.missing) ? data.keywords.missing : [],
      bonus: Array.isArray(data?.keywords?.bonus) ? data.keywords.bonus : []
    },
    issues: Array.isArray(data.issues) ? data.issues : [],
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    strengths: Array.isArray(data.strengths) ? data.strengths : []
  };

  // Ensure UI boxes have content
  if (normalized.issues.length === 0) normalized.issues = [{ severity: 'info', title: 'Formatting', description: 'Your resume structure is legible for ATS scanners.' }];
  if (normalized.strengths.length === 0) normalized.strengths = ['Professional document layout'];

  return normalized;
}

async function extractTextFromFile(file) {
  if (file.mimetype === 'text/plain') return file.buffer.toString('utf-8');
  if (file.mimetype === 'application/pdf') {
    const pdfParse = require('pdf-parse');
    const res = await pdfParse(file.buffer);
    return res.text;
  }
  return '';
}

const SCHEMA_PROMPT = `
CRITICAL: Do not use placeholding values. Calculate every score based on the actual resume text provided.
Respond ONLY with a JSON object:
{
  "overall_score": (int 0-100),
  "verdict": "Excellent|Strong|Good|Fair|Poor",
  "verdict_color": "green|blue|yellow|orange|red",
  "summary": "Specific analysis...",
  "scores": {
    "keyword_match": {"score": (int)},
    "format_ats": {"score": (int)},
    "experience_match": {"score": (int)},
    "skills_alignment": {"score": (int)},
    "education_match": {"score": (int)},
    "quantification": {"score": (int)}
  },
  "keywords": {"found":[], "missing":[], "bonus":[]},
  "issues": [{"severity":"critical|warning|info", "title":"", "description":""}],
  "suggestions": [{"priority":"high|medium|low", "category":"", "title":"", "action":""}],
  "strengths": [],
  "job_title_match": "...",
  "experience_years_required": "...",
  "candidate_experience_years": "..."
}`;

async function analyzeWithGemini(resume, jd, modelName) {
  const prompt = `Strictly evaluate this resume against the JD. Use absolute consistency.
  IDENTITY RULE: NEVER mention you are an AI, bot, or LLM. Speak as a Professional ATS Analysis System.
  EXPERIENCE RULE: If the candidate has NO professional work history, set "candidate_experience_years" to "0 years (Fresher)" and penalize "experience_match".
  RESUME: ${resume}
  JD: ${jd}
  ${SCHEMA_PROMPT}`;

  const model = genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: { temperature: 0, topP: 0.1 } 
  });
  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, '').trim();
  console.log(`🤖 ${modelName} Raw Data:`, text.substring(0, 100));
  return normalizeAnalysis(JSON.parse(text), resume.length, jd.length);
}

async function analyzeWithGroq(resume, jd) {
  const prompt = `You are a Professional ATS Analysis System. Give consistent, identical scores for identical content. 
  IDENTITY RULE: NEVER mention you are an AI, bot, or LLM. Do not use phrases like "Based on my analysis as an AI".
  EXPERIENCE RULE: If candidate is a Fresher with 0 experience, set "candidate_experience_years" to "0 years (Fresher)".
  RESUME: ${resume}
  JD: ${jd}
  ${SCHEMA_PROMPT}`;

  const chat = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: GROQ_MODEL,
    temperature: 0,
    response_format: { type: 'json_object' }
  });
  const text = chat.choices[0].message.content;
  console.log('🤖 Raw AI Content:', text.substring(0, 100));
  return normalizeAnalysis(JSON.parse(text), resume.length, jd.length);
}

app.post('/api/analyze', upload.single('resumeFile'), async (req, res) => {
  try {
    let txt = req.body.resumeText || '';
    if (req.file) txt = await extractTextFromFile(req.file);
    const jd = req.body.jobDescription || '';

    if (!txt.trim() || !jd.trim()) return res.status(400).json({ error: 'Data missing' });

    console.log(`📩 Request Received: Resume(${txt.length}b), JD(${jd.length}b)`);

    const models = [process.env.GEMINI_MODEL || 'gemini-1.5-flash', 'gemini-1.5-flash-8b'];
    for (const m of models) {
      try {
        const data = await analyzeWithGemini(txt, jd, m);
        return res.json({ success: true, data });
      } catch (e) {
        console.error(`${m} failed, trying next...`);
      }
    }

    const data = await analyzeWithGroq(txt, jd);
    res.json({ success: true, data });

  } catch (err) {
    console.error('Final failure:', err);
    res.status(500).json({ error: 'System busy. Please try again.' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

const fs = require('fs');
const buildPath = path.join(__dirname, '..', 'frontend', 'build');

// ONLY serve static files if they exist locally
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));
} else {
  // If no frontend, provide a simple JSON landing page
  app.get('/', (req, res) => res.json({ 
    message: "ResumeIQ API is running.", 
    status: "production",
    frontend: "Hosted on Vercel" 
  }));
}

app.listen(PORT, () => console.log(`🚀 API on ${PORT}`));
