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
 * Sanitizes experience tags to ensure they are short labels, not sentences.
 */
function sanitizeExpTag(val) {
  if (!val || typeof val !== 'string') return 'Not Specified';
  const clean = val.trim();
  // If it's already a short tag (3 words or less), use it directly
  if (clean.split(/\s+/).length <= 4) return clean;
  // Otherwise, try to extract a recognizable pattern
  const patterns = [
    /(\d+\s*[-–to]+\s*\d+\s*years?)/i,
    /(\d+\+?\s*years?)/i,
    /(fresher|student|pre-final|entry\s*level|intern)/i,
  ];
  for (const p of patterns) {
    const match = clean.match(p);
    if (match) return match[1];
  }
  // Fallback: just take first 3 words
  return clean.split(/\s+/).slice(0, 3).join(' ');
}

/**
 * Helper to check if a keyword exists as a discrete word/term in a text
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasKeyword(textLower, keyword) {
  let kw = keyword.toLowerCase().trim();
  // Strip common trailing versions if it's not simply 'c++' or similar to normalize some matches
  // Actually, let's keep it simple with an explicit synonym map for most common variations
  const synonymMap = {
    'react.js': ['react', 'reactjs'],
    'reactjs': ['react', 'react.js'],
    'react': ['react.js', 'reactjs'],
    'node.js': ['node', 'nodejs'],
    'nodejs': ['node', 'node.js'],
    'node': ['node.js', 'nodejs'],
    'express.js': ['express', 'expressjs'],
    'expressjs': ['express', 'express.js'],
    'express': ['express.js', 'expressjs'],
    'vue.js': ['vue', 'vuejs'],
    'vue': ['vue.js', 'vuejs'],
    'next.js': ['next', 'nextjs'],
    'next': ['next.js', 'nextjs'],
    'javascript': ['js'],
    'js': ['javascript'],
    'typescript': ['ts'],
    'ts': ['typescript'],
    'html5': ['html'],
    'css3': ['css'],
    'postgres': ['postgresql'],
    'postgresql': ['postgres'],
    'aws': ['amazon web services'],
    'amazon web services': ['aws'],
    'gcp': ['google cloud platform'],
    'google cloud': ['gcp', 'google cloud platform'],
  };

  if (!kw) return false;
  
  let keywordsToCheck = [kw];
  if (synonymMap[kw]) {
    keywordsToCheck = keywordsToCheck.concat(synonymMap[kw]);
  }

  for (let k of keywordsToCheck) {
    const escaped = escapeRegExp(k);
    if (new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(textLower)) {
      return true;
    }
  }
  return false;
}

/**
 * Normalizes AI output and applies Programmatic Reinforcement
 */
