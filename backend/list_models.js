const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './backend/.env' });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const models = await genAI.listModels();
    console.log(JSON.stringify(models, null, 2));
  } catch (e) {
    console.error('Error listing models:', e.message);
  }
}

listModels();
