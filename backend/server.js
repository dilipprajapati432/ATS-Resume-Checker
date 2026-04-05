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
const GROQ_MODEL = 'llama-3.3-70b-versatile';

/**
 * Normalizes AI output for Industry-Grade Accuracy
 */
function normalizeAnalysis(data, resumeTextLength, jdLength) {
  const scoreKeys = ['overall_score', 'score', 'ATS_Score', 'total_score'];
  let foundScore = null;
  for (const key of scoreKeys) {
    if (data[key] !== undefined) {
      foundScore = parseInt(data[key]);
      break;
    }
  }

  const finalScore = (foundScore !== null && !isNaN(foundScore)) ? foundScore : 0;

  const defaults = {
    overall_score: finalScore,
    verdict: data.verdict || (finalScore > 80 ? 'Strong' : (finalScore > 50 ? 'Good' : 'Fair')),
    verdict_color: data.verdict_color || (finalScore > 80 ? 'green' : (finalScore > 50 ? 'yellow' : 'orange')),
    summary: data.summary || "Comprehensive analysis complete.",
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
      const s = data.scores[key] || data.scores.quantification || data.scores.impact_value;
      if (s !== undefined && s !== null) {
        defaults.scores[key].score = parseInt(s.score ?? s) ?? 70;
        if (s.description) defaults.scores[key].description = s.description;
      }
    });
  }

  return {
    ...defaults,
    ...data,
    overall_score: finalScore,
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
CRITICAL: You are an Expert Career Coach & Recruiter. Use weighted scoring (Impact=35%, Keywords=25%, Experience=20%, Skills=15%, Edu=5%).
Respond ONLY with a JSON object:
{
  "overall_score": (int 0-100),
  "verdict": "Excellent|Strong|Good|Fair|Poor",
  "summary": "Professional insight focusing on project complexity or ROI achievements.",
  "scores": {
    "keyword_match": {"score": (int)},
    "format_ats": {"score": (int)},
    "experience_match": {"score": (int)},
    "skills_alignment": {"score": (int)},
    "education_match": {"score": (int)},
    "impact_results": {"score": (int), "description": "Specific evidence found"}
  },
  "keywords": {"found":[], "missing":[], "bonus":[]},
  "issues": [{"severity":"critical|warning|info", "title":"", "description":""}],
  "suggestions": [{"priority":"high|medium|low", "category":"", "title":"", "action":""}],
  "job_title_match": "Detailed title comparison",
  "candidate_experience_years": "Actual Yrs detected"
}`;

async function analyzeWithGemini(resume, jd, modelName) {
  const prompt = `Strictly evaluate this resume against the JD. 
  MANDATORY DYNAMIC SCORING RULES:
  1. IF FRESHER/INTERN (0-1 years): Focus 100% on Technical Depth and Project Intensity. Reward "Built X using Y." NEVER penalize for lacking corporate ROI/Revenue.
  2. IF EXPERIENCED: Strictly mandate Quantifiable Metrics.
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
  Adaptive Rule: Reward projects for students, ROI for professionals.
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