function normalizeAnalysis(data, resumeText = "", jdText = "") {
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
    experience_years_required: sanitizeExpTag(data.experience_years_required),
    candidate_experience_years: sanitizeExpTag(data.candidate_experience_years)
  };

  if (data.scores) {
    Object.keys(defaults.scores).forEach(key => {
      const s = data.scores[key];
      if (s !== undefined && s !== null) {
        const parsed = parseInt(s.score ?? s);
        defaults.scores[key].score = Math.min(100, Math.max(0, isNaN(parsed) ? 0 : parsed));
        if (s.reason) defaults.scores[key].reason = s.reason;
        if (s.evidence) defaults.scores[key].evidence = s.evidence;
      }
    });

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
    finalScore = Math.round(calculatedTotal);
  }

  // --- PROGRAMMATIC EDUCATION FLOOR ---
  const resumeLow = (resumeText || '').toLowerCase();
  const hasTechDegree = /(b\.?\s*tech|b\.?\s*e\.?|m\.?\s*tech|m\.?\s*s\.?|bachelor|master)/i.test(resumeLow) &&
    /(computer\s*science|cse|information\s*technology|it|ece|electronics|software|engineering)/i.test(resumeLow);
  if (hasTechDegree && defaults.scores.education_match.score < 60) {
    defaults.scores.education_match.score = 60;
    defaults.scores.education_match.reason = 'B.Tech/B.E. in CSE/IT is broadly relevant to all tech roles.';
    const weights = {
      keyword_match: 0.25, skills_alignment: 0.20, format_ats: 0.15,
      experience_match: 0.15, impact_results: 0.15, education_match: 0.10
    };
    let recalc = 0;
    Object.keys(weights).forEach(k => { recalc += (defaults.scores[k].score * weights[k]); });
    finalScore = Math.round(recalc);
  }

  // --- PROGRAMMATIC DOMAIN MISMATCH DETECTION ---
  const jdLower = (jdText || '').toLowerCase();

  // Define domain-specific skill signatures
  const domainSignatures = {
    'machine_learning': {
      jdTriggers: ['machine learning', 'deep learning', 'neural network', 'nlp', 'natural language', 'computer vision',
        'data science', 'ml engineer', 'ai engineer', 'tensorflow', 'pytorch', 'scikit-learn', 'model training',
        'ml ops', 'mlops', 'feature engineering', 'model deployment', 'artificial intelligence', 'llm', 'genai'],
      coreSkills: ['tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn', 'pandas', 'numpy', 'deep learning',
        'machine learning', 'neural network', 'nlp', 'computer vision', 'model', 'training', 'inference',
        'classification', 'regression', 'clustering', 'transformers', 'bert', 'gpt', 'llm', 'genai',
        'data science', 'feature engineering', 'xgboost', 'random forest', 'svm', 'langchain', 'ollama', 'huggingface'],
      minCoreSkillsNeeded: 4
    },
    'devops_cloud': {
      jdTriggers: ['devops', 'cloud engineer', 'site reliability', 'sre', 'infrastructure', 'kubernetes', 'terraform',
        'ci/cd pipeline', 'cloud architect', 'aws', 'azure', 'gcp', 'docker engineer'],
      coreSkills: ['kubernetes', 'terraform', 'ansible', 'jenkins', 'ci/cd', 'docker', 'aws', 'amazon web services', 
        'azure', 'gcp', 'google cloud', 'infrastructure as code', 'iac', 'helm', 'prometheus', 'grafana', 'linux admin', 
        'shell script', 'bash', 'yaml', 'nginx'],
      minCoreSkillsNeeded: 4
    },
    'cybersecurity': {
      jdTriggers: ['cybersecurity', 'security engineer', 'penetration test', 'soc analyst', 'security analyst',
        'vulnerability', 'threat', 'incident response', 'siem', 'ethical hack', 'information security', 'infosec', 'cyber security', 'network security'],
      coreSkills: ['penetration testing', 'pentest', 'vulnerability scan', 'firewall', 'siem', 'ids', 'ips', 'nmap', 'burp suite',
        'metasploit', 'wireshark', 'incident response', 'threat hunting', 'malware analysis', 'forensics', 'owasp', 'soc analyst', 
        'security audit', 'endpoint security', 'soc', 'kalilinux', 'wireshark', 'cybersecurity', 'information security'],
      minCoreSkillsNeeded: 4
    },
    'data_engineering': {
      jdTriggers: ['data engineer', 'etl', 'data pipeline', 'data warehouse', 'big data', 'spark engineer',
        'data platform', 'hadoop', 'snowflake engineer', 'databricks'],
      coreSkills: ['spark', 'hadoop', 'kafka', 'airflow', 'etl', 'data warehouse', 'redshift', 'bigquery',
        'snowflake', 'dbt', 'data pipeline', 'hive', 'presto', 'flink', 'databricks', 'nosql', 'sql server', 'pyspark'],
      minCoreSkillsNeeded: 4
    },
    'web_development': {
      jdTriggers: ['web developer', 'frontend', 'backend', 'fullstack', 'full stack', 'react developer', 'node developer', 'software engineer', 'web engineer'],
      coreSkills: ['javascript', 'typescript', 'react', 'node.js', 'express.js', 'html', 'css', 'sql', 'nosql', 'mongodb', 'rest api', 'git', 'github', 'responsive design'],
      minCoreSkillsNeeded: 3
    }
  };

  // Detect JD domain
  let detectedDomain = null;
  for (const [domain, config] of Object.entries(domainSignatures)) {
    if (config.jdTriggers.some(t => jdLower.includes(t))) {
      detectedDomain = domain;
      break;
    }
  }

  // --- HALLUCINATION & RELEVANCE FILTER ---
  // If the AI suggests missing skills that are actually generic domain names 
  // (like "Machine Learning" when the JD is for Web Dev), we scrub them.
  const domainTitles = ['Machine Learning', 'Data Science', 'Cybersecurity', 'Web Development', 'Data Engineering', 'Artificial Intelligence', 'Cyber Security'];
  if (data.keywords && Array.isArray(data.keywords.missing)) {
    data.keywords.missing = data.keywords.missing.filter(m => {
      const match = domainTitles.find(title => m.toLowerCase().includes(title.toLowerCase()));
      if (match) {
        // Only keep the domain title if it's the target domain
        const matchKey = match.toLowerCase().replace(/\s+/g, '_');
        return detectedDomain && (detectedDomain === matchKey || (detectedDomain === 'cybersecurity' && matchKey === 'cyber_security'));
      }
      return true;
    });
  }

  // If domain detected, check if resume has core skills for that domain
  if (detectedDomain) {
    const domainConfig = domainSignatures[detectedDomain];
    const coreSkillsFound = domainConfig.coreSkills.filter(skill => hasKeyword(resumeLow, skill)).length;
    
    console.log(`[Domain Check] Detected: ${detectedDomain} | Core Skills Found: ${coreSkillsFound}/${domainConfig.minCoreSkillsNeeded}`);

    if (coreSkillsFound < domainConfig.minCoreSkillsNeeded) {
      const capScore = (key, maxCap, reason) => {
        if (defaults.scores[key].score > maxCap) {
          defaults.scores[key].score = maxCap;
          defaults.scores[key].reason = reason;
        }
      };

      const domainLabel = detectedDomain.replace(/_/g, ' ');
      capScore('keyword_match', 30, `Resume lacks core ${domainLabel} keywords. Found only ${coreSkillsFound} out of ${domainConfig.minCoreSkillsNeeded} required core skills.`);
      capScore('skills_alignment', 30, `Technical skillset does not align with the specialized requirements of ${domainLabel}.`);
      
      const isStudent = /student|fresher|pre-final/i.test(defaults.candidate_experience_years);
      const expCap = isStudent ? 20 : 35;
      capScore('experience_match', expCap, `No demonstrable experience in the ${domainLabel} domain.`);

      // Programmatically inject missing core skills so the user sees them
      const missingCore = domainConfig.coreSkills.filter(skill => !hasKeyword(resumeLow, skill));
      if (!data.keywords) data.keywords = { found: [], missing: [], bonus: [] };
      if (!Array.isArray(data.keywords.missing)) data.keywords.missing = [];
      
      // Add top 5 missing core skills to the list (avoiding overwhelm)
      missingCore.slice(0, 8).forEach(m => {
        const readable = m.charAt(0).toUpperCase() + m.slice(1);
        if (!data.keywords.missing.includes(readable)) {
          data.keywords.missing.push(readable);
        }
      });

      // Inject specific ISSUES and PRO TIPS for domain mismatch
      defaults.issues.push({
        severity: 'critical',
        title: `Technical Domain Mismatch (${domainLabel})`,
        description: `The resume demonstrates strong skills in other areas, but lacks the specialized ${domainLabel} foundation required for professional roles in this domain.`
      });

      defaults.suggestions.push({
        priority: 'high',
        category: 'Experience & Certs',
        title: `Acquire ${domainLabel} Certifications`,
        action: `To bridge the technical gap, consider gaining industry-standard certifications such as ${detectedDomain === 'cybersecurity' ? 'CompTIA Security+, CEH, or CISSP-Associate' : detectedDomain === 'machine_learning' ? 'AWS Machine Learning Specialty or Google Professional ML Engineer' : 'relevant domain-specific certifications'} and building targeted projects.`
      });

      // Recalculate overall score
      const weights = {
        keyword_match: 0.25, skills_alignment: 0.20, format_ats: 0.15,
        experience_match: 0.15, impact_results: 0.15, education_match: 0.10
      };
      let recalc = 0;
      Object.keys(weights).forEach(k => { recalc += (defaults.scores[k].score * weights[k]); });
      finalScore = Math.round(recalc);
    }
  }

  const finalVerdict = finalScore >= 85 ? 'Excellent' : finalScore >= 75 ? 'Strong' : finalScore >= 60 ? 'Good' : finalScore > 40 ? 'Fair' : 'Poor';

  // --- PROGRAMMATIC REINFORCEMENT LAYER ---
  const found = Array.isArray(data?.keywords?.found) ? [...new Set(data.keywords.found.flatMap(k => typeof k === 'string' ? k.split(/[,;]/).map(s => s.trim()) : []).filter(Boolean))] : [];
  let missing = Array.isArray(data?.keywords?.missing) ? [...new Set(data.keywords.missing.flatMap(k => typeof k === 'string' ? k.split(/[,;]/).map(s => s.trim()) : []).filter(Boolean))] : [];
  const bonus = Array.isArray(data?.keywords?.bonus) ? [...new Set(data.keywords.bonus.flatMap(k => typeof k === 'string' ? k.split(/[,;]/).map(s => s.trim()) : []).filter(Boolean))] : [];

  const categoryMap = {
    'Databases': ['mysql', 'mongodb', 'postgresql', 'oracle', 'sql', 'nosql', 'firebase', 'sqlite', 'redis'],
    'Backend Frameworks': ['node.js', 'express.js', 'django', 'flask', 'spring boot', 'fastapi', 'rails', 'php', 'laravel'],
    'Frontend Frameworks': ['react', 'angular', 'vue', 'next.js', 'svelte', 'tailwind', 'bootstrap', 'material-ui', 'chakra-ui'],
    'Cloud/Infrastructure': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'vercel', 'heroku'],
    'Security Tools': ['nmap', 'wireshark', 'metasploit', 'burp suite', 'soc', 'siem', 'penetration testing', 'kali linux', 'firewall']
  };

  const resumeLower = resumeText.toLowerCase();
  const foundLower = found.map(f => f.toLowerCase());

  // 1. Force-Extraction Scanner (Bypasses AI if it missed a keyword in raw text)
  Object.values(categoryMap).flat().forEach(tech => {
    if (hasKeyword(resumeLower, tech) && !foundLower.some(f => f.includes(tech))) {
      found.push(tech.charAt(0).toUpperCase() + tech.slice(1)); // Auto-extract
      foundLower.push(tech);
    }
  });

  // 1.5 Truth-Check Missing Keywords against Resume Text
  const verifiedMissing = [];
  missing.forEach(m => {
    if (hasKeyword(resumeLower, m)) {
      // It's in the resume! The AI hallucinated it as missing, so we force-add it to found.
      if (!foundLower.includes(m.toLowerCase().trim())) {
        found.push(m);
        foundLower.push(m.toLowerCase().trim());
      }
    } else {
      verifiedMissing.push(m);
    }
  });

  // 2. Hierarchical Logic Enforcement (only process genuinely missing ones)
  const finalMissing = verifiedMissing.filter(m => {
    const mLower = m.toLowerCase().trim();
    for (const [cat, children] of Object.entries(categoryMap)) {
      if (mLower === cat.toLowerCase() || mLower.includes(cat.toLowerCase()) || cat.toLowerCase().includes(mLower)) {
        if (children.some(child => foundLower.some(f => f.includes(child)))) {
          // If they missed 'Databases' but have 'MySQL', then don't count 'Databases' as missing
          return false;
        }
      }
    }
    return !foundLower.includes(mLower);
  });

  return {
    ...defaults,
    ...data,
    overall_score: finalScore,
    verdict: finalVerdict,
    scores: defaults.scores,
    keywords: {
      found: [...new Set(found)],
      missing: [...new Set(finalMissing)],
      bonus: [...new Set(bonus)]
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
CRITICAL: You are an Expert Career Coach & Recruiter. You must score strictly, consistently, and FAIRLY using the rubrics below.

=== RUBRIC FOR EACH SCORE ===

KEYWORD MATCH RUBRIC (scoring for 'keyword_match'):
Count how many JD-required keywords/phrases appear verbatim in the resume.
- 90-100: 80%+ of JD keywords found in resume
- 75-89:  60-79% of JD keywords found
- 55-74:  40-59% of JD keywords found
- 30-54:  20-39% found
- 0-29:   Under 20% found
Synonyms and variations count (e.g., "ML" = "Machine Learning", "React.js" = "React").

ATS FORMAT RUBRIC (scoring for 'format_ats'):
100% INDEPENDENT of job description content. Score ONLY on structural integrity:
- 90-100: Has all standard sections (Education, Experience, Skills, Projects), clean parsable layout, complete contact info, consistent formatting
- 75-89:  Has most standard sections, good parsability, minor formatting issues
- 55-74:  Missing some sections OR has minor parsability issues (e.g., some icons, slight inconsistency)
- 30-54:  Missing key sections OR uses complex tables/multi-columns that break ATS parsers
- 0-29:   Severely broken format, no standard sections, completely unparsable
Most well-structured resumes should score 80+. A standard single-column resume with clear headers = minimum 85.

EXPERIENCE MATCH RUBRIC (scoring for 'experience_match'):
- 90-100: Years of experience meet/exceed JD requirement AND domain matches exactly
- 75-89:  Experience is close to requirement OR same domain but slightly fewer years
- 55-74:  Some relevant experience but different domain or significantly fewer years
- 30-54:  Minimal relevant experience
- 0-29:   No relevant experience
If JD doesn't specify years, score based on domain relevance of past roles/projects.

SKILLS ALIGNMENT RUBRIC (scoring for 'skills_alignment'):
- 90-100: Candidate has 80%+ of required technical skills AND core domain skills match
- 75-89:  Candidate has 60-79% of required skills, core skills present
- 55-74:  Candidate has 40-59% of required skills
- 30-54:  Under 40% skill overlap
- 0-29:   Almost no skill overlap
Consider BOTH listed skills AND skills demonstrated in project/experience descriptions.

EDUCATION MATCH RUBRIC (scoring for 'education_match'):
- B.Tech/B.E./M.Tech/MS in Computer Science, IT, ECE, or any Engineering = minimum 60 for ANY tech role
- Exact degree match (e.g., Cybersecurity degree for Cybersecurity role) = 90-100
- Related STEM degree (Physics, Math) = 40-60
- Unrelated degree (Arts, Commerce) for a tech role = 10-30
- NEVER give 0 for Education if candidate has B.Tech/B.E. in CSE/IT applying for any tech role

IMPACT & RESULTS RUBRIC (scoring for 'impact_results'):
- 90-100: Multiple quantified achievements (%, $, metrics) with clear business impact
- 75-89:  Some quantified results OR strong action verbs with clear project outcomes
- 55-74:  Describes responsibilities with some outcomes but lacks quantification
- 35-54:  Mostly lists duties without outcomes
- 0-34:   No evidence of impact
FOR STUDENTS/FRESHERS: Score based on project complexity, technologies used, and deployment evidence (GitHub links, Live links). Do NOT penalize for lacking corporate metrics.

=== RESPONSE FORMAT ===

Respond ONLY with a JSON object:
{
  "overall_score": (int),
  "verdict": "Excellent|Strong|Good|Fair|Poor",
  "summary": "A detailed 3-4 sentence recruiter-style evaluation. Start with the candidate's core strengths (e.g., education, specific technologies), then provide a clear, constructive critique of what they are missing (e.g., quantified achievements, domain-specific projects, or certification gaps).",
  "scores": {
    "keyword_match": {"score": (int), "reason": "...", "evidence": "..."},
    "format_ats": {"score": (int), "reason": "...", "evidence": "..."},
    "experience_match": {"score": (int), "reason": "...", "evidence": "..."},
    "skills_alignment": {"score": (int), "reason": "...", "evidence": "..."},
    "education_match": {"score": (int), "reason": "...", "evidence": "..."},
    "impact_results": {"score": (int), "reason": "...", "evidence": "..."}
  },
  "keywords": {
    "found":["Exact words/phrases verbatim in BOTH resume and JD."],
    "missing":["Exact words/phrases verbatim in JD but absent from Resume."],
    "bonus":["Extra skills in Resume NOT requested in JD (additional certs, languages, tools, etc)."]
  },
  "issues": [{"severity":"critical|warning|info", "title":"Concise issue title", "description":"Detailed explanation of the problem and its specific impact on the scorecard."}],
  "suggestions": [{"priority":"high|medium|low", "category":"Formatting|Keywords|Experience", "title":"Short improvement title", "action":"Specific, actionable step to fix the issue."}],
  "job_title_match": "Matched Job Title ONLY. Max 3 words. Example: 'Software Engineer'",
  "experience_years_required": "ONE short tag: 'Entry Level' | '1-2 Years' | '2-3 Years' | '3-5 Years' | '5+ Years' | '10+ Years' | 'Not Specified'",
  "candidate_experience_years": "ONE short tag: 'Current Student' | 'Pre-final Year' | 'Fresher' | '1-2 Years' | '2-3 Years' | '3-5 Years' | '5+ Years' | '10+ Years'"
}

=== LOGICAL RULES ===
1. If a technology is found in resume, it MUST NOT be listed as missing.
2. Synonyms count as matches (React = React.js, ML = Machine Learning, etc.)
3. Specific technologies satisfy general categories (MySQL found → "Databases" is NOT missing).
4. 'experience_years_required' and 'candidate_experience_years' MUST be SHORT TAGS ONLY (max 3 words).`;

async function analyzeWithGemini(resume, jd, modelName) {
  const prompt = `Evaluate this resume against the JD.
  MANDATORY RULES:
  1. STUDENT MODE: Grade 'Impact & Results' on project depth. Ignore corporate metrics for students.
  2. DECOUPLE ATS FORMAT: 'format_ats' is independent of job fit.
  3. DOMAIN PENALTY: Penalize if domain mismatch.
  4. RECRUITER MODE: Word choice influences impact score.
  5. EDUCATION RULE: B.Tech/B.E. in CSE/IT/ECE is ALWAYS relevant (min 60) for ANY tech role including Cybersecurity, Data Science, AI, Cloud, etc.
  RESUME: ${resume}
  JD: ${jd}
  ${SCHEMA_PROMPT}`;

  const model = genAI.getGenerativeModel({ model: modelName, generationConfig: { temperature: 0 } });
  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, '').trim();
  return normalizeAnalysis(JSON.parse(text), resume, jd);
}

async function analyzeWithGroq(resume, jd) {
  const prompt = `Evaluate this resume against the JD.
  MANDATORY RULES:
  1. STUDENT MODE: Grade on project depth.
  2. DECOUPLE ATS FORMAT: 'format_ats' is independent.
  3. EDUCATION RULE: B.Tech/B.E. in CSE/IT/ECE is ALWAYS relevant (min 60) for ANY tech role.
  RESUME: ${resume}
  JD: ${jd}
  ${SCHEMA_PROMPT}`;

  const chat = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: GROQ_MODEL,
    temperature: 0,
    response_format: { type: 'json_object' }
  });
  return normalizeAnalysis(JSON.parse(chat.choices[0].message.content), resume, jd);
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
      'gemini-1.5-flash-8b',
      'gemini-2.0-flash'
    ];

    let lastError = null;
    for (const m of models) {
      try {
        const data = await analyzeWithGemini(txt, jd, m);
        console.log(`✅ Success with ${m}`);
        return res.json({ success: true, data });
      } catch (e) {
        lastError = e.message || e;
        console.error(`❌ Gemini ${m} failed:`, lastError);
        if (lastError.includes('429') || lastError.includes('quota')) break;
      }
    }

    try {
      console.log(`📡 Falling back to Groq...`);
      const data = await analyzeWithGroq(txt, jd);
      return res.json({ success: true, data });
    } catch (e) {
      console.error('❌ Groq failed:', e.message || e);
      res.status(500).json({ error: 'AI models busy. Please wait 1-2 minutes.', details: lastError });
    }

  } catch (err) {
    console.error('System failure:', err);
    res.status(500).json({ error: 'System busy. Try again later.' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

const fs = require('fs');
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));
app.get('*', (req, res) => {
  const p = path.join(__dirname, '..', 'frontend', 'build', 'index.html');
  if (fs.existsSync(p)) res.sendFile(p);
  else res.json({ message: "API Live." });
});

app.listen(PORT, () => console.log(`🚀 API on ${PORT}`));
