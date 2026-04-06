require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: allowedOrigin, methods: ['GET', 'POST'], credentials: true }));
app.use(express.json({ limit: '10mb' }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = 'llama-3.1-8b-instant';

/**
 * Normalizes AI output for Industry-Grade Accuracy
 */
function normalizeAnalysis(data, resumeTextLength, jdLength) {
  // NOTE: We intentionally ignore the AI's overall_score — it is always recalculated
  // from weighted sub-scores to guarantee mathematical consistency.
  let finalScore = 0;

  const defaults = {
    overall_score: 0,
    verdict: data.verdict || 'Good',
    verdict_color: data.verdict_color || 'yellow',
    summary: data.summary || "Comprehensive analysis complete. Focus on highlighting quantifiable achievements.",
    scores: {
      keyword_match: { score: 0, label: "Keyword Match", icon: "🔑" },
      format_ats: { score: 0, label: "ATS Format", icon: "📄" },
      experience_match: { score: 0, label: "Experience Fit", icon: "💼" },
      skills_alignment: { score: 0, label: "Skills Alignment", icon: "⚡" },
      education_match: { score: 0, label: "Education Match", icon: "🎓" },
      impact_results: { score: 0, label: "Impact & Results", icon: "📊" }
    },
    keywords: { found: [], missing: [], bonus: [] },
    issues: [],
    suggestions: [],
    strengths: [],
    job_title_match: data.job_title_match || 'Detected',
    experience_years_required: data.experience_years_required || 'N/A',
    candidate_experience_years: data.candidate_experience_years || 'N/A'
  };

  if (data.scores) {
    Object.keys(defaults.scores).forEach(key => {
      const s = data.scores[key]; // FIX: Only read the exact key — no wrong field fallbacks
      if (s !== undefined && s !== null) {
        const parsed = parseInt(s.score ?? s);
        defaults.scores[key].score = Math.min(100, Math.max(0, isNaN(parsed) ? 0 : parsed)); // FIX: 0 fallback, not 70
        if (s.description) defaults.scores[key].description = s.description;
      }
    });

    // Programmatically calculate overall_score exactly to avoid LLM math mistakes
    const weights = {
      keyword_match: 0.25,      // 25%
      skills_alignment: 0.20,   // 20%
      format_ats: 0.15,         // 15%
      experience_match: 0.15,   // 15%
      impact_results: 0.15,     // 15%
      education_match: 0.10     // 10%
    };

    let calculatedTotal = 0;
    Object.keys(weights).forEach(k => {
      calculatedTotal += (defaults.scores[k].score * weights[k]);
    });
    finalScore = Math.round(calculatedTotal); // FIX: Always use weighted calc — never fall back to AI's score
  }

  // Determine final verdict based on strict thresholds
  const finalVerdict = finalScore >= 85 ? 'Excellent' : finalScore >= 75 ? 'Strong' : finalScore >= 60 ? 'Good' : finalScore > 40 ? 'Fair' : 'Poor';

  return {
    ...defaults,
    ...data,
    overall_score: finalScore,
    verdict: finalVerdict,
    scores: defaults.scores,
    keywords: {
      found: Array.isArray(data?.keywords?.found) ? data.keywords.found : [],
      missing: Array.isArray(data?.keywords?.missing) ? data.keywords.missing : [],
      bonus: Array.isArray(data?.keywords?.bonus) ? data.keywords.bonus : []
    }
  };
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
CRITICAL: You are an Expert Career Coach & Recruiter.
Score EVERY individual category strictly on a 0-100 percent scale (e.g., 85, not 12).
Respond ONLY with a JSON object:
{
  "overall_score": (int 0-100),
  "verdict": "Excellent|Strong|Good|Fair|Poor",
  "summary": "Write a 1-2 sentence professional recruiter summary highlighting specific technical strengths and explicitly noting any critical gaps for the role.",
  "scores": {
    "keyword_match": {"score": (int 0-100)},
    "format_ats": {"score": (int 0-100)},
    "experience_match": {"score": (int 0-100)},
    "skills_alignment": {"score": (int 0-100)},
    "education_match": {"score": (int 0-100)},
    "impact_results": {"score": (int 0-100), "description": "High score for advanced capability"}
  },
  "keywords": {
    "found":["Extract exact words/phrases that appear verbatim in BOTH the JD and the resume. NEVER use generic category labels."],
    "missing":["Extract exact words/phrases that appear verbatim in the JD but are absent from the resume. NEVER use generic category labels."],
    "bonus":["Extract exact skill names present in the resume but not mentioned in the JD."]
  },
  "issues": [{"severity":"critical|warning|info", "title":"", "description":""}],
  "suggestions": [{"priority":"high|medium|low", "category":"", "title":"", "action":""}],
  "job_title_match": "Detailed title comparison",
  "candidate_experience_years": "Strictly choose ONE: 'Current Student (1st/2nd Year)' | 'Pre-final Year Student' | 'Fresher (0 Years)' | '1-2 Years' | '3-5 Years' | '5+ Years'"
}`;

async function analyzeWithGemini(resume, jd, modelName) {
  const prompt = `Strictly evaluate this resume against the JD. 
  MANDATORY DYNAMIC SCORING RULES:
  1. IF FRESHER/INTERN/STUDENT: Grade 'Impact & Results' strictly on project technical depth. Grade 'Experience Fit' purely on actual Internships/Work History. DO NOT raise issues about 'quantifiable metrics' or 'ROI' — these are irrelevant for students.
  2. IF EXPERIENCED: Strictly mandate Quantifiable Metrics and raise issues when absent.
  3. STRICT DOMAIN PENALTY: If the JD requires a specialized technical domain and the resume only has general software engineering projects, you MUST brutally penalize 'skills_alignment' and 'keyword_match' (score 10-40). DO NOT inflate scores just because they can code.
  Determine candidate_experience_years dynamically based on education dates and tenure.
  RESUME: ${resume}
  JD: ${jd}
  ${SCHEMA_PROMPT}`;

  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, '').trim();
  return normalizeAnalysis(JSON.parse(text), resume.length, jd.length);
}

async function analyzeWithGroq(resume, jd) {
  const prompt = `Strictly evaluate this resume against the JD. 
  MANDATORY DYNAMIC SCORING RULES:
  1. IF FRESHER/INTERN/STUDENT: Grade 'Impact & Results' strictly on project technical depth. Grade 'Experience Fit' purely on actual Internships/Work History. DO NOT raise issues about 'quantifiable metrics' or 'ROI' — these are irrelevant for students.
  2. IF EXPERIENCED: Strictly mandate Quantifiable Metrics and raise issues when absent.
  3. STRICT DOMAIN PENALTY: If the JD requires a specialized technical domain and the resume only has general software engineering projects, you MUST brutally penalize 'skills_alignment' and 'keyword_match' (score 10-40). DO NOT inflate scores just because they can code.
  Determine candidate_experience_years dynamically based on education dates and tenure.
  RESUME: ${resume}
  JD: ${jd}
  ${SCHEMA_PROMPT}`;

  const chat = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: GROQ_MODEL,
    temperature: 0,
    response_format: { type: 'json_object' }
  });
  return normalizeAnalysis(JSON.parse(chat.choices[0].message.content), resume.length, jd.length);
}

app.post('/api/analyze', upload.single('resumeFile'), async (req, res) => {
  try {
    let txt = req.body.resumeText || '';
    if (req.file) txt = await extractTextFromFile(req.file);
    const jd = req.body.jobDescription || '';

    if (!txt.trim() || !jd.trim()) return res.status(400).json({ error: 'Data missing' });

    console.log(`📩 Request: Resume(${txt.length}b), JD(${jd.length}b)`);

    const models = [
      process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.0-flash'
    ];

    for (const m of models) {
      try {
        const data = await analyzeWithGemini(txt, jd, m);
        console.log(`✅ Success with ${m}`);
        return res.json({ success: true, data });
      } catch (e) {
        console.error(`❌ Gemini ${m} failed:`, e.message || e);
      }
    }

    const data = await analyzeWithGroq(txt, jd);
    res.json({ success: true, data });

  } catch (err) {
    console.error('Final system failure:', err);
    res.status(500).json({ error: 'System busy. Please try again after a few minutes.' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

const fs = require('fs');
const buildPath = path.join(__dirname, '..', 'frontend', 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));
} else {
  app.get('/', (req, res) => res.json({ message: "ResumeIQ API Live." }));
}

app.listen(PORT, () => console.log(`🚀 API on ${PORT}`));
